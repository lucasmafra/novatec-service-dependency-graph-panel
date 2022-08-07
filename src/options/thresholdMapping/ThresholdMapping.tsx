import React from 'react';
import { StandardEditorContext, StandardEditorProps } from '@grafana/data';
import { Threshold, PanelSettings, Metric, ThresholdComparisor, ThresholdComparisorType } from '../../types';
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
    thresholds.push({ id: uuidv4() });
    this.state.onChange.call(path, thresholds);
  }

  removeThreshold(index: number) {
    const { path } = this.state.item;
    const thresholds = this.state.context.options[path];
    thresholds.splice(index, 1);
    this.state.onChange.call(path, thresholds);
  }

  setComparisor(event: React.ChangeEvent<HTMLSelectElement>, index: number) {
      const { path } = this.state.item;
      const thresholds = this.state.context.options[path];
      const comparisor = this.getComparisors().find((c) => c.type.toString() === event.currentTarget.value.toString());
      thresholds[index].comparisor = comparisor
      this.state.onChange.call(path, thresholds);
  }

    setMetricId(event: React.ChangeEvent<HTMLSelectElement>, index: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].metricId = event.currentTarget.value.toString();
        this.state.onChange.call(path, thresholds);
    }

    setValueField(event: React.ChangeEvent<HTMLSelectElement>, index: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].valueField = event.currentTarget.value.toString();
        this.state.onChange.call(path, thresholds);
    }

    setValue(event: React.ChangeEvent<HTMLInputElement>, index: number) {
        const { path } = this.state.item;
        const thresholds = this.state.context.options[path];
        thresholds[index].value = event.currentTarget.value.toString();
        this.state.onChange.call(path, thresholds);
    }

    getMetrics(): Metric[] {
        return this.state.context.options['metrics'];
    }

    getMetricFields(threshold: Threshold): string[] {
        const { data } = this.props.context;
        const queryId = this.getMetrics().find((m) => m.id === threshold.metricId)?.queryId
        const fields = data.find((dataFrame) => dataFrame.refId === queryId)?.fields
        if (!fields) return []
        return fields.filter((f) => f.type !== "time").map((f) => f.name)
    }

    getComparisors(): ThresholdComparisor[] {
        return [{
            type: ThresholdComparisorType.LESS_THAN,
            label: '<'
        }, {
            type: ThresholdComparisorType.LESS_THAN_OR_EQUAL_TO,
            label: '<='
        }, {
            type: ThresholdComparisorType.EQUAL_TO,
            label: '='
        }, {
            type: ThresholdComparisorType.GREATER_THAN_OR_EQUAL_TO,
            label: '>='
        }, {
            type: ThresholdComparisorType.GREATER_THAN,
            label: '>'
        }]
    }

    render() {
        const { path } = this.state.item;
        let thresholds = this.state.context.options[path];

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
                <div>
                    {thresholds.map((threshold: Threshold, index: number) => (
                        <div className="gf-form-inline">
                            <div className="gf-form width-100">
                                <label className="gf-form-label no-background no-padding-left width-half">Threshold</label>
                                <a className="gf-form-label tight-form-func no-background" onClick={() => this.removeThreshold(index)}>
                                    <i className="fa fa-trash"></i>
                                </a>
                            </div>
                            <div className="gf-form width-100">
                                <select
                                    className="input-small gf-form-input width-100"
                                    value={threshold.metricId}
                                    onChange={(e) => this.setMetricId(e, index)}
                                >
                                    <option value="" selected disabled hidden>Metric</option>
                                    {this.getMetrics().map((metric: Metric) => (
                                        <option key={metric.id} value={metric.id}>
                                            {metric.queryId}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="gf-form">

                                <select
                                    className="input-small gf-form-input"
                                    value={threshold.valueField}
                                    onChange={(e) => this.setValueField(e, index)}
                                >
                                    <option value="" selected disabled hidden>Value field</option>
                                    {this.getMetricFields(threshold).map((field: string) => (
                                        <option key={field} value={field}>
                                            {field}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="input-small gf-form-input"
                                    value={threshold.comparisor?.type}
                                    onChange={(e) => this.setComparisor(e, index)}
                                >
                                    <option value="" selected disabled hidden>Comparisor</option>
                                    {this.getComparisors().map((comparisor: ThresholdComparisor) => (
                                        <option key={comparisor.type} value={comparisor.type}>
                                            {comparisor.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="input-small gf-form-input"
                                    value={threshold.value}
                                    placeholder={"0.1"}
                                    onChange={(e) => this.setValue(e, index)}
                                />
                            </div>
                        </div>
                    ))}
            </div>
            <button
                className="btn navbar-button navbar-button--primary add-button"
                onClick={() => this.addThreshold()}
            >
                + Add Threshold
            </button>
            </div>
        );
    }
}
