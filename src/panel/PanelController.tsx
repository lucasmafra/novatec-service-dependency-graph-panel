import React, { LegacyRef, PureComponent } from 'react';
import {
  AbsoluteTimeRange,
  DataFrame,
  FieldConfigSource,
  InterpolateFunction,
  PanelProps,
  TimeRange,
} from '@grafana/data';
import { ServiceDependencyGraph } from './serviceDependencyGraph/ServiceDependencyGraph';
import _ from 'lodash';
import { CurrentData, CyData, IntGraphEdge, IntGraphNode, PanelSettings, TableMetric } from '../types';
import cytoscape, { EdgeSingular, NodeSingular } from 'cytoscape';
import '../css/novatec-service-dependency-graph-panel.css';
import GraphGenerator from 'processing/graph_generator';
import PreProcessor from 'processing/pre_processor';
import { getTableMetrics, isHealthyRow, elementThroughput } from 'processing/metrics_processor'
import { getTemplateSrv } from '@grafana/runtime';
import { EnGraphNodeType, ElementRef } from 'types';

interface Props extends PanelProps<PanelSettings> {}

interface PanelState {
  id: string | number;
  fieldConfig: FieldConfigSource<any>;
  height: number;
  width: number;
  onChangeTimeRange: (timeRange: AbsoluteTimeRange) => void;
  onFieldConfigChange: (config: FieldConfigSource<any>) => void;
  onOptionsChange: (options: PanelSettings) => void;
  renderCounter: number;
  replaceVariables: InterpolateFunction;
  timeRange: TimeRange;
  timeZone: string;
  title: string;
  transparent: boolean;
  options: PanelSettings;
  currentLayer: number;
}

export class PanelController extends PureComponent<Props, PanelState> {
  cy: cytoscape.Core | undefined;

  ref: LegacyRef<HTMLDivElement>;

  validQueryTypes: boolean;

  graphGenerator: GraphGenerator;

  preProcessor: PreProcessor;

  currentData: CurrentData;

