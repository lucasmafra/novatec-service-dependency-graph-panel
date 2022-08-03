import React from 'react';
import { SortableTable } from './SortableTable';
import '../../css/novatec-service-dependency-graph-panel.css';
import './Statistics.css';
import { TableMetric } from '../../types';

interface StatisticsProps {
  show: boolean;
  selectionId: string | number;
  tableMetrics: TableMetric[]
}

export const Statistics: React.FC<StatisticsProps> = ({
    show,
    title,
    tableMetrics,
}) => {
  let statisticsClass = 'statistics';
  let statistics = <div></div>;
  if (show) {
    statisticsClass = 'statistics show ';

    statistics = (
        <div className="statistics">
        <div className="header--selection">
        {title}
        </div>
        { tableMetrics.length === 0 && (
            <div className="no-data--selection">{'No metrics available'}</div>
        )}

        {
            tableMetrics.map((tableMetric: TableMetric) => (
                <SortableTable
                    rows={tableMetric.rows}
                    noDataText="No results"
                    title={tableMetric.title}
                />
            ))
        }
        </div>
    );
  }
  return <div className={statisticsClass}>{statistics}</div>;
};
