import CanvasDrawer from 'panel/canvas/graph_canvas';
import cytoscape, { EdgeSingular, ElementDefinition, NodeSingular } from 'cytoscape';
import React, { PureComponent } from 'react';
import { PanelController } from '../PanelController';
import cyCanvas from 'cytoscape-canvas';
/* import cola from 'cytoscape-cola'; */
import dagre from 'cytoscape-dagre';
import layoutOptions from '../layout_options';
import { Statistics } from '../statistics/Statistics';
import _ from 'lodash';
import {
  TableContent,
  IntGraph,
  IntGraphNode,
  IntGraphEdge,
  PanelSettings,
  IntSelectionStatistics,
  TableMetric,
  ElementRef
} from 'types';
import { TemplateSrv, getTemplateSrv } from '@grafana/runtime';
import './ServiceDependencyGraph.css';

interface PanelState {
  zoom: number | undefined;
  animate: boolean | undefined;
  controller: PanelController;
  cy?: cytoscape.Core | undefined;
  graphCanvas?: CanvasDrawer | undefined;
  animateButtonClass?: string;
  showStatistics: boolean;
  data: IntGraph;
  settings: PanelSettings;
  layer: number | undefined;
  maxLayer: number;
  layerIncreaseFunction: any;
  layerDecreaseFunction: any;
  tableMetrics: TableMetric[];
}

cyCanvas(cytoscape);
cytoscape.use(dagre);

export class ServiceDependencyGraph extends PureComponent<PanelState, PanelState> {
  ref: any;

  selectionLabel: string;

  selectionRef: ElementRef;

  currentType: string;

  selectionStatistics: IntSelectionStatistics;

  receiving: TableContent[];

  sending: TableContent[];

  resolvedDrillDownLink: string;

  templateSrv: TemplateSrv;

  initResize = true;

  constructor(props: PanelState) {
    super(props);

    var animateButtonClass = 'fa fa-play-circle';
    if (props.animate) {
      animateButtonClass = 'fa fa-pause-circle';
    }

    this.state = {
      ...props,
      showStatistics: false,
      animateButtonClass: animateButtonClass,
      animate: props.animate,
    };

    this.ref = React.createRef();
    this.templateSrv = getTemplateSrv();

  }

    componentDidMount() {
    const cy: any = cytoscape({
      container: this.ref,
      zoom: this.state.zoom,
      elements: {
          nodes: [],
          edges: []
      },
      layout: {
        name: 'dagre',
      },
      style: [
        {
            selector: 'node',
            css: {
                'background-color': '#fbfbfb',
                'background-opacity': 0,
            },
        },

          {
              selector: 'node:parent',
              css: {
                  'background-opacity': 0.05,
                  shape: 'barrel',
              },
          },

        {
          selector: 'edge',
          style: {
              'curve-style': 'bezier',
              'control-point-step-size': 50,
              'line-color': 'transparent',
              'opacity': 0,
              'background-color': 'transparent',
              'overlay-color': 'transparent',
              'overlay-opacity': 0,
          },
        },
      ],
        wheelSensitivity: 0.125,
    });

        var graphCanvas = new CanvasDrawer(
            this,
            cy,
            cy.cyCanvas({
        zIndex: 1,
      })
    );

    cy.on('render cyCanvas.resize', () => {
      graphCanvas.repaint(true);
    });
        cy.on('select', 'edge', () => this.onSelectionChange('edge'));
        cy.on('unselect', 'edge', () => this.onSelectionChange('edge'));
        cy.on('select', 'node', () => this.onSelectionChange('node'));
        cy.on('unselect', 'node', () => this.onSelectionChange('node'));
    this.setState({
      cy: cy,
      graphCanvas: graphCanvas,
    });
    graphCanvas.start();

    if (this.state.animate) {
          graphCanvas.startAnimation();
    }
  }

    componentDidUpdate() {
    this._updateGraph(this.props.data);
  }

  _updateGraph(graph: IntGraph) {
        const cyNodes = this._transformNodes(graph.nodes);
    const cyEdges = this._transformEdges(graph.edges);

    const nodes = this.state.cy.nodes().toArray();
    const updatedNodes = this._updateOrRemove(nodes, cyNodes);

    // add new nodes
    this.state.cy.add(cyNodes);

    const edges = this.state.cy.edges().toArray();
    this._updateOrRemove(edges, cyEdges);

    // add new edges
    this.state.cy.add(cyEdges);

    if (this.initResize) {
      this.initResize = false;
      this.state.cy.resize();
      this.state.cy.reset();
      this.runLayout();
    } else {
      if (cyNodes.length > 0) {
        _.each(updatedNodes, (node) => {
          node.lock();
        });
        this.runLayout(true);
      }
    }
    this.state.graphCanvas.repaint(true);
  }

