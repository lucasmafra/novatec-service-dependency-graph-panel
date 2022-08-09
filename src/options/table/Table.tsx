import React from 'react';
import { DataFrame, Field, StandardEditorContext, StandardEditorProps } from '@grafana/data';
import { FilterPill, HorizontalGroup, Input, Button } from '@grafana/ui';
import { ITable, PanelSettings } from '../../types';
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
  tables: Table[];
}

export class Table extends React.PureComponent<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      ...props,
      tables: [],
    };
  }

  addTable() {
    const { path } = this.state.item;
    const tables = this.state.context.options[path];
    tables.push({ id: uuidv4(), fields: [] });
    this.state.onChange.call(path, tables);
  }

  removeTable(index: number) {
    const { path } = this.state.item;
    const tables = this.state.context.options[path];
    tables.splice(index, 1);
    this.state.onChange.call(path, tables);
  }

    getAllFields(): string[] {
        const { data } = this.props.context;
        return _.flatten(data.map((dataFrame: DataFrame) => dataFrame.fields)).map((field: Field) => field.config?.displayName || field.name)
    }

    onFieldToggle(field: string, index: number) {
        const { path } = this.state.item;
        const tables = this.state.context.options[path];
        const fields = tables[index].fields
        if (fields.indexOf(field) == -1) {
            tables[index].fields.push(field)
        } else {
            tables[index].fields = fields.filter((f: string) => f !== field)
        }
        this.state.onChange.call(path, tables);
    }

    setLabel(event: React.FormEvent<HTMLInputElement>, index: number) {
        const { path } = this.state.item;
        const tables = this.state.context.options[path];
        tables[index].label = event.currentTarget.value.toString();
        this.state.onChange.call(path, tables);
    }

    render() {
        const { path } = this.state.item;
        let tables = this.state.context.options[path];

        if (tables === undefined) {
            tables = this.state.item.defaultValue;
            const context = this.state.context;
            context.options[path] = this.state.item.defaultValue;
            this.setState({
                context: context,
            });
        }


        return (
            <div>
                {tables.map((table: ITable, index: number) => (
                    <>
                        <div className="gf-form-inline" style={{ marginTop: 8 }}>
                            <div className="gf-form">
                                <div className="gf-form-label width-8">Table name</div>
                                <Input
                                    className="width-18"
                                    value={table.label}
                                    placeholder={'label'}
                                    onChange={(e) => this.setLabel(e, index)}
                                />
                            </div>
                        </div>
                        <div className="gf-form-inline">
                            <div className="gf-form gf-form--grow">
                                <div className="gf-form-label width-8">Fields</div>
                                <HorizontalGroup spacing="xs" align="flex-start" wrap>
                                    {this.getAllFields().map((field, i) => {
                                        return (
                                            <FilterPill
                                                key={`${field}/${i}`}
                                                onClick={() => {
                                                    this.onFieldToggle(field, index);
                                                }}
                                                label={field}
                                                selected={table.fields.includes(field)}
                                            />
                                        );
                                    })}
                                </HorizontalGroup>
                            </div>
                        </div>
                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <Button
                                    className="tiny-button"
                                    size="xs"
                                    variant="destructive"
                                    onClick={() => this.removeTable(index) }
                                    icon={'trash-alt'}>Remove table</Button>
                            </div>
                        </div>
                    </>
                ))}
                <Button
                    style={{marginTop: 32}}
                    size="xs"
                    variant="primary"
                    icon={'plus'}
                    onClick={() => this.addTable()}
                >
                    Add table
                </Button>
            </div>
        );
    }
}
