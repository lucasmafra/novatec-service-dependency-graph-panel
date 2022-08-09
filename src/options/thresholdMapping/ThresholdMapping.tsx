import React from 'react';
import { StandardEditorContext, StandardEditorProps, SelectableValue, Field, DataFrame } from '@grafana/data';
import { Button, HorizontalGroup, InlineField, Select, IconButton, Input } from '@grafana/ui';
import { Threshold, PanelSettings, ITable } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import supportedThresholds from './supportedThresholds';
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
  thresholds: Threshold[];
}

export class ThresholdMapping extends React.PureComponent<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      ...props,
      thresholds: [],
    };
  }

  addThreshold() {
    const { path } = this.state.item;
    const thresholds = this.state.context.options[path];
    thresholds.push({ id: uuidv4(), filters: [] });
    this.state.onChange.call(path, thresholds);
  }

  removeThreshold(index: number) {
    const { path } = this.state.item;
    const thresholds = this.state.context.options[path];
    thresholds.splice(index, 1);
    this.state.onChange.call(path, thresholds);
  }

  setComparisor(selected: SelectableValue, index: number) {
      const { path } = this.state.item;
      const thresholds = this.state.context.options[path];
      const comparisor = supportedThresholds.find((c) => c.type.toString() === selected.value.toString());
      thresholds[index].comparisor = { ...comparisor, exceeds: (a: any, b: any) => comparisor.exceeds(a, b) }
      this.state.onChange.call(path, thresholds);
  }

    setValue(event: React.FormEvent<HTMLInputElement>, index: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].value = event.currentTarget.value.toString();
        this.state.onChange.call(path, thresholds);
    }

    getTables(): ITable[] {
        return this.state.context.options['tables']
    }

    setTableId(selected: SelectableValue, index: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].tableId = selected.value
        this.state.onChange.call(path, thresholds);
    }

    getTable(tableId: string): ITable {
        const tables = this.getTables()
        return tables.find((table) => table.id === tableId)
    }

    setField(selected: SelectableValue, index: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].field = selected.value
        this.state.onChange.call(path, thresholds);
    }

    getAllFields(): string[] {
        const { data } = this.props.context;
        return _.flatten(data.map((dataFrame: DataFrame) => dataFrame.fields)).map((field: Field) => field.config?.displayName || field.name)
    }

    addFilter(index: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].filters.push({ fieldName: '', fieldRegex: ''})
        this.state.onChange.call(path, thresholds);
    }

    setFilterField(selected: SelectableValue, index: number, filterIndex: number) {
      const { path } = this.state.item;
      const thresholds = this.state.context.options[path];
      thresholds[index].filters[filterIndex].fieldName = selected.value
      this.state.onChange.call(path, thresholds);
  }

    setFilterRegex(event: React.FormEvent<HTMLInputElement>, index: number, filterIndex: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].filters[filterIndex].fieldRegex = event.currentTarget.value.toString();
        this.state.onChange.call(path, thresholds);
    }

    removeFilter(index: number, filterIndex: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].filters.splice(filterIndex, 1);
        this.state.onChange.call(path, thresholds);
    }

    render() {
        const { path } = this.state.item;
        let thresholds: Threshold[] = this.state.context.options[path];

        if (thresholds === undefined) {
            thresholds = this.state.item.defaultValue;
            const context = this.state.context;
            context.options[path] = this.state.item.defaultValue;
            this.setState({
                context: context,
            });
        }

                return (
                    <div>
                        {thresholds.map((threshold: Threshold, index: number) => (
                            <>
                                <div className="gf-form-inline" style={{ marginTop: 16 }}>
                                    <div className="gf-form">
                                        <div className="gf-form-label width-8">Select table</div>
                                        <Select
                                            className="width-18"
                                            options={this.getTables().map((table) => ({
                                                label: table.label,
                                                value: table.id,
                                            }))}
                                            value={threshold.tableId}
                                            onChange={(e) => this.setTableId(e, index)}
                                        />
                                    </div>
                                </div>
                                <div className="gf-form-inline">
                                    <div className="gf-form">
                                        <div className="gf-form-label width-8">Field</div>
                                        <Select
                                            className="width-18"
                                            options={this.getTable(threshold.tableId)?.fields.map((f) => ({
                                                value: f, label: f
                                            }) )}
                                            value={threshold.field}
                                            onChange={(e) => this.setField(e, index)}
                                        />
                                    </div>
                                </div>
                                <div className="gf-form-inline">
                                    <div className="gf-form">
                                        <div className="gf-form-label width-8">Value</div>
                                        <Select
                                            className="width-18"
                                            options={supportedThresholds.map((comparisor) => ({
                                                value: comparisor.type, label: comparisor.label
                                            }) )}
                                            value={threshold.comparisor?.type}
                                            onChange={(e) => this.setComparisor(e, index)}
                                        />
                                        <Input
                                            placeholder={'value'}
                                            value={threshold.value}
                                            onChange={(e) => this.setValue(e, index)}
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
                                {threshold.filters.map((filter, filterIndex) => (
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
                                            onClick={() => this.removeThreshold(index) }
                                            icon={'trash-alt'}>Remove threshold</Button>
                                    </div>
                                </div>
                            </>
                        ))}
                        <Button
                            style={{marginTop: 32}}
                            size="xs"
                            variant="primary"
                            icon={'plus'}
                            onClick={() => this.addThreshold()}
                        >
                            Add threshold
                        </Button>
                    </div>
                );

    }
}