  _transformNodes(nodes: IntGraphNode[]): ElementDefinition[] {
    const cyNodes: ElementDefinition[] = _.map(nodes, (node) => {
      const result: ElementDefinition = {
        group: 'nodes',
        data: {
          id: node.data.id,
          type: node.data.type,
          external_type: node.data.external_type,
          parent: node.data.parent,
          layer: node.data.layer,
          label: node.data.label,
          metrics: {
            ...node.data.metrics,
          },
        },
      };
      return result;
    });

    return cyNodes;
  }

    _transformEdges(edges: IntGraphEdge[]): ElementDefinition[] {
        const cyEdges: ElementDefinition[] = _.map(edges, (edge: any) => {
      const cyEdge: ElementDefinition = {
        group: 'edges',
        data: {
          id: edge.data.id,
          source: edge.data.source,
          target: edge.data.target,
          label: edge.data.label,
          metrics: {
            ...edge.data.metrics,
          },
        },
      };

      return cyEdge;
    });

    return cyEdges;
  }

  _updateOrRemove(dataArray: Array<NodeSingular | EdgeSingular>, inputArray: ElementDefinition[]) {
    const elements: any[] = []; //(NodeSingular | EdgeSingular)[]
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

  onSelectionChange(elementType: 'node' | 'edge') {
    const selection = this.state.cy.$(':selected');

    if (selection.length === 1) {
      this.updateStatisticTable(elementType);
      this.setState({
        showStatistics: true,
      });
    } else {
      this.setState({
        showStatistics: false,
      });
    }
  }

  getSettings(resolveVariables: boolean): PanelSettings {
    return this.state.controller.getSettings(resolveVariables);
  }

  toggleAnimation() {
    var newValue = !this.state.animate;
    var animateButtonClass = 'fa fa-play-circle';
    if (newValue) {
      this.state.graphCanvas.startAnimation();
      animateButtonClass = 'fa fa-pause-circle';
    } else {
      this.state.graphCanvas.stopAnimation();
    }
    this.setState({
      animate: newValue,
      animateButtonClass: animateButtonClass,
    });
  }

  runLayout(unlockNodes = false) {
    const that = this;
    const options = {
      ...layoutOptions,
      stop: function () {
        if (unlockNodes) {
          that.unlockNodes();
        }
        that.setState({
          zoom: that.state.cy.zoom(),
        });
      },
    };

    this.state.cy.layout(options).run();
  }

  unlockNodes() {
    this.state.cy.nodes().forEach((node: { unlock: () => void }) => {
      node.unlock();
    });
  }

  fit() {
      const selection = this.state.graphCanvas.selectionNeighborhood;
      if (selection && !selection.empty()) {
          this.state.cy.fit(selection, 30);
      } else {
          this.state.cy.fit();
      }
      this.setState({
          zoom: this.state.cy.zoom(),
      });
  }

  zoom(zoom: number) {
    const zoomStep = 0.25 * zoom;
    const zoomLevel = Math.max(0.1, this.state.zoom + zoomStep);
    this.setState({
      zoom: zoomLevel,
    });
    this.state.cy.zoom(zoomLevel);
    this.state.cy.center();
  }

  updateStatisticTable(elementType: 'node' | 'edge') {
    const selection = this.state.cy.$(':selected');
    if (selection.length === 1) {
      const selectionId = selection[0].id().toString();
      this.selectionRef = elementType === 'node' ? { nodeId: selectionId }  : { connectionId: selectionId  }
      this.selectionLabel = selection[0].data().label
    }
  }

  getRelevantTableMetrics(): TableMetric[] {
      return this.state.tableMetrics.filter((tableMetric) => _.isEqual(tableMetric.tableMapping.elementRef, this.selectionRef))
  }

    render() {
    if (this.state.cy !== undefined) {
      this._updateGraph(this.props.data);
    }
    return (
      <div className="graph-container">
        <div className="service-dependency-graph">
          <div className="canvas-container" ref={(ref) => (this.ref = ref)}></div>
          <div className="zoom-button-container">
            <button className="btn navbar-button width-100" onClick={() => this.toggleAnimation()}>
              <i className={this.state.animateButtonClass}></i>
            </button>
            <button className="btn navbar-button width-100" onClick={() => this.runLayout()}>
              <i className="fa fa-sitemap"></i>
            </button>
            <button className="btn navbar-button width-100" onClick={() => this.fit()}>
              <i className="fa fa-dot-circle-o"></i>
            </button>
          </div>
        </div>
        <Statistics
          show={this.state.showStatistics}
          title={this.selectionLabel}
          tableMetrics={this.getRelevantTableMetrics()}
        />
      </div>
    );
  }
}