  maxLayer = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      currentLayer: 0,
      ...props,
    };
    this.ref = React.createRef();
    this.graphGenerator = new GraphGenerator(this);
    this.preProcessor = new PreProcessor(this);
  }

    getSettings(resolveVariables: boolean): PanelSettings {
    if (resolveVariables) {
      return this.resolveVariables(this.props.options);
    }
    return this.props.options;
  }

  resolveVariables(element: any) {
    if (element instanceof Object) {
      const newObject: any = {};
      for (const key of Object.keys(element)) {
        newObject[key] = this.resolveVariables(element[key]);
      }
      return newObject;
    }

    if (element instanceof String || typeof element === 'string') {
      return getTemplateSrv().replace(element.toString());
    }
    return element;
  }

  resolveTemplateVars(input: any, copy: boolean) {
    var value = input;
    if (copy) {
      value = _.cloneDeep(value);
    }

    if (typeof value === 'string' || value instanceof String) {
      value = getTemplateSrv().replace(value.toString());
    }
    if (value instanceof Object) {
      for (const key of Object.keys(value)) {
        value[key] = this.resolveTemplateVars(value[key], false);
      }
    }
    return value;
  }

  componentDidUpdate() {
    // this.processData();
  }

  hasOnlyTableQueries(inputData: DataFrame[]) {
    var result = true;

    _.each(inputData, (dataElement) => {
      if (!_.has(dataElement, 'columns')) {
        result = false;
      }
    });

    return result;
  }

  _transformEdges(edges: IntGraphEdge[]): CyData[] {
    const cyEdges = _.map(edges, (edge) => {
      const cyEdge = {
        group: 'edges',
        data: {
          id: edge.source + ':' + edge.target,
          source: edge.source,
          target: edge.target,
          metrics: {
            ...edge.metrics,
          },
        },
      };
      return cyEdge;
    });

    return cyEdges;
  }

  _transformNodes(nodes: IntGraphNode[]): CyData[] {
    const cyNodes = _.map(nodes, (node) => {
      const result: CyData = {
        group: 'nodes',
        data: {
          id: node.data.id,
          type: node.data.type,
          external_type: node.data.external_type,
          namespace: node.data.namespace,
          layer: node.data.layer,
          parent: node.data.parent,
          metrics: {
            ...node.data.metrics,
          },
        },
      };
      return result;
    });

    return cyNodes;
  }

  _updateOrRemove(dataArray: Array<NodeSingular | EdgeSingular>, inputArray: CyData[]) {
    const elements: Array<NodeSingular | EdgeSingular> = [];
    for (let i = 0; i < dataArray.length; i++) {
      const element = dataArray[i];

      const cyNode = _.find(inputArray, { data: { id: element.id() } });

      if (cyNode) {
        element.data(cyNode.data);
        _.remove(inputArray, (n) => n.data.id === cyNode.data.id);
        elements.push(element);
      } else {
        element.remove();
      }
    }
    return elements;
  }

  getError(): string | null {
    if (!this.isDataAvailable()) {
      return 'No data available - Use the options panel to add nodes and connections.';
    }
    return null;
  }

  isDataAvailable() {
      const { nodes } = this.getSettings(true)
      return Object.values(nodes).length > 0
  }

  layer(layerIncrease: number) {
    const that = this;
    const currentLayer = that.state ? that.state.currentLayer : 0;
    var layer = Math.max(0, currentLayer + layerIncrease);
    if (layerIncrease > 0) {
      layer = Math.min(that.maxLayer, currentLayer + layerIncrease);
    }
    that.setState({
      currentLayer: layer,
    });
  }

    elementHealth(elementRef: ElementRef, tableMetrics: TableMetric[]) {
        const relevantTableMetrics = tableMetrics.filter((tableMetric) => _.isEqual(tableMetric.tableMapping.elementRef, elementRef))

        const healthyRows = relevantTableMetrics.map(t => t.rows.filter(isHealthyRow(t.thresholds)).length)
                                                .reduce((a, b) => a + b, 0)

        const totalRows = relevantTableMetrics.map(t => t.rows.length)
                                              .reduce((a, b) => a + b, 0)

        if (totalRows === 0) return 1
        return healthyRows / totalRows
    }

    render() {
        let { nodes, connections, tables, tableMappings, thresholds } = this.getSettings(true)

        nodes = Object.values(nodes)
        connections = Object.values(connections)
        tables = Object.values(tables)
        tableMappings = Object.values(tableMappings)
        thresholds = Object.values(thresholds)

      const tableMetrics = getTableMetrics(nodes, connections, tables, tableMappings, thresholds, this.props.data.series)

      const data = {
          nodes: nodes.map((node) => {
              const throughput = elementThroughput({ nodeId: node.id }, tableMetrics, tables)
              return {
                  data: {
                      id: node.id,
                      type: EnGraphNodeType.INTERNAL,
                      label: node.name,
                      layer: 0,
                      metrics: {
                          rate: throughput,
                          error_rate: throughput * (1 - this.elementHealth({ nodeId: node.id }, tableMetrics))
                      }
                  }
              }
          }),
          edges: connections.map(({ id, source, target, label }) => {
              const throughput = elementThroughput({ connectionId: id }, tableMetrics, tables)
              return {
                  source,
                  target,
                  data: {
                      id,
                      source,
                      target,
                      label,
                      metrics: {
                          rate: throughput,
                          error_rate: throughput * (1 - this.elementHealth({ connectionId: id }, tableMetrics))
                      }
                  }
              }
          })
      }

    const error = this.getError();

    if (error === null) {
      return (
        <div>
          <div
            className="service-dependency-graph-panel"
            style={{ height: this.props.height, width: this.props.width }}
            ref={this.ref}
            id="cy"
          >
            <ServiceDependencyGraph
              data={data}
              zoom={1}
              maxLayer={this.maxLayer}
              controller={this}
              animate={true}
              showStatistics={false}
              settings={this.props.options}
              layerIncreaseFunction={() => this.layer(+1)}
              layerDecreaseFunction={() => this.layer(-1)}
              layer={0}
              tableMetrics={tableMetrics}
            />
          </div>
        </div>
      );
    } else {
      return <div>{error}</div>;
    }
  }
}
