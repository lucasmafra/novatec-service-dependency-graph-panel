import React from 'react';
import { StandardEditorContext, StandardEditorProps } from '@grafana/data';
import { Metric, Node, Connection, PanelSettings } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface Props extends StandardEditorProps<string, PanelSettings> {
    item: any;
  value: any;
  onChange: (value?: string) => void;
  context: StandardEditorContext<any>;
}

interface State {
  item: any;
  value: string;
  onChange: (value?: string) => void;
  context: StandardEditorContext<any>;
  metrics: Metric[];
}

export class MetricMapping extends React.PureComponent<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      ...props,
      metrics: [],
    };
  }

  addMapping() {
    const { path } = this.state.item;
    const metrics = this.state.context.options[path];
    metrics.push({ id: uuidv4() });
    this.state.onChange.call(path, metrics);
  }

  removeMapping(index: number) {
    const { path } = this.state.item;
    const metrics = this.state.context.options[path];
    metrics.splice(index, 1);
    this.state.onChange.call(path, metrics);
  }

  setMappedTo(event: React.ChangeEvent<HTMLSelectElement>, index: number) {
    const { path } = this.state.item;
    const elementId = event.currentTarget.value.toString()
    const metrics = this.state.context.options[path];
    const nodeIds = this.getNodes().map((n) => n.id)
    const connectionIds = this.getConnections((c) => c.id)
    metrics[index].mappedTo = nodeIds.includes(elementId) ? { nodeId: elementId  } : { connectionId: elementId };
    this.state.onChange.call(path, metrics);
  }

  setQueryId(event: React.ChangeEvent<HTMLSelectElement>, index: number) {
      const { path } = this.state.item;
      const metrics = this.state.context.options[path];
      metrics[index].queryId = event.currentTarget.value.toString();
      this.state.onChange.call(path, metrics);
  }

    getMetricMappedElementId(metric: Metric): string | undefined {
        if (metric.mappedTo && 'nodeId' in metric.mappedTo) {
            return metric.mappedTo.nodeId
        } else if (metric.mappedTo && 'connectionId' in metric.mappedTo) {
            return metric.mappedTo.connectionId
        }
        return undefined;
    }

    getNodes(): Node[] {
        return this.state.context.options['nodes'];
    }

    getConnections(): Connection[] {
        return this.state.context.options['connections'];
    }

    getQueries() {
        const { data } = this.props.context;
        return data.map(({ refId }) => refId).filter((refId: string | undefined) => refId)
    }

    render() {
        const { path } = this.state.item;
        let metrics = this.state.context.options[path];

        if (metrics === undefined) {
            metrics = this.state.item.defaultValue;
            const context = this.state.context;
            context.options[path] = this.state.item.defaultValue;
            this.setState({
                context: context,
            });
        }

        return (
            <div>
                <div className="gf-form-inline">
                    <div className="gf-form width-100">
                        <label className="gf-form-label no-background no-padding-left width-half">Node</label>
                        <label className="gf-form-label no-background no-padding-left width-half">Query</label>
                    </div>
                </div>
                <div>
                    {metrics.map((metric: Metric, index: number) => (
                        <div className="gf-form">
                            <select
                                className="input-small gf-form-input"
                                value={this.getMetricMappedElementId(metric)}
                                onChange={(e) => this.setMappedTo(e, index)}
                            >
                                <option value="" selected disabled hidden>Choose node or connection</option>
                                <optgroup label="Nodes">
                                    {this.getNodes().map((node: Node) => (
                                        <option key={node.id} value={node.id}>
                                            {node.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Connections">
                                    {this.getConnections().map((connection: Connection) => (
                                        <option key={connection.id} value={connection.id}>
                                            {connection.label}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <select
                                className="input-small gf-form-input"
                                value={metric.queryId}
                                onChange={(e) => this.setQueryId(e, index)}
                            >
                                <option value="" selected disabled hidden>Choose element</option>
                                {this.getQueries().map((query: string) => (
                                    <option key={query} value={query}>
                                        {query}
                                    </option>
                                ))}
                            </select>
                            <a className="gf-form-label tight-form-func no-background" onClick={() => this.removeMapping(index)}>
                                <i className="fa fa-trash"></i>
                            </a>
                        </div>
                    ))}
                </div>
                <button
                    className="btn navbar-button navbar-button--primary add-button"
                    onClick={() => this.addMapping()}
                >
                    + Add Metric
                </button>
            </div>
        );
    }
}
