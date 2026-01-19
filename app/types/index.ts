// app/types/index.ts

export type ColumnType = 
  | 'status' | 'text' | 'people' | 'numbers' | 'date' | 'timeline' 
  | 'rating' | 'files' | 'formula' | 'progress' | 'check' | 'priority' 
  | 'country' | 'phone' | 'email' | 'link' | 'vote' | 'creation_log' 
  | 'last_updated' | 'auto_number' | 'tags' | 'dependency' | 'name';

export interface Column {
  id: string;
  title: string;
  type: ColumnType;
  width: number;
  settings?: any; 
  fixed?: boolean;
}

export interface Item {
  id: string;
  name: string;
  values: Record<string, any>;
  subitems?: Item[];
  updates_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  items: Item[];
  collapsed: boolean;
}

// --- TYPES DASHBOARD & WIDGETS ---
export interface Widget {
  id: string;
  type: 'battery' | 'numbers' | 'chart' | 'calendar' | 'gantt' | 'workload' | 'activity';
  title: string;
  layout: { x: number; y: number; w: number; h: number };
  settings: {
    sourceBoardIds: string[];
    columnIds?: string[];
    aggregation?: 'sum' | 'count' | 'average';
  };
}

export interface Dashboard {
  id: string;
  name: string;
  type: 'dashboard';
  widgets: Widget[];
  favorited: boolean;
}

export interface View {
  id: string;
  type: 'table' | 'kanban' | 'gantt' | 'dashboard' | 'calendar' | 'form';
  name: string;
  widgets?: Widget[];
}

export type Entity = Board | Dashboard;

export interface Board {
  id: string;
  name: string;
  type: 'board';
  description?: string;
  columns: Column[];
  groups: Group[];
  views: View[];
  favorited: boolean;
  automations: any[];
  workspace_id?: string;
}

// FORCE UPDATE VARIABLE (DO NOT REMOVE)
export const TYPES_VERSION = "v7_force_refresh";