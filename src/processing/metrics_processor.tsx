import {
    DataFrame,
} from '@grafana/data';
import supportedThresholds from '../options/thresholdMapping/supportedThresholds';
import { CellHealthState }  from 'types'
import * as _ from 'lodash'
import { TableMetric, ElementRef, TableFilter, TableRow, Connection, Node, Threshold, ITable, ITableMapping, ThresholdFilter } from '../types';

function _roundTo2DecimalPlaces(value: any) {
    if (typeof value === "number") {
        return value.toFixed(2)
    }
    return value
}

function _fieldBelongsToTable(table: ITable, fieldName: string): boolean {
    return Object.values(table.fields).includes(fieldName)
}

function _notOverridingRow(row: any, fieldName: string): boolean {
    return !row[fieldName]
}

function _matchesFilters(dataFrame: DataFrame, index: number, filters: TableFilter[]): boolean {
    const validFilters = filters.filter((f) => f.fieldName.trim().length && f.fieldRegex.trim().length)
    return validFilters.map((filter) => {
        const field = dataFrame.fields.find((f) => (f.config?.displayName || f.name) === filter.fieldName)
        if (!field) return false

        const fieldValue = field.values.get(index)
        if (!fieldValue || typeof fieldValue !== "string") return false

        return fieldValue.match(new RegExp(filter.fieldRegex))
    }).every(Boolean)
}

function _seriesToTableRows(series: DataFrame[], tableMapping: ITableMapping, table: ITable): TableRow[] {
    const rows = new Array<TableRow>()

    series.forEach((dataFrame) => {
        for (let i = 0; i < dataFrame.length; i++) {
            if (_matchesFilters(dataFrame, i, Object.values(tableMapping.filters))) {
                rows.push(_.reduce(dataFrame.fields, (row: any, field) => {
                    const fieldName = field.config?.displayName || field.name
                    const fieldValue = _roundTo2DecimalPlaces(field.values.get(i))

                    if (_fieldBelongsToTable(table, fieldName) && _notOverridingRow(row, fieldName)) {
                        return { ...row, [fieldName] : fieldValue };
                    }

                    return row
                }, {}))
            }
        }
    })

    const tableRows = _.uniqWith(rows, _.isEqual)

    return tableRows
}

export function seriesToJSON(series: DataFrame[]) {
    const rows = new Array<TableRow>()
    series.forEach((dataFrame) => {
        for (let i = 0; i < dataFrame.length; i++) {
            rows.push(_.reduce(dataFrame.fields, (row: any, field) => {
                const fieldName = field.config?.displayName || field.name
                const fieldValue = _roundTo2DecimalPlaces(field.values.get(i))
                return { ...row, [fieldName] : fieldValue };
            }, {}))
        }
    })
    console.log('seriesJSON', JSON.stringify(rows))
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

export function getElementHealth(elementRef: ElementRef, tableMetrics: TableMetric[]) {
    const relevantTableMetrics = tableMetrics.filter((tableMetric) => _.isEqual(tableMetric.tableMapping.elementRef, elementRef))

    let healthyCells = 0
    let unhealthyCells = 0

    relevantTableMetrics.forEach((t) => {
        t.rows.forEach((r) => {
            Object.entries(r).forEach(([field, value]) => {
                const cellHealth = getCellHealthState(field, value, r, t.thresholds)
                if (cellHealth === CellHealthState.HEALTHY) {
                    healthyCells++
                } else if (cellHealth === CellHealthState.UNHEALTHY) {
                    unhealthyCells++
                }
            })
        })
    })

    if (healthyCells + unhealthyCells === 0) return 1

    return healthyCells / (healthyCells + unhealthyCells)
}
