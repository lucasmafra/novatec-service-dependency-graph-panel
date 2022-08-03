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
        if ('connectionId' in elementRef && elementRef.connectionId === '3f78c7d1-92ef-4701-ab7e-291f27f9ad0c') {
            console.log('HERE connection id', elementRef.connectionId)
            console.log('mappedTo', mappedTo)
            console.log('elementRef', elementRef)
        }
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
    console.log('connections', connections)
    const connectionMetrics = _.flatten(connections.map(({ id }) => _getElementTableMetrics({ connectionId: id }, series, metrics )))
    return [...nodeMetrics, ...connectionMetrics]
}
