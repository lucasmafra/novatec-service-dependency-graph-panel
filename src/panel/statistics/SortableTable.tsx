import React from 'react';
import { IntTableHeader, TableRow, Threshold, CellHealthState } from '../../types';
import { Tooltip, Icon } from '@grafana/ui'
import BootstrapTable from 'react-bootstrap-table-next';
import { getCellHealthState, getCellRelevantThresholds } from 'processing/metrics_processor'

interface SortableTableProps {
  rows: TableRow[];
  title: string;
  noDataText: string;
  thresholds: Threshold[]
}

function sort(a: string, b: string, order: string) {
  if (order === 'asc') {
    return Number(a) - Number(b);
  }
  return Number(b) - Number(a);
}

const cellHealthStateToBackgroundColor = {
    [CellHealthState.HEALTHY]: 'green',
    [CellHealthState.UNHEALTHY]: 'red',
    [CellHealthState.UNKNOWN]: 'transparent'
}

function _thresholdsTooltip(thresholds: Threshold[]) {
    return (
        <div>
            {thresholds.map((t) => (
                <span>Threshold: {t.field} {t.comparisor.label} {t.value}</span>
            ))}
        </div>
    )
}

function getTableHeaders(rows: TableRow[], thresholds: Threshold[]): IntTableHeader[] {
    if (rows.length === 0) {
        return []
    }
    return Object.keys(rows[0]).map((column) => ({
        text: column,
        dataField: column,
        sort: true,
        formatter: (cell: any, row: any) => {
            const healthState = getCellHealthState(column, cell, row, thresholds)
            const relevantThresholds = getCellRelevantThresholds(column, cell, row, thresholds)
            const background = cellHealthStateToBackgroundColor[healthState]
            if (healthState === CellHealthState.UNKNOWN) {
                return (
                    <div style={{ background,
                                  height: '100%',
                                  minHeight: 27,
                                  width: '100%',
                                  padding: '3px 5px' }}>
                        {cell || '-'}
                    </div>
                )
            }
            return (
                <div style={{ background,
                              height: '100%',
                              minHeight: 27,
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '3px 5px' }}>
                    <div>{cell || '-'}</div>
                    <Tooltip content={_thresholdsTooltip(relevantThresholds)}>
                        <Icon name="info-circle" style={{ marginLeft: 4 }} />
                    </Tooltip>
                </div>
            )
        }
    }))

}

export const SortableTable: React.FC<SortableTableProps> = ({ rows, title, noDataText, thresholds }) => {
    const tableHeaders = getTableHeaders(rows, thresholds)

    tableHeaders.forEach(function (value, i) {
        value.classes = 'table--td--selection';
        if (i !== 0) {
            value.sortFunc = (a: string, b: string, order: string, _dataField: any, _rowA: any) => {
                return sort(a, b, order);
            };
        }
    });

    return (
        <div>
            <div className="secondHeader--selection">{title}</div>
            {rows.length > 0 ?
                           (
                               <BootstrapTable
                                   keyField="name"
                                   data={rows}
                                   columns={tableHeaders}
                                   classes="table--selection"
                                   headerClasses="table--selection table--selection--head"
                               />
                           ) : (<div className="no-data--selection">{noDataText}</div>)
            }
        </div>
    );
};

export default SortableTable;
