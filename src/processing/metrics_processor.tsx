import {
    DataFrame,
} from '@grafana/data';
import supportedThresholds from '../options/thresholdMapping/supportedThresholds';
import { CellHealthState }  from 'types'
import * as _ from 'lodash'

import { TableMetric, ElementRef, TableFilter, TableRow, Connection, Node, Threshold, ITable, ITableMapping, ThresholdFilter } from '../types';


function _applyFiltersToRows(rows: TableRow[], filters: TableFilter[]): TableRow[] {
    const validFilters = filters.filter((f) => f.fieldName.trim().length && f.fieldRegex.trim().length)
    return validFilters.reduce((acc, filter) => {
        return [...acc.filter((r: any) => {
            if (!r[filter.fieldName]) return false
            return r[filter.fieldName].toString().match(new RegExp(filter.fieldRegex))
        })]
    }, rows)
}

function _roundTo2DecimalPlaces(value: any) {
    if (typeof value === "number") {
        return value.toFixed(2)
    }
    return value
}

function _seriesToTableRows(series: DataFrame[], tableMapping: ITableMapping, table: ITable): TableRow[] {
    const rows = new Array<TableRow>()
    series.forEach((dataFrame) => {
        for (let i = 0; i < dataFrame.length; i++) {
            rows.push(_.reduce(dataFrame.fields, (acc: any, field) => {
                if (!acc[field.config?.displayName || field.name] && Object.values(table.fields).includes(field.config?.displayName || field.name)) {
                    return { ...acc, [field.config?.displayName || field.name] : _roundTo2DecimalPlaces(field.values.get(i)) };
                }
                return acc
            }, {}))
        }
    })

    const tableRows = _.uniqWith((_applyFiltersToRows(rows, Object.values(tableMapping.filters))), _.isEqual)

    return tableRows
}

function _getElementTableMetrics(elementRef: ElementRef, series: DataFrame[], tables: ITable[], tableMappings: ITableMapping[], thresholds: Threshold[]): TableMetric[] {
    const relevantTableMappings = tableMappings.filter((tableMapping) => {
        return  _.isEqual(tableMapping.elementRef, elementRef)
    })

    return relevantTableMappings.map((tableMapping) => {
        const table = tables.find((table) => table.id === tableMapping.tableId)
        const relevantThresholds = thresholds.filter((t) => t.tableId === table.id)
        return {
            tableMapping: tableMapping,
            title: table.label,
            rows: _seriesToTableRows(series, tableMapping, table),
            thresholds: relevantThresholds.map((threshold) => ({ ...threshold, comparisor: supportedThresholds.find(t => t.type === threshold.comparisor?.type) }))
        }
    })
}

export function getTableMetrics(nodes: Node[], connections: Connection[], tables: ITable[], tableMappings: ITableMapping[], thresholds: Threshold[], series: DataFrame[]): TableMetric[] {
    const nodeMetrics = _.flatten(nodes.map(({ id }) => _getElementTableMetrics({ nodeId: id }, series, tables, tableMappings, thresholds )))
    const connectionMetrics = _.flatten(connections.map(({ id }) => _getElementTableMetrics({ connectionId: id }, series, tables, tableMappings, thresholds)))
    return [...nodeMetrics, ...connectionMetrics]
}


function _isRowMatch(row: any, filters: ThresholdFilter[]): boolean {
    return filters.map((filter) => {
        if (filter.fieldName.trim().length === 0) { // ignore empty filters
            return true
        }
        return row[filter.fieldName] && row[filter.fieldName].match(new RegExp(filter.fieldRegex))
    }).every(Boolean)
}

export function isHealthyRow(thresholds: Threshold[]) {
    return (row: any) =>
        thresholds.map((threshold) => ({ ...threshold, comparisor: supportedThresholds.find(t => t.type === threshold.comparisor?.type) }))
                  .map((threshold) => {
                      if (!threshold.comparisor) return true
                      if (_isRowMatch(row, Object.values(threshold.filters))) {
                          const exceeds = threshold.comparisor.exceeds(row[threshold.field], threshold.value)
                          return !exceeds
                      } else {
                          return true
                      }
                  })
                  .every(Boolean)
}

export function getCellHealthState(field: string, value: string, row: any, thresholds: Threshold[]): CellHealthState  {
    const relevantThresholds = thresholds.filter((t) => t.field === field).filter((t) => _isRowMatch(row, Object.values(t.filters))).filter((t) => t.comparisor)

    if (relevantThresholds.length === 0 || !value) { return CellHealthState.UNKNOWN }

    if (relevantThresholds.map((t) => !t.comparisor.exceeds(value, t.value)).every(Boolean)) {
        return CellHealthState.HEALTHY
    }

    return CellHealthState.UNHEALTHY
}

export function getCellRelevantThresholds(field: string, value: string, row: any, thresholds: Threshold[]): Threshold[]  {
    return thresholds.filter((t) => t.field === field).filter((t) => _isRowMatch(row, Object.values(t.filters))).filter((t) => t.comparisor)
}

export function elementThroughput(elementRef: ElementRef, tableMetrics: TableMetric[], tables: ITable[]): number {
    const relevantTableMetrics = tableMetrics.filter((tableMetric) => _.isEqual(tableMetric.tableMapping.elementRef, elementRef))

    const tableSum = (acc: number, current: TableMetric): number => {
        const table = tables.find((t) => t.id === current.tableMapping.tableId)

        if (!table?.throughputField) { return acc }

        return current.rows.reduce((rowsSum: number, row: any): number => {
            const rowThroughput: number = parseFloat(row[table.throughputField] || '0')
            return rowsSum + rowThroughput
        }, 0)
    }

    return relevantTableMetrics.reduce(tableSum, 0)

}
