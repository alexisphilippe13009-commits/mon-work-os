// app/page.tsx
'use server'

import { loadFromCloud } from '@/app/actions';
import { ClientWrapper } from '@/components/ClientWrapper'; 
import { Board, Dashboard, Entity } from '@/app/types';

// --- DONNÉES ENTERPRISE (Avec Gantt & Dashboard) ---

// 1. Un Dashboard Global
const DASHBOARD_MAIN: Dashboard = {
  id: 'd_exec', type: 'dashboard', name: 'Executive Overview', favorited: true,
  widgets: [
      { id: 'w1', type: 'numbers', title: 'Global Budget', layout: {x:0, y:0, w:1, h:1}, settings: { sourceBoardIds: ['b_dev', 'b_mkt'], aggregation: 'sum' } },
      { id: 'w2', type: 'battery', title: 'Health Status', layout: {x:1, y:0, w:1, h:1}, settings: { sourceBoardIds: ['b_dev'] } },
      { id: 'w3', type: 'chart', title: 'Workload', layout: {x:2, y:0, w:2, h:1}, settings: { sourceBoardIds: ['b_dev'] } },
      { id: 'w4', type: 'workload', title: 'Team Capacity', layout: {x:0, y:1, w:2, h:2}, settings: { sourceBoardIds: ['b_dev'] } },
      { id: 'w5', type: 'activity', title: 'Recent Activity', layout: {x:2, y:1, w:2, h:2}, settings: { sourceBoardIds: [] } }
  ]
};

// 2. Un Tableau complexe avec GANTT
const BOARD_DEV: Board = {
  id: 'b_dev', type: 'board', name: 'Product Roadmap 2026', favorited: true,
  views: [
      {id:'v1', type:'table', name:'Main Table'}, 
      {id:'v2', type:'gantt', name:'Gantt Timeline'}, // <--- LA VUE GANTT EST ICI
      {id:'v3', type:'dashboard', name:'Board Analytics'}
  ],
  automations: [],
  columns: [
    { id: 'c_feat', title: 'Feature', type: 'name', width: 300, fixed: true },
    { id: 'c_status', title: 'Status', type: 'status', width: 140, settings: { labels: { 'Done': '#00c875', 'Working': '#fdab3d', 'Stuck': '#e2445c', 'Critical': '#333333' } } },
    { id: 'c_timeline', title: 'Timeline', type: 'timeline', width: 190 },
    { id: 'c_dep', title: 'Dependency', type: 'dependency', width: 120 },
    { id: 'c_owner', title: 'Owner', type: 'people', width: 100 }
  ],
  groups: [
    { id: 'g1', name: 'Q1 Core Features', color: '#0073ea', collapsed: false, items: [
        { id: 'i1', name: 'Database Architecture', values: { c_status: 'Done', c_timeline: {start:'2026-01-01', end:'2026-01-10'}, c_owner:['Alex'] } },
        { id: 'i2', name: 'API Development', values: { c_status: 'Working', c_timeline: {start:'2026-01-11', end:'2026-01-25'}, c_dep: ['i1'], c_owner:['Sarah'] } },
        { id: 'i3', name: 'Frontend Integration', values: { c_status: 'Stuck', c_timeline: {start:'2026-01-20', end:'2026-02-05'}, c_dep: ['i2'] } }
    ]}
  ]
};

//