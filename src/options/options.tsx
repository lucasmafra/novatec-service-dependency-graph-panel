import { PanelOptionsEditorBuilder } from '@grafana/data';
import { PanelSettings } from '../types';
import { NodeMapping } from './nodeMapping/NodeMapping';
import { ThresholdMapping } from './thresholdMapping/ThresholdMapping';
import { ConnectionMapping } from './connectionMapping/ConnectionMapping';
import { TableMapping } from './tableMapping/TableMapping';
import { Table } from './table/Table';
import { DefaultSettings } from './DefaultSettings';

export const optionsBuilder = (builder: PanelOptionsEditorBuilder<PanelSettings>) => {
  return (
    builder
        .addCustomEditor({
            path: 'nodes',
            id: 'nodeMapping',
            editor: NodeMapping,
            name: '',
            description: 'This setting controls which nodes should be added to the graph',
            category: ['Nodes'],
            defaultValue: DefaultSettings.nodes,
        })

      .addCustomEditor({
          path: 'connections',
          id: 'connectionMapping',
          editor: ConnectionMapping,
          name: '',
          description: 'This setting controls which connections should be added to the graph.',
          category: ['Connections'],
          defaultValue: DefaultSettings.connections,
      })

      .addCustomEditor({
          path: 'tables',
          id: 'table',
          editor: Table,
          name: '',
          description: 'This setting controls which tables should be added',
          category: ['Tables'],
          defaultValue: DefaultSettings.tables,
      })
      .addCustomEditor({
          path: 'tableMappings',
          id: 'tableMapping',
          editor: TableMapping,
          name: '',
          description: 'This setting controls which tables mappings should be added',
          category: ['Table Mappings'],
          defaultValue: DefaultSettings.tableMappings,
      })
    .addCustomEditor({
        path: 'thresholds',
        id: 'thresholdMapping',
        editor: ThresholdMapping,
        name: '',
        description: 'This setting controls which threshold should be applied to metrics.',
        category: ['Thresholds'],
        defaultValue: DefaultSettings.thresholds,
    })
  );
};
