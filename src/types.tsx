export interface PanelSettings {
  animate: boolean;
  sumTimings: boolean;
  filterEmptyConnections: boolean;
  style: PanelStyleSettings;
  showDebugInformation: boolean;
  showConnectionStats: boolean;
  externalIcons: ExternalIconResource[];
  serviceIcons: IconResource[];
  dataMapping: DataMapping;
  showDummyData: boolean;
  drillDownLink: string;
  showBaselines: boolean;
  columns: string[];
};

export interface DataMapping {
  sourceComponentPrefix: string;
  targetComponentPrefix: string;

  responseTimeColumn: string;
  requestRateColumn: string;
  errorRateColumn: string;
  responseTimeOutgoingColumn: string;
  requestRateOutgoingColumn: string;
  errorRateOutgoingColumn: string;

  extOrigin: string;
  extTarget: string;
  type: string;
  showDummyData: boolean;

  baselineRtUpper: string;
};

export interface PanelStyleSettings {
  healthyColor: string;
  dangerColor: string;
  unknownColor: string;
}

export interface IconResource {
  pattern: string;
  filename: string;
}

export interface ExternalIconResource {
  pattern: string;
  filename: string;
}

export interface QueryResponseColumn {
  type?: string;
  text: string;
};

export interface QueryResponse {
  columns: QueryResponseColumn[];
  refId?: string;
  meta?: string;
  rows: any[];
};

export interface CyData {
  group: string;
  data: {
      id: string;
      source?: string;
      target?: string;
      metrics: IGraphMetrics;
      type?: string;
      external_type?: string;
  }
};

export interface CurrentData {
  graph: GraphDataElement[];
  raw: QueryResponse[];
  columnNames: string[];
}

export interface GraphDataElement {
  source?: string;
  target: string;
  data: DataElement;
  type: GraphDataType;
};

export interface DataElement {
  rate_in?: number;
  rate_out?: number;
  response_time_in?: number;
  response_time_out?: number;
  error_rate_in?: number;
  error_rate_out?: number;
  type?: string;
  threshold?: number;
};

export enum GraphDataType {
  SELF = 'SELF',
  INTERNAL = 'INTERNAL',
  EXTERNAL_OUT = 'EXTERNAL_OUT',
  EXTERNAL_IN = 'EXTERNAL_IN'
};

export interface IGraph {
  nodes: IGraphNode[],
  edges: IGraphEdge[]
};

export interface IGraphNode {
  name: string;
  type: EGraphNodeType;
  metrics?: IGraphMetrics;
  external_type?: string;
  data: IGraphNodeData;
};

export interface IGraphNodeData {
  name: string;
  id: string;
  type: EGraphNodeType;
  metrics?: IGraphMetrics;
  external_type?: string;
};

export interface IGraphMetrics {
  rate?: number;
  error_rate?: number;
  response_time?: number;
  success_rate?: number;
  threshold?: number;
};

export enum EGraphNodeType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
};

export interface IGraphEdge {
  source: string;
  target: string;
  data: IGraphEdgeData;
  metrics?: IGraphMetrics;
};

export interface IGraphEdgeData {
  source: string;
  target: string;
  metrics?: IGraphMetrics;
};

export interface Particle {
  velocity: number;
  startTime: number;
};

export interface Particles {
  normal: Particle[];
  danger: Particle[];
};


export interface TableContent {
  name: string;
  responseTime: string;
  rate: string;
  error: string;
};

export interface ISelectionStatistics {
  requests?: number;
  errors?: number;
  responseTime?: number;
  threshold?: number;
  thresholdViolation?: boolean;
};

export interface CyCanvas {
  getCanvas: () => HTMLCanvasElement;
  clear: (arg0: CanvasRenderingContext2D) => void;
  resetTransform: (arg0: CanvasRenderingContext2D) => void;
  setTransform: (arg0: CanvasRenderingContext2D) => void;
};
