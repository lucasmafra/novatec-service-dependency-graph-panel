import { PanelOptionsEditorBuilder } from '@grafana/data';
import { PanelSettings } from '../types';
import { IconMapping } from './iconMapping/IconMapping';
import { NodeMapping } from './nodeMapping/NodeMapping';
import { ThresholdMapping } from './thresholdMapping/ThresholdMapping';
import { ConnectionMapping } from './connectionMapping/ConnectionMapping';
import { TableMapping } from './tableMapping/TableMapping';
import { Table } from './table/Table';
import { DummyDataSwitch } from './dummyDataSwitch/DummyDataSwitch';
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

      //General Settings
      .addBooleanSwitch({
        path: 'showConnectionStats',
        name: 'Show Connection Statistics',
        category: ['General Settings'],
        defaultValue: DefaultSettings.showConnectionStats,
      })

      .addBooleanSwitch({
        path: 'sumTimings',
        name: 'Handle Timings as Sums',
        description:
          'If this setting is active, the timings provided' +
          'by the mapped response time columns are considered as a ' +
          'continually increasing sum of response times. When ' +
          'deactivated, it is considered that the timings provided ' +
          'by columns are the actual average response times.',
        category: ['General Settings'],
        defaultValue: DefaultSettings.sumTimings,
      })

      .addBooleanSwitch({
        path: 'filterEmptyConnections',
        name: 'Filter Empty Data',
        description:
          'If this setting is active, the timings provided by ' +
          'the mapped response time columns are considered as a continually ' +
          'increasing sum of response times. When deactivated, it is considered ' +
          'that the timings provided by columns are the actual average response times.',
        category: ['General Settings'],
        defaultValue: DefaultSettings.filterEmptyConnections,
      })

      .addBooleanSwitch({
        path: 'showDebugInformation',
        name: 'Show Debug Information',
        category: ['General Settings'],
        defaultValue: DefaultSettings.showDebugInformation,
      })

      .addCustomEditor({
        path: 'dataMapping',
        id: 'dummyDataSwitch',
        name: 'Show Dummy Data',
        editor: DummyDataSwitch,
        category: ['General Settings'],
        defaultValue: DefaultSettings.dataMapping,
      })

      .addBooleanSwitch({
        path: 'showBaselines',
        name: 'Show Baselines',
        category: ['General Settings'],
        defaultValue: DefaultSettings.showBaselines,
      })

      .addSelect({
        path: 'timeFormat',
        name: 'Maximum Time Unit to Resolve',
        description:
          'This setting controls to which time unit time values will be resolved to. ' +
          'Each value always includes the smaller units.',
        category: ['General Settings'],
        settings: {
          options: [
            { value: 'ms', label: 'ms' },
            { value: 's', label: 's' },
            { value: 'm', label: 'm' },
          ],
        },
        defaultValue: DefaultSettings.timeFormat,
      })

      //Appearance
      .addColorPicker({
        path: 'style.healthyColor',
        name: 'Healthy Color',
        category: ['Appearance'],
        defaultValue: DefaultSettings.style.healthyColor,
      })

      .addColorPicker({
        path: 'style.dangerColor',
        name: 'Danger Color',
        category: ['Appearance'],
        defaultValue: DefaultSettings.style.dangerColor,
      })

      .addColorPicker({
        path: 'style.noDataColor',
        name: 'No Data Color',
        category: ['Appearance'],
        defaultValue: DefaultSettings.style.noDataColor,
      })

      //Icon Mapping
      .addCustomEditor({
        path: 'icons',
        id: 'iconMapping',
        editor: IconMapping,
        name: '',
        description:
          'This setting controls which images should be mapped to your directly monitored nodes. ' +
          'The node names are matched by the regex pattern provided in the "Target Name(Regex) column.',
        category: ['Icon Mapping'],
        defaultValue: DefaultSettings.icons,
      })

      //External Icon Mapping
      .addCustomEditor({
        path: 'externalIcons',
        id: 'externalIconMapping',
        editor: IconMapping,
        name: '',
        description:
          'This setting controls which images should be mapped to the external nodes. ' +
          'The given type column is matched by the regex pattern provided in the "Target Name(Regex) column.',
        category: ['External Icon Mapping'],
        defaultValue: DefaultSettings.externalIcons,
      })
  );
};
