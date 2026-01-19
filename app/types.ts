export type ColumnType = 
  | 'status' | 'text' | 'people' | 'numbers' | 'date' | 'timeline' 
  | 'rating' | 'files' | 'formula' | 'progress' | 'check' | 'world_clock' 
  | 'phone' | 'email' | 'vote' | 'country' | 'name';

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
  updates?: any[];
  collapsed?: boolean;
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
  views: any[];
  automations: any[];
  favorited: boolean;
}