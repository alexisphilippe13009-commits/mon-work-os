// app/types/index.ts

export type ColumnType = 
  | 'status' | 'text' | 'people' | 'numbers' | 'date' | 'timeline' 
  | 'rating' | 'files' | 'formula' | 'progress' | 'check' | 'priority' 
  | 'country' | 'phone' | 'email' | 'name';

export interface Column {
  id: string;
  title: string;
  type: ColumnType;
  width: number;
  settings?: {
    labels?: Record<string, string>; // { "Done": "#00c875" }
    unit?: string;
    format?: string;
  }; 
  fixed?: boolean;
}

export interface Item {
  id: string;
  name: string;
  values: Record<string, any>; // Flexible data storage
  subitems?: Item[];
  updates_count?: number;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  items: Item[];
  collapsed: boolean;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  groups: Group[];
  favorited: boolean;
  workspace_id?: string; // <--- AJOUTÉ ICI (avec un ? pour dire optionnel)
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}