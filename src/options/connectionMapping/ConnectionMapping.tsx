import React, { ChangeEvent } from 'react';
import { StandardEditorContext, StandardEditorProps } from '@grafana/data';
import { Connection, Node,  PanelSettings } from '../../types';
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
  connections: Connection[];
}

export class ConnectionMapping extends React.PureComponent<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      ...props,
      connections: [],
    };
  }

  addMapping() {
    const { path } = this.state.item;
    const connections = this.state.context.options[path];
    connections.push({ id: uuidv4() });
    this.state.onChange.call(path, connections);
  }

  removeMapping(index: number) {
    const { path } = this.state.item;
    const connections = this.state.context.options[path];
    connections.splice(index, 1);
    this.state.onChange.call(path, connections);
  }

  setSource(event: React.ChangeEvent<HTMLSelectElement>, index: number) {
    const { path } = this.state.item;
    const connections = this.state.context.options[path];
    connections[index].source = event.currentTarget.value.toString();
    this.state.onChange.call(path, connections);
    this.setLabel(connections[index].source, connections[index].target, index)
  }


  getConnectionLabel(source: string, target: string): string {
      const nodes = this.state.context.options['nodes'];
      const sourceLabel = nodes.find((n: Node) => n.id === source).name
      const targetLabel = nodes.find((n: Node) => n.id === target).name
      return `${sourceLabel}_to_${targetLabel}`
  }

  setLabel(source: string, target: string, index: number) {
    const { path } = this.state.item;
    const connections = this.state.context.options[path];
    connections[index].label = this.getConnectionLabel(source, target);
    this.state.onChange.call(path, connections);
  }

  setTarget(event: ChangeEvent<HTMLSelectElement>, index: number) {
    const { path } = this.state.item;
    const connections = this.state.context.options[path];
    connections[index].target = event.currentTarget.value.toString();
    this.props.onChange.call(path, connections);
    this.setLabel(connections[index].source, connections[index].target, index)
  }

    render() {
      const { path } = this.state.item;
      let connections = this.state.context.options[path];
        const nodes = this.state.context.options['nodes'];
        if (connections === undefined) {
            connections = this.state.item.defaultValue;
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
                      <label className="gf-form-label no-background no-padding-left width-half">From</label>
                      <label className="gf-form-label no-background no-padding-left width-half">To</label>
                  </div>
              </div>
              <div>
                  {connections.map((connection: Connection, index: number) => (
                      <div className="gf-form">
                          <select
                              className="input-small gf-form-input"
                              value={connection.source}
                              onChange={(e) => this.setSource(e, index)}
                          >
                              <option value="" selected disabled hidden>Choose node</option>
                              {nodes.map((node: Node) => (
                                  <option key={node.id} value={node.id}>
                                      {node.name}
                                  </option>
                              ))}
                          </select>
                          <select
                              className="input-small gf-form-input"
                              value={connection.target}
                              onChange={(e) => this.setTarget(e, index)}
                          >
                              <option value="" selected disabled hidden>Choose node</option>
                              {nodes.map((node: Node) => (
                                  <option key={node.id} value={node.id}>
                                      {node.name}
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
                  + Add Connection
              </button>
          </div>
      );
  }
}
