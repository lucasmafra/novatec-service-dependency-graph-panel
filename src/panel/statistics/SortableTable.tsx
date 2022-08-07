import React from 'react';
import { IntTableHeader, TableRow, Threshold } from '../../types';
import BootstrapTable from 'react-bootstrap-table-next';
import { isHealthyRow } from 'processing/metrics_processor'

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

function getTableHeaders(rows: TableRow[]): IntTableHeader[] {
    if (rows.length === 0) {
        return []
    }
    return Object.keys(rows[0]).map((column) => ({
        text: column,
        dataField: column,
        sort: true
    }))

}

export const SortableTable: React.FC<SortableTableProps> = ({ rows, title, noDataText, thresholds }) => {
    const tableHeaders = getTableHeaders(rows)

    tableHeaders.forEach(function (value, i) {
        value.classes = 'table--td--selection';
        if (i !== 0) {
            value.sortFunc = (a: string, b: string, order: string, _dataField: any, _rowA: any) => {
                return sort(a, b, order);
            };
        }
    });

    const rowStyle = (row: any) => {
        if (!isHealthyRow(thresholds)(row)) {
            return { backgroundColor: 'red' }
        }
        return { }
    };

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
                                   rowStyle={rowStyle}
                                   headerClasses="table--selection table--selection--head"
                               />
                           ) : (<div className="no-data--selection">{noDataText}</div>)
            }
        </div>
    );
};

export default SortableTable;
