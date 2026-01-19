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

// --- DASHBOARD TYPES ---
export interface Widget {
  id: string;
  type: 'battery' | 'numbers' | 'chart' | 'calendar' | 'gantt' | 'workload' | 'activity';
  title: string;
  layout: { x: number; y: number; w: number; h: number }; // Pour la grille
  settings: {
    sourceBoardIds: string[]; // LINKER TOUT ENSEMBLE
    columnIds?: string[];
    aggregation?: 'sum' | 'count' | 'average';
  };
}

export interface Dashboard {
  id: string;
  name: string;
  type: 'dashboard'; // Distinguer Board vs Dashboard
  widgets: Widget[];
  favorited: boolean;
}

export interface View {
  id: string;
  type: 'table' | 'kanban' | 'gantt' | 'dashboard' | 'calendar' | 'form';
  name: string;
}

// Unifié pour gérer soit un Board soit un Dashboard dans la sidebar
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
}