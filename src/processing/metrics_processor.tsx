import {
    DataFrame,
} from '@grafana/data';
import supportedThresholds from '../options/thresholdMapping/supportedThresholds';
import * as _ from 'lodash'

import { TableMetric, ElementRef, Metric, TableRow, Connection, Node, Threshold } from '../types';

function _dataFrameToTableRows(dataFrame: DataFrame): TableRow[] {
    const rows = new Array<TableRow>()
    for (let i = 0; i < dataFrame.length; i++) {
        rows.push(_.reduce(dataFrame.fields.filter((field) => field.type !== "time"), (acc, field) => {
            return { ...acc, [field.name] : field.values.get(i) };
        }, {}))
    }
    return rows
}

function _getElementTableMetrics(elementRef: ElementRef, series: DataFrame[], metrics: Metric[], thresholds: Threshold[]): TableMetric[] {
    const relevantMetrics = metrics.filter(({ mappedTo }) => {
        return  _.isEqual(mappedTo, elementRef)
    })

    const relevantThresholds = thresholds.filter((t) => relevantMetrics.find((metric) => metric.id === t.metricId))

    return relevantMetrics.map((metric) => {
        const dataFrame = series.find(({ refId }) => refId === metric.queryId)
        return {
            metric: metric,
            title: metric.queryId, // TO-DO: allow user to set a metric label,
            rows: dataFrame ? _dataFrameToTableRows(dataFrame) : [],
            thresholds: relevantThresholds
        }
    })
}

export function getTableMetrics(nodes: Node[], connections: Connection[], metrics: Metric[], thresholds: Threshold[], series: DataFrame[]): TableMetric[] {
    const nodeMetrics = _.flatten(nodes.map(({ id }) => _getElementTableMetrics({ nodeId: id }, series, metrics, thresholds )))
    const connectionMetrics = _.flatten(connections.map(({ id }) => _getElementTableMetrics({ connectionId: id }, series, metrics, thresholds)))
    return [...nodeMetrics, ...connectionMetrics]
}


export function isHealthyRow(thresholds: Threshold[]) {
    return (row: any) =>
        thresholds.map((threshold) => ({ ...threshold, comparisor: supportedThresholds.find(t => t.type === threshold.comparisor.type) }))
                  .map((threshold) => !threshold.comparisor.exceeds(row[threshold.valueField], threshold.value))
                  .every(Boolean)
}
