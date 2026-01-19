// app/page.tsx
'use server'

import { loadFromCloud } from '@/app/actions';
import { BoardProvider } from '@/components/board/BoardContext';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { MasterDashboard } from '@/components/board/MasterDashboard';
import { Board, Dashboard, Entity } from '@/app/types';

// --- DATA SEED: L'ESPACE DE TRAVAIL COMPLET ---
const BOARD_1: Board = {
  id: 'b_mkt', type: 'board', name: 'Marketing Campaign Q1', favorited: false,
  views: [{id:'v1', type:'table', name:'Main Table'}, {id:'v2', type:'kanban', name:'Kanban'}],
  automations: [],
  columns: [
    { id: 'c_task', title: 'Task', type: 'name', width: 300, fixed: true },
    { id: 'c_status', title: 'Status', type: 'status', width: 140, settings: { labels: { 'Done': '#00c875', 'Working': '#fdab3d', 'Stuck': '#e2445c' } } },
    { id: 'c_budget', title: 'Budget', type: 'numbers', width: 120, settings: { unit: '€' } }
  ],
  groups: [
    { id: 'g1', name: 'Social Media', color: '#0073ea', collapsed: false, items: [
        { id: 'i1', name: 'Instagram Ads', values: { c_status: 'Done', c_budget: 5000 } },
        { id: 'i2', name: 'Influencer Outreach', values: { c_status: 'Working', c_budget: 12000 } }
    ]}
  ]
};

const BOARD_2: Board = {
  id: 'b_dev', type: 'board', name: 'Product Roadmap', favorited: true,
  views: [{id:'v1', type:'table', name:'Main Table'}, {id:'v3', type:'gantt', name:'Gantt'}],
  automations: [],
  columns: [
    { id: 'c_feat', title: 'Feature', type: 'name', width: 300, fixed: true },
    { id: 'c_status', title: 'Dev Status', type: 'status', width: 140, settings: { labels: { 'Deployed': '#00c875', 'Coding': '#a25ddc', 'Review': '#00d2d2' } } },
    { id: 'c_timeline', title: 'Timeline', type: 'timeline', width: 180 },
    { id: 'c_dep', title: 'Dependency', type: 'dependency', width: 100 }
  ],
  groups: [
    { id: 'g2', name: 'Q1 Features', color: '#a25ddc', collapsed: false, items: [
        { id: 'i3', name: 'Master Dashboard', values: { c_status: 'Coding', c_timeline: {start:'2026-01-10', end:'2026-02-01'} } },
        { id: 'i4', name: 'API V2', values: { c_status: 'Review', c_timeline: {start:'2026-01-05', end:'2026-01-15'}, c_dep: ['i3'] } }
    ]}
  ]
};

const DASHBOARD_MAIN: Dashboard = {
  id: 'd_exec', type: 'dashboard', name: 'Executive Overview', favorited: true,
  widgets: [
      { id: 'w1', type: 'numbers', title: 'Total Budget Committed', layout: {x:0, y:0, w:1, h:1}, settings: { sourceBoardIds: ['b_mkt', 'b_dev'] } },
      { id: 'w2', type: 'battery', title: 'Project Health', layout: {x:1, y:0, w:1, h:1}, settings: { sourceBoardIds: ['b_mkt', 'b_dev'] } },
      { id: 'w3', type: 'chart', title: 'Resource Allocation', layout: {x:2, y:0, w:2, h:1}, settings: { sourceBoardIds: ['b_dev'] } },
      { id: 'w4', type: 'workload', title: 'Team Capacity', layout: {x:0, y:1, w:2, h:2}, settings: { sourceBoardIds: ['b_dev'] } }
  ]
};

const WORKSPACE_DATA: Entity[] = [DASHBOARD_MAIN, BOARD_2, BOARD_1];

// ------------------------------------------

// Client Component Wrapper pour gérer la navigation Sidebar
import { ClientWrapper } from '@/components/ClientWrapper'; 

export default async function Page() {
  const cloudData = await loadFromCloud();
  
  // Si données cloud, on les utilise, sinon Mock Data
  const initialWorkspace = (cloudData && Array.isArray(cloudData) && cloudData.length > 0) 
    ? cloudData 
    : WORKSPACE_DATA;

  return (
    <div className="h-screen flex flex-col font-sans text-[#323338]">
        <ClientWrapper initialWorkspace={initialWorkspace} />
    </div>
  );
}