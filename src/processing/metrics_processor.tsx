import {
    DataFrame,
} from '@grafana/data';
import supportedThresholds from '../options/thresholdMapping/supportedThresholds';
import * as _ from 'lodash'

import { TableMetric, ElementRef, TableFilter, TableRow, Connection, Node, Threshold, ITable, ITableMapping, ThresholdFilter } from '../types';

function _applyFiltersToRows(rows: TableRow[], filters: TableFilter[]): TableRow[] {
    const validFilters = filters.filter((f) => f.fieldName.trim().length && f.fieldRegex.trim().length)
    return validFilters.reduce((acc, filter) => {
        return [...acc.filter((r: any) => typeof r[filter?.fieldName] === "string" ? r[filter.fieldName].match(new RegExp(filter.fieldRegex)) : true)]
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
            rows.push(_.reduce(dataFrame.fields, (acc, field) => {
                if (Object.values(table.fields).includes(field.config?.displayName || field.name)) {
                    return { ...acc, [field.config?.displayName || field.name] : _roundTo2DecimalPlaces(field.values.get(i)) };
                }
                return acc
            }, {}))
        }
    })
    return _applyFiltersToRows(rows, Object.values(tableMapping.filters))
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
            thresholds: relevantThresholds
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
