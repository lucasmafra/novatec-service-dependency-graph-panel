import React from 'react';
import { DataFrame, Field, SelectableValue, StandardEditorContext, StandardEditorProps } from '@grafana/data';
import { Select, HorizontalGroup, Button, InlineField, Input, IconButton } from '@grafana/ui';
import { ITable, Node, Connection, PanelSettings, ITableMapping, ElementRef } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash'

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
  tableMappings: TableMapping[];
}

export class TableMapping extends React.PureComponent<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      ...props,
      tableMappings: [],
    };
  }

  addTableMapping() {
    const { path } = this.state.item;
    const tableMappings = this.state.context.options[path];
    tableMappings.push({ id: uuidv4(), filters: [] });
    this.state.onChange.call(path, tableMappings);
  }

  removeTableMapping(index: number) {
    const { path } = this.state.item;
    const tableMappings = this.state.context.options[path];
    tableMappings.splice(index, 1);
    this.state.onChange.call(path, tableMappings);
  }

    getAllFields(): string[] {
        const { data } = this.props.context;
        return _.uniqWith(_.flatten(data.map((dataFrame: DataFrame) => dataFrame.fields)).map((field: Field) => field.config?.displayName || field.name), _.isEqual)
    }

    getTables(): ITable[] {
        return this.state.context.options['tables']
    }

    setTableId(selected: SelectableValue, index: number) {
        const { path } = this.state.item;
        const tableMappings = this.state.context.options[path];
        tableMappings[index].tableId = selected.value
        this.state.onChange.call(path, tableMappings);
    }

    setElementRef(selected: SelectableValue, index: number) {
        const { path } = this.state.item;
        const tableMappings = this.state.context.options[path];
        const selectedValue = selected.value.split(':')[0] === 'node' ? { nodeId:  selected.value.split(':')[1] } : { connectionId : selected.value.split(':')[1]  }
        tableMappings[index].elementRef = selectedValue
        this.state.onChange.call(path, tableMappings);
    }

    getNodes(): Node[] {
        return this.state.context.options['nodes']
    }

    getConnections(): Connection[] {
        return this.state.context.options['connections']
    }

    addFilter(index: number) {
        const { path } = this.state.item;
        const tableMappings = this.state.context.options[path];
        tableMappings[index].filters.push({ fieldName: '', fieldRegex: ''})
        this.state.onChange.call(path, tableMappings);
    }

    setFilterField(selected: SelectableValue, index: number, filterIndex: number) {
      const { path } = this.state.item;
      const tableMappings = this.state.context.options[path];
      tableMappings[index].filters[filterIndex].fieldName = selected.value
      this.state.onChange.call(path, tableMappings);
  }

    setFilterRegex(event: React.FormEvent<HTMLInputElement>, index: number, filterIndex: number) {
        const { path } = this.state.item;
        const tableMappings = this.state.context.options[path];
        tableMappings[index].filters[filterIndex].fieldRegex = event.currentTarget.value.toString();
        this.state.onChange.call(path, tableMappings);
    }

    removeFilter(index: number, filterIndex: number) {
        const { path } = this.state.item;
        const tableMappings = this.state.context.options[path];
        tableMappings[index].filters.splice(filterIndex, 1);
        this.state.onChange.call(path, tableMappings);
    }

    elementRefToValueId(elementRef: ElementRef) {
        let result: string = undefined
        if (!elementRef)  {
            result = ''
        } else if ('nodeId' in elementRef) {
            result = `node:${elementRef.nodeId}`
        } else {
            result =  `connection:${elementRef.connectionId}`
        }

        return result
    }
    render() {
        const { path } = this.state.item;
        let tableMappings = this.state.context.options[path];

        if (tableMappings === undefined) {
            tableMappings = this.state.item.defaultValue;
            const context = this.state.context;
            context.options[path] = this.state.item.defaultValue;
            this.setState({
                context: context,
            });
        }

        return (
            <div>
                {tableMappings.map((tableMapping: ITableMapping, index: number) => (
                    <>
                        <div className="gf-form-inline" style={{ marginTop: 16 }}>
                            <div className="gf-form">
                                <div className="gf-form-label">Select table</div>
                                <Select
                                    options={this.getTables().map((table) => ({
                                        label: table.label,
                                        value: table.id,
                                    }))}
                                    value={tableMapping.tableId}
                                    onChange={(e) => this.setTableId(e, index)}
                                />
                            </div>
                        </div>
                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <div className="gf-form-label">Select element</div>
                                <Select
                                    options={[{
                                        label: "Nodes",
                                        options: this.getNodes().map((n) => ({
                                            label: n.name,
                                            value: `node:${n.id}`
                                        }))
                                    }, {
                                        label: "Connections",
                                        options: this.getConnections().map((c) => ({
                                            label: c.label,
                                            value: `connection:${c.id}`
                                        }))
                                    }]}
                                    value={this.elementRefToValueId(tableMapping?.elementRef)}
                                    onChange={(e) => this.setElementRef(e, index)}
                                />
                            </div>
                        </div>
                        <div className="gf-form-inline">
                            <h6 style={{ height: 32, display: 'flex', alignItems: 'center' }}>Filters</h6>
                            <div style={{ height: 32, display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                                <IconButton
                                    variant="primary"
                                    size="sm"
                                    name="plus-circle"
                                    onClick={() => this.addFilter(index) }
                                />
                            </div>
                        </div>
                        {tableMapping.filters.map((filter, filterIndex) => (
                            <div className="gf-form-inline">
                                <div className="gf-form gf-form--grow">
                                    <HorizontalGroup spacing="xs" align="flex-start">
                                        <InlineField label="Field">
                                            <Select
                                                options={this.getAllFields().map((field) => ({
                                                    label: field,
                                                    value: field,
                                                }))}
                                                value={filter.fieldName}
                                                onChange={(e) => this.setFilterField(e, index, filterIndex)}
                                            />
                                        </InlineField>
                                        <InlineField label="Regex">
                                            <Input
                                                placeholder={'regex pattern'}
                                                value={filter.fieldRegex}
                                                onChange={(e) => this.setFilterRegex(e, index, filterIndex)}
                                            />
                                        </InlineField>
                                        <div style={{ height: 36, display: 'flex', alignItems: 'center' }}>
                                            <IconButton
                                                size="sm"
                                                name="minus-circle"
                                                variant="destructive"
                                                onClick={() => this.removeFilter(index, filterIndex) }
                                            />
                                        </div>
                                    </HorizontalGroup>
                                </div>
                            </div>
                        ))}
                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <Button
                                    className="tiny-button"
                                    size="xs"
                                    variant="destructive"
                                    onClick={() => this.removeTableMapping(index) }
                                    icon={'trash-alt'}>Remove table mapping</Button>
                            </div>
                        </div>
                    </>
                ))}
                <Button
                    style={{marginTop: 32}}
                    size="xs"
                    variant="primary"
                    icon={'plus'}
                    onClick={() => this.addTableMapping()}
                >
                    Add table mapping
                </Button>
            </div>
        );
    }
}
