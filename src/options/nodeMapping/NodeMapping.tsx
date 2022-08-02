import React from 'react';
import { StandardEditorContext, StandardEditorProps } from '@grafana/data';
import { Node, PanelSettings } from '../../types';
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
  nodes: Node[];
}

export class NodeMapping extends React.PureComponent<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      ...props,
      nodes: [],
    };
  }

  addMapping() {
    const { path } = this.state.item;
    const nodes = this.state.context.options[path];
    nodes.push({ name: '', id: uuidv4() });
    this.state.onChange.call(path, nodes);
  }

  removeMapping(index: number) {
    const { path } = this.state.item;
    const nodes = this.state.context.options[path];
    nodes.splice(index, 1);
    this.state.onChange.call(path, nodes);
  }

  setNodeName(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    const { path } = this.state.item;
    const nodes = this.state.context.options[path];
    nodes[index].name = event.currentTarget.value;
    this.state.onChange.call(path, nodes);
  }

  render() {
    const { path } = this.state.item;
    let nodes = this.state.context.options[path];
    if (nodes === undefined) {
      nodes = this.state.item.defaultValue;
      const context = this.state.context;
      context.options[path] = this.state.item.defaultValue;
      this.setState({
        context: context,
      });
    }

    return (
      <div>
        <div>
          {nodes.map((node: Node, index: number) => (
              <div className="gf-form">
                <input
                  type="text"
                  className="input-small gf-form-input width-100"
                  placeholder="my-service"
                  value={node.name}
                  onChange={(e) => this.setNodeName(e, index)}
                />
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
          + Add Node
        </button>
      </div>
    );
  }
}
