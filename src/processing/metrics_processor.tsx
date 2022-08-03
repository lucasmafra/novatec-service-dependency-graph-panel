import {
    DataFrame,
} from '@grafana/data';
import * as _ from 'lodash'

import { TableMetric, ElementRef, Metric, TableRow, Connection, Node } from '../types';

function _dataFrameToTableRows(dataFrame: DataFrame): TableRow[] {
    const rows = new Array<TableRow>()
    for (let i = 0; i < dataFrame.length; i++) {
        rows.push(_.reduce(dataFrame.fields, (acc, field) => {
            return { ...acc, [field.name] : field.values.get(i) };
        }, {}))
    }
    return rows
}

function _getElementTableMetrics(elementRef: ElementRef, series: DataFrame[], metrics: Metric[]): TableMetric[] {
    const relevantMetrics = metrics.filter(({ mappedTo }) => {
        return  _.isEqual(mappedTo, elementRef)
    })

    return relevantMetrics.map((metric) => {
        const dataFrame = series.find(({ refId }) => refId === metric.queryId)
        return {
            metric: metric,
            title: metric.queryId, // TO-DO: allow user to set a metric label,
            rows: dataFrame ? _dataFrameToTableRows(dataFrame) : []
        }
    })
}

export function getTableMetrics(nodes: Node[], connections: Connection[], metrics: Metric[], series: DataFrame[]): TableMetric[] {
    const nodeMetrics = _.flatten(nodes.map(({ id }) => _getElementTableMetrics({ nodeId: id }, series, metrics )))
    const connectionMetrics = _.flatten(connections.map(({ id }) => _getElementTableMetrics({ connectionId: id }, series, metrics )))
    return [...nodeMetrics, ...connectionMetrics]
}
