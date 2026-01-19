// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { saveToCloud, loadFromCloud } from '@/app/actions';
import { evaluateFormula, runAutomations, calculateProgress } from '@/app/engine';
import { 
  Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, Calendar as CalIcon, 
  BarChart3, Users, CheckSquare, Grid3x3, List, Trash2, Filter, Share2, Star, 
  Bell, Settings, Upload, Clock, Tag, Paperclip, MessageSquare, 
  Activity, Link2, Copy, PieChart, Zap, Home, Inbox, 
  X, UserPlus, Folder, FileText, Menu, Play, Pause, Calculator, File, Image as ImageIcon, CornerDownRight,
  Globe, Phone, Mail, MapPin, Flag
} from 'lucide-react';

// --- CONSTANTS & HELPERS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const COLORS = {
  status: {
    done: "#00c875", stuck: "#e2445c", working: "#fdab3d", default: "#c4c4c4", 
    purple: "#a25ddc", blue: "#579bfc", black: "#333333", indigo: "#4E5BA6"
  }
};

// --- DEFAULT DATA SEED ---
const createEnterpriseBoard = (name) => ({
  id: generateId(),
  name: name,
  description: 'Enterprise Project Management',
  favorited: false,
  automations: [
      { id: generateId(), active: true, trigger: 'status_change', condition: { value: 'Done', targetGroupId: 'g_done' }, action: 'move_to_group' }
  ],
  views: [
      { id: 'v_main', type: 'table', name: 'Main Table' },
      { id: 'v_kanban', type: 'kanban', name: 'Kanban By Status' },
      { id: 'v_gantt', type: 'gantt', name: 'Gantt Chart' },
      { id: 'v_chart', type: 'chart', name: 'Analytics' }
  ],
  columns: [
    { id: 'c_name', title: 'Item', type: 'name', width: 340, fixed: true },
    { id: 'c_person', title: 'Owner', type: 'people', width: 100 },
    { id: 'c_status', title: 'Status', type: 'status', width: 140, settings: { labels: { 'Done': COLORS.status.done, 'Stuck': COLORS.status.stuck, 'Working': COLORS.status.working, '': COLORS.status.default } }},
    { id: 'c_date', title: 'Timeline', type: 'timeline', width: 160 },
    { id: 'c_priority', title: 'Priority', type: 'status', width: 140, settings: { labels: { 'High': '#e2445c', 'Medium': '#fdab3d', 'Low': '#579bfc' } } },
    { id: 'c_numbers', title: 'Est. Budget', type: 'numbers', width: 120, settings: { unit: '€' } },
    { id: 'c_formula', title: 'Actual Cost', type: 'formula', width: 120, settings: { formula: "{Est. Budget} * 1.2" } },
    { id: 'c_files', title: 'Files', type: 'files', width: 100 },
    { id: 'c_progress', title: 'Progress', type: 'progress', width: 120 },
    { id: 'c_rating', title: 'Rating', type: 'rating', width: 120 },
    { id: 'c_country', title: 'Location', type: 'country', width: 120 },
    { id: 'c_last_updated', title: 'Last Updated', type: 'date', width: 120 }
  ],
  groups: [
    {
      id: generateId(), name: 'Q1 Deliverables', color: COLORS.status.blue, collapsed: false,
      items: [
        { id: generateId(), name: 'Global Infrastructure Setup', values: { 'c_status': 'Done', 'c_priority': 'High', 'c_numbers': 5000, 'c_progress': 100, 'c_person': ['Admin'] } },
        { id: generateId(), name: 'Security Audit', values: { 'c_status': 'Working', 'c_priority': 'High', 'c_numbers': 2500, 'c_progress': 45 } },
        { id: generateId(), name: 'Frontend Migration', values: { 'c_status': 'Stuck', 'c_priority': 'Medium', 'c_numbers': 1200, 'c_progress': 10 }, subitems: [
            { id: generateId(), name: 'React Components', values: { 'c_status': 'Done' } },
            { id: generateId(), name: 'Tailwind Config', values: { 'c_status': 'Working' } }
        ]}
      ]
    },
    { id: 'g_done', name: 'Completed Tasks', color: COLORS.status.done, collapsed: true, items: [] }
  ]
});

// --- CELL COMPONENTS FACTORY ---
const CellFactory = ({ col, item, onChange, members }) => {
    const val = item.values?.[col.id];

    switch (col.type) {
        case 'status':
            const bg = col.settings.labels[val] || '#c4c4c4';
            return (
                <div className="w-full h-full relative group/cell">
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-95 duration-200" style={{backgroundColor: bg}}>
                        <span className="truncate px-2">{val || ''}</span>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 transition"><CornerDownRight size={10} className="fill-white"/></div>
                    </div>
                    <select className="absolute inset-0 opacity-0 cursor-pointer" value={val || ''} onChange={(e) => onChange(e.target.value)}>
                        {Object.keys(col.settings.labels).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            );
        case 'timeline':
            return (
                <div className="w-full h-full flex items-center justify-center px-2">
                    <div className="w-full h-6 rounded-full bg-slate-800 flex items-center justify-center relative hover:opacity-80 cursor-pointer overflow-hidden group/tl">
                        <div className="absolute left-0 h-full bg-blue-500" style={{width: '60%'}}></div>
                        <span className="text-[10px] text-white z-10 font-mono relative">
                            {val?.start ? new Date(val.start).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'Set Dates'} 
                            {val?.end ? ` - ${new Date(val.end).toLocaleDateString(undefined, {month:'short', day:'numeric'})}` : ''}
                        </span>
                        <input type="date" className="absolute left-0 w-1/2 opacity-0 h-full cursor-pointer" onChange={e => onChange({...val, start: e.target.value})}/>
                        <input type="date" className="absolute right-0 w-1/2 opacity-0 h-full cursor-pointer" onChange={e => onChange({...val, end: e.target.value})}/>
                    </div>
                </div>
            );
        case 'people':
            return (
                <div className="w-full h-full flex items-center justify-center hover:bg-gray-100 cursor-pointer relative group/peep">
                    {val && val.length > 0 ? (
                        <div className="flex -space-x-2">
                            {val.map((p, i) => (
                                <div key={i} className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] border-2 border-white font-bold" title={p}>{p.charAt(0)}</div>
                            ))}
                            <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center opacity-0 group-hover/peep:opacity-100 transition absolute left-full ml-1"><Plus size={12}/></div>
                        </div>
                    ) : <Users size={16} className="text-gray-300"/>}
                    <select className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => onChange([...(val||[]), e.target.value])}>
                        <option value="">+ Add</option>
                        {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                </div>
            );
        case 'numbers':
            return (
                <div className="w-full h-full flex items-center justify-center relative hover:bg-gray-50">
                    <span className="text-xs font-mono">{col.settings?.unit}</span>
                    <input className="w-full bg-transparent text-center text-xs font-medium focus:outline-none" value={val || ''} placeholder="0" type="number" onChange={e => onChange(Number(e.target.value))}/>
                </div>
            );
        case 'formula':
            const res = evaluateFormula(col.settings?.formula || "", item, []); // Note: need full cols context, passing mock for cell
            return (
                <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                        <Calculator size={10}/> {res}
                    </div>
                </div>
            );
        case 'progress':
            const prog = val || calculateProgress(item, []); // Need cols context
            return (
                <div className="w-full h-full flex items-center px-2 gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${prog}%`}}></div>
                    </div>
                    <span className="text-[10px] w-6 text-right">{prog}%</span>
                </div>
            );
        case 'rating':
            return (
                <div className="w-full h-full flex items-center justify-center gap-0.5">
                    {[1,2,3,4,5].map(star => (
                        <Star key={star} size={12} className={`cursor-pointer ${star <= (val||0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} onClick={() => onChange(star)}/>
                    ))}
                </div>
            );
        case 'files':
            return (
                <div className="w-full h-full flex items-center justify-center hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-blue-600">
                    {val?.length ? <div className="flex gap-1"><File size={16} className="fill-blue-100 text-blue-600"/><span className="text-xs font-bold text-blue-600">{val.length}</span></div> : <Plus size={16}/>}
                    <button className="absolute inset-0 opacity-0" onClick={() => { const f = prompt("File name:"); if(f) onChange([...(val||[]), {name:f}]) }}></button>
                </div>
            );
        case 'country':
            return (
                <div className="w-full h-full flex items-center justify-center hover:bg-gray-50 cursor-pointer gap-1 text-xs">
                    <MapPin size={12} className="text-red-500"/> {val || <span className="text-gray-300">Locate</span>}
                    <button className="absolute inset-0 opacity-0" onClick={() => { const c = prompt("City/Country:"); if(c) onChange(c) }}></button>
                </div>
            );
        default:
            return <input className="w-full h-full bg-transparent px-2 text-xs focus:outline-none" value={val || ''} onChange={e => onChange(e.target.value)} />;
    }
};

// --- MAIN COMPONENT ---
const TuesdayEnterprise = () => {
  // Global State
  const [workspaces, setWorkspaces] = useState([{
    id: 'ws_1', name: 'Enterprise Space', icon: '🏢',
    members: [{ id: 'u_1', name: 'Admin User', role: 'Admin', avatar: 'A' }],
    boards: [createEnterpriseBoard('Project Alpha')]
  }]);
  
  const [activeWsId, setActiveWsId] = useState('ws_1');
  const [activeBoardId, setActiveBoardId] = useState(workspaces[0].boards[0].id);
  const [view, setView] = useState('table');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSubitems, setExpandedSubitems] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modal, setModal] = useState(null); // 'column', 'automation', 'invite'
  const [sidePanel, setSidePanel] = useState(null); // Item object

  // --- PERSISTENCE ---
  const isFirstLoad = useRef(true);
  useEffect(() => {
    const init = async () => {
      const data = await loadFromCloud();
      if (data) {
        setWorkspaces(data);
        setActiveWsId(data[0]?.id);
        setActiveBoardId(data[0]?.boards[0]?.id);
      }
      setIsLoading(false);
      isFirstLoad.current = false;
    };
    init();
  }, []);

  useEffect(() => {
    if (isFirstLoad.current || isLoading) return;
    const save = async () => {
      setIsSaving(true);
      await saveToCloud(workspaces);
      setTimeout(() => setIsSaving(false), 500);
    };
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [workspaces]);

  // --- ACTIONS ---
  const workspace = workspaces.find(w => w.id === activeWsId) || workspaces[0];
  const board = workspace?.boards.find(b => b.id === activeBoardId) || workspace?.boards[0];

  const updateBoard = (fn) => {
    setWorkspaces(prev => prev.map(w => w.id !== activeWsId ? w : { 
      ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : fn(b)) 
    }));
  };

  const handleCellChange = (groupId, itemId, colId, value, isSub = false, parentId = null) => {
      // 1. Update Value
      let newBoard = {...board};
      newBoard.groups = newBoard.groups.map(g => g.id !== groupId ? g : {
          ...g, items: isSub 
            ? g.items.map(i => i.id !== parentId ? i : { ...i, subitems: i.subitems.map(s => s.id !== itemId ? s : { ...s, values: { ...s.values, [colId]: value } }) })
            : g.items.map(i => i.id !== itemId ? i : { ...i, values: { ...i.values, [colId]: value } })
      });

      // 2. Run Automations (Only for main items for now)
      if (!isSub && board.columns.find(c => c.id === colId)?.type === 'status') {
          // Find item to pass to automation engine
          const group = newBoard.groups.find(g => g.id === groupId);
          const item = group.items.find(i => i.id === itemId);
          // Run Engine
          newBoard = runAutomations(newBoard, item, 'status_change', { colId, newVal: value });
      }

      // 3. Recalculate Formulas & Progress (Simulated update)
      // In a real app, this would be a recursive tree traversal
      
      updateBoard(() => newBoard);
  };

  const addColumn = (type, title, settings = {}) => {
      const defSettings = type === 'status' ? { labels: { 'Done': '#00c875', 'Stuck': '#e2445c', 'Working': '#fdab3d', '': '#c4c4c4' } } : settings;
      updateBoard(b => ({ ...b, columns: [...b.columns, { id: `c_${generateId()}`, title, type, width: 140, settings: defSettings }] }));
      setModal(null);
  };

  // --- RENDER ---
  if (isLoading || !board) return <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-4"><Loader2 className="w-12 h-12 text-blue-600 animate-spin"/><div className="text-slate-500 font-medium">Loading Enterprise OS...</div></div>;

  return (
    <div className="h-screen flex flex-col bg-white text-[#323338] font-sans overflow-hidden">
      
      {/* 1. TOP BAR */}
      <div className="h-12 bg-[#2b2c44] text-white flex items-center px-4 justify-between shrink-0 z-50 shadow-md">
         <div className="flex items-center gap-4">
            <div className="p-1.5 bg-blue-600 rounded hover:bg-blue-500 transition cursor-pointer"><Grid3x3 size={16}/></div>
            <div className="flex flex-col">
                <span className="font-bold text-base leading-tight tracking-wide">tuesday<span className="font-normal opacity-70">.com</span></span>
                <span className="text-[10px] text-yellow-400 font-bold tracking-widest uppercase">Enterprise</span>
            </div>
         </div>
         <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded cursor-pointer hover:bg-white/20 transition">
                 <Search size={14}/>
                 <span className="text-xs opacity-70">Search everything...</span>
                 <span className="text-[10px] border border-white/30 px-1 rounded">⌘K</span>
             </div>
             <Bell size={18} className="hover:text-white cursor-pointer opacity-80"/>
             <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#2b2c44] shadow-sm">AD</div>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. SIDEBAR */}
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-64'} shrink-0 relative z-40`}>
           <div className="p-3 border-b border-gray-100 flex items-center justify-between">
               {!sidebarCollapsed && <span className="text-xs font-bold text-gray-400 uppercase ml-2">Workspaces</span>}
               <div className="p-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                   {sidebarCollapsed ? <ChevronRight size={16}/> : <Menu size={16}/>}
               </div>
           </div>
           
           {!sidebarCollapsed ? (
               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                   {workspace.boards.map(b => (
                       <div key={b.id} onClick={() => setActiveBoardId(b.id)} className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm group ${activeBoardId === b.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                           <div className="flex items-center gap-3 truncate">
                               <FileText size={16} className={activeBoardId === b.id ? 'fill-blue-200' : ''}/>
                               <span className="truncate">{b.name}</span>
                           </div>
                           <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"/>
                       </div>
                   ))}
               </div>
           ) : (
               <div className="flex flex-col items-center pt-4 gap-4">
                   {workspace.boards.map(b => (
                       <div key={b.id} className="p-2 hover:bg-gray-100 rounded cursor-pointer relative group" onClick={() => setActiveBoardId(b.id)}>
                           <FileText size={20} className={activeBoardId === b.id ? 'text-blue-600' : 'text-gray-500'}/>
                           <div className="absolute left-10 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">{b.name}</div>
                       </div>
                   ))}
               </div>
           )}
           
           <div className="p-3 border-t border-gray-200">
               <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600">
                   <UserPlus size={18}/>
                   {!sidebarCollapsed && <span className="text-sm">Invite Members</span>}
               </div>
           </div>
        </div>

        {/* 3. MAIN BOARD AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            
            {/* BOARD HEADER */}
            <div className="px-8 pt-6 pb-0">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold text-[#323338]">{board.name}</h1>
                            <Star size={20} className="text-yellow-400 fill-yellow-400 cursor-pointer hover:scale-110 transition"/>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            {board.description}
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">PROJECT</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 mr-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white border-2 border-white flex items-center justify-center text-xs">JD</div>
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center text-xs">AS</div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500">+5</div>
                        </div>
                        <button className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-2"><Activity size={14}/> Activity</button>
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium shadow-sm transition">Invite / 1</button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex items-center border-b border-gray-200">
                    <button className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition ${view === 'table' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'}`} onClick={() => setView('table')}><Home size={16}/> Main Table</button>
                    <button className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition ${view === 'kanban' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'}`} onClick={() => setView('kanban')}><Grid3x3 size={16}/> Kanban</button>
                    <button className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition ${view === 'gantt' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'}`} onClick={() => setView('gantt')}><BarChart3 size={16}/> Gantt</button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button className="px-3 py-1 text-sm flex items-center gap-1 text-gray-500 hover:bg-gray-100 rounded transition" onClick={() => setModal('column')}><Plus size={14}/> Add View</button>
                    
                    <div className="flex-1"></div>
                    
                    <div className="flex items-center gap-2 pb-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded transition" onClick={() => setModal('automation')}>
                            <Zap size={16} className="fill-current"/> Automate
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded transition border border-transparent hover:border-gray-200">
                            <Filter size={16}/> Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-auto bg-[#eceff8] p-6 pb-20">
                
                {/* TABLE VIEW */}
                {view === 'table' && (
                    <div className="space-y-10">
                        {board.groups.map(group => (
                            <div key={group.id} className="bg-white rounded-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
                                {/* GROUP HEADER */}
                                <div className="flex items-center p-3 sticky left-0 z-30 bg-white group/gheader">
                                    <div className="p-1 hover:bg-gray-100 rounded cursor-pointer transition mr-2" onClick={() => updateBoard(b => ({...b, groups: b.groups.map(g => g.id === group.id ? {...g, collapsed: !g.collapsed} : g)}))}>
                                        <ChevronDown size={18} className={`transition-transform duration-200 ${group.collapsed ? '-rotate-90' : ''}`} style={{color: group.color}}/>
                                    </div>
                                    <div className="font-bold text-lg px-2 py-0.5 rounded hover:border hover:border-gray-300 border border-transparent cursor-text transition" style={{color: group.color}}>{group.name}</div>
                                    <span className="text-xs text-gray-400 ml-4 font-medium">{group.items.length} items</span>
                                    
                                    <div className="flex-1"></div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/gheader:opacity-100 transition">
                                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-white"></div>
                                        <div className="p-1 hover:bg-gray-100 rounded text-gray-400 cursor-pointer"><MoreHorizontal size={16}/></div>
                                    </div>
                                </div>

                                {!group.collapsed && (
                                    <div className="overflow-x-auto">
                                        {/* COLUMNS HEADER */}
                                        <div className="flex border-y border-gray-200 bg-white h-[36px]">
                                            <div className="w-8 sticky left-0 bg-white z-20 border-r border-gray-100"></div>
                                            <div className="w-1.5 sticky left-8 bg-white z-20" style={{backgroundColor: group.color}}></div>
                                            <div className="w-8 sticky left-[38px] bg-white z-20 border-r border-gray-100 flex items-center justify-center"><input type="checkbox" className="rounded border-gray-300"/></div>
                                            
                                            {board.columns.map(col => (
                                                <div 
                                                    key={col.id} 
                                                    className={`px-2 flex items-center justify-center text-xs font-semibold text-gray-500 border-r border-gray-200 shrink-0 select-none hover:bg-gray-50 transition cursor-col-resize ${col.fixed ? 'sticky left-[70px] z-20 bg-white shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]' : ''}`} 
                                                    style={{width: col.width}}
                                                >
                                                    {col.title}
                                                </div>
                                            ))}
                                            <div className="w-10 border-r border-gray-200 flex items-center justify-center hover:bg-blue-50 cursor-pointer transition" onClick={() => setModal('column')}><Plus size={16} className="text-gray-400 hover:text-blue-600"/></div>
                                            <div className="flex-1 bg-white"></div>
                                        </div>

                                        {/* ROWS */}
                                        {group.items.map(item => (
                                            <React.Fragment key={item.id}>
                                                <div className="flex border-b border-gray-100 hover:bg-[#f5f7fa] group/row h-[40px] bg-white transition-colors">
                                                    <div className="w-8 sticky left-0 bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f7fa]"><Menu size={12} className="text-gray-300 cursor-grab opacity-0 group-hover/row:opacity-100"/></div>
                                                    <div className="w-1.5 sticky left-8 z-10" style={{backgroundColor: group.color}}></div>
                                                    <div className="w-8 sticky left-[38px] bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f7fa]">
                                                        <input type="checkbox" className="rounded border-gray-300"/>
                                                    </div>

                                                    {board.columns.map(col => (
                                                        <div key={col.id} className={`border-r border-gray-100 shrink-0 bg-white group-hover/row:bg-[#f5f7fa] ${col.fixed ? 'sticky left-[70px] z-10 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]' : ''}`} style={{width: col.width}}>
                                                            {col.type === 'name' ? (
                                                                <div className="w-full h-full flex items-center px-2 relative">
                                                                    <div className="flex items-center gap-2 w-full">
                                                                        {item.subitems && (
                                                                            <div className="p-0.5 hover:bg-gray-300 rounded cursor-pointer transition" onClick={() => setExpandedSubitems(p => ({...p, [item.id]: !p[item.id]}))}>
                                                                                <ChevronRight size={14} className={`text-gray-500 transition-transform ${expandedSubitems[item.id] ? 'rotate-90' : ''}`}/>
                                                                            </div>
                                                                        )}
                                                                        <input className="bg-transparent border-none outline-none text-sm w-full text-gray-800 font-normal truncate" value={item.name} onChange={(e) => updateBoard(b => ({...b, groups: b.groups.map(g => g.id !== group.id ? g : {...g, items: g.items.map(i => i.id !== item.id ? i : {...i, name: e.target.value})})}))}/>
                                                                    </div>
                                                                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/row:opacity-100 absolute right-2 bg-[#f5f7fa] pl-2">
                                                                        <div className="relative cursor-pointer hover:scale-110 transition" onClick={() => setSidePanel(item)}>
                                                                            <MessageSquare size={18} className="text-gray-400 hover:text-blue-600"/>
                                                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <CellFactory col={col} item={item} onChange={(val) => handleCellChange(group.id, item.id, col.id, val)} members={workspace.members} />
                                                            )}
                                                        </div>
                                                    ))}
                                                    <div className="flex-1 bg-white group-hover/row:bg-[#f5f7fa]"></div>
                                                </div>

                                                {/* SUBITEMS RENDERER */}
                                                {expandedSubitems[item.id] && item.subitems && item.subitems.map(sub => (
                                                    <div key={sub.id} className="flex border-b border-gray-100 bg-[#f7f9fa] h-[36px] group/sub">
                                                        <div className="w-[70px] sticky left-0 bg-[#f7f9fa] z-10 border-r border-gray-100"></div>
                                                        {board.columns.map(col => (
                                                            <div key={col.id} className={`border-r border-gray-200/50 shrink-0 bg-[#f7f9fa] ${col.fixed ? 'sticky left-[70px] z-10 pl-6' : ''}`} style={{width: col.width}}>
                                                                {col.type === 'name' ? (
                                                                    <div className="flex items-center h-full px-2 gap-2">
                                                                        <CornerDownRight size={12} className="text-gray-400"/>
                                                                        <input className="bg-transparent border-none outline-none text-xs w-full text-gray-500" value={sub.name} onChange={(e) => handleCellChange(group.id, sub.id, 'name', e.target.value, true, item.id)}/>
                                                                    </div>
                                                                ) : (
                                                                    <CellFactory col={col} item={sub} onChange={(val) => handleCellChange(group.id, sub.id, col.id, val, true, item.id)} members={workspace.members} />
                                                                )}
                                                            </div>
                                                        ))}
                                                        <div className="flex-1 bg-[#f7f9fa]"></div>
                                                    </div>
                                                ))}
                                            </React.Fragment>
                                        ))}

                                        {/* ADD ITEM ROW */}
                                        <div className="flex h-[40px] border-b border-gray-100 bg-white">
                                            <div className="w-8 sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                                            <div className="w-1.5 sticky left-8 bg-white z-10" style={{backgroundColor: group.color}}></div>
                                            <div className="w-8 sticky left-[38px] bg-white z-10 border-r border-gray-100"></div>
                                            <div className="sticky left-[70px] z-10 bg-white w-[340px] border-r border-gray-100 flex items-center px-2">
                                                <input className="w-full text-sm outline-none placeholder-gray-400 hover:bg-gray-50 p-1 rounded" placeholder="+ Add Item" onKeyDown={(e) => {if(e.key==='Enter'){updateBoard(b => ({...b, groups: b.groups.map(g => g.id !== group.id ? g : {...g, items: [...g.items, {id: generateId(), name: e.target.value, values:{}, subitems:[]}]})})); e.target.value='';}}}/>
                                            </div>
                                            <div className="flex-1 bg-white"></div>
                                        </div>

                                        {/* FOOTER SUMMARY */}
                                        <div className="flex h-[36px] border-b border-gray-200 bg-white">
                                            <div className="w-[70px] sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                                            <div className="sticky left-[70px] z-10 bg-white w-[340px] border-r border-gray-100 flex items-center px-2"></div>
                                            {board.columns.map(col => (
                                                !col.fixed && (
                                                    <div key={col.id} className="border-r border-gray-100 shrink-0 flex items-center justify-center" style={{width: col.width}}>
                                                        {col.type === 'numbers' && <span className="text-xs font-bold text-gray-700">{group.items.reduce((a, b) => a + (b.values[col.id]||0), 0)} {col.settings.unit}</span>}
                                                        {col.type === 'status' && (
                                                            <div className="w-full h-4 flex mx-2 rounded-sm overflow-hidden opacity-80">
                                                                {Object.keys(col.settings.labels).map(k => {
                                                                    const c = group.items.filter(i => i.values[col.id] === k).length;
                                                                    return c > 0 && <div key={k} style={{width: `${(c/group.items.length)*100}%`, backgroundColor: col.settings.labels[k]}} title={k}></div>
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            ))}
                                            <div className="flex-1 bg-white"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50 text-gray-700 transition" onClick={() => updateBoard(b => ({...b, groups: [...b.groups, {id: generateId(), name: 'New Group', color: '#579bfc', items: [], collapsed: false}]}))}><Plus size={16}/> Add New Group</button>
                    </div>
                )}

                {/* KANBAN VIEW */}
                {view === 'kanban' && (
                    <div className="flex gap-6 h-full overflow-x-auto pb-6">
                        {Object.entries(board.columns.find(c => c.type === 'status')?.settings.labels || {}).map(([label, color]) => (
                            <div key={label} className="w-72 shrink-0 flex flex-col h-full rounded-lg bg-gray-100/50 p-2">
                                <div className="font-bold mb-3 px-3 py-2 rounded text-white text-sm shadow-sm flex justify-between" style={{backgroundColor: color}}>
                                    <span>{label || 'Empty'}</span>
                                    <span className="bg-white/20 px-2 rounded-full text-xs flex items-center">{board.groups.flatMap(g => g.items).filter(i => i.values['c_status'] === label).length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                    {board.groups.flatMap(g => g.items).filter(i => i.values['c_status'] === label).map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition group">
                                            <div className="text-sm font-medium mb-3 text-gray-800 line-clamp-2">{item.name}</div>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: g.color}}></div>
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{g.name}</span>
                                                </div>
                                                {item.values['c_person']?.[0] && <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">{item.values['c_person'][0].charAt(0)}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- MODALS & PANELS --- */}
      
      {/* COLUMN CENTER */}
      {modal === 'column' && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm" onClick={() => setModal(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold">Column Center</h2>
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm text-gray-500"><Search size={14}/> Search columns...</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                      <div className="grid grid-cols-4 gap-4">
                          {[
                              {id: 'status', label: 'Status', icon: <CheckSquare className="text-green-500"/>},
                              {id: 'people', label: 'People', icon: <Users className="text-blue-500"/>},
                              {id: 'date', label: 'Date', icon: <CalIcon className="text-orange-500"/>},
                              {id: 'timeline', label: 'Timeline', icon: <Activity className="text-purple-500"/>},
                              {id: 'numbers', label: 'Numbers', icon: <Hash className="text-red-500"/>},
                              {id: 'rating', label: 'Rating', icon: <Star className="text-yellow-500"/>},
                              {id: 'text', label: 'Text', icon: <FileText className="text-gray-500"/>},
                              {id: 'files', label: 'Files', icon: <File className="text-indigo-500"/>},
                              {id: 'formula', label: 'Formula', icon: <Calculator className="text-pink-500"/>},
                              {id: 'progress', label: 'Progress', icon: <PieChart className="text-emerald-500"/>},
                              {id: 'country', label: 'Country', icon: <Globe className="text-cyan-500"/>},
                              {id: 'phone', label: 'Phone', icon: <Phone className="text-green-600"/>},
                              {id: 'email', label: 'Email', icon: <Mail className="text-blue-400"/>},
                          ].map(t => (
                              <div key={t.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition flex flex-col items-center gap-3 group" onClick={() => addColumn(t.id, t.label)}>
                                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition">{t.icon}</div>
                                  <span className="text-xs font-bold text-gray-700">{t.label}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* AUTOMATIONS CENTER */}
      {modal === 'automation' && (
          <div className="fixed inset-0 bg-[#2b2c44]/60 z-[100] flex items-center justify-center backdrop-blur-sm" onClick={() => setModal(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[650px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="bg-[#2b2c44] text-white p-8 flex justify-between items-center shrink-0">
                      <div>
                          <h2 className="text-2xl font-bold flex items-center gap-3"><Zap className="fill-yellow-400 text-yellow-400"/> Automations Center</h2>
                          <p className="text-white/60 mt-1">Automate your workflow and save time.</p>
                      </div>
                      <button className="px-5 py-2.5 bg-blue-600 rounded hover:bg-blue-500 font-medium transition shadow-lg">Create Custom Automation</button>
                  </div>
                  <div className="flex-1 bg-gray-50 p-8 grid grid-cols-2 gap-6 overflow-y-auto">
                      {[
                          { title: "Status Change", desc: "When Status changes to Done, move item to Group Done", icon: <CheckSquare/> },
                          { title: "Due Date", desc: "When date arrives, notify Person", icon: <Clock/> },
                          { title: "Item Creation", desc: "When Item created, assign to Me", icon: <Plus/> },
                          { title: "Priority Alert", desc: "When Priority is High, send email to Admin", icon: <Flag/> },
                          { title: "Recurring", desc: "Every Monday, create a new task", icon: <CalIcon/> }
                      ].map((a, i) => (
                          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col justify-between h-48 group">
                              <div className="flex items-start justify-between">
                                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">{a.icon}</div>
                                  <div className="w-10 h-6 bg-green-100 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-green-500 rounded-full ml-auto shadow-sm"></div></div>
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-gray-800 mb-2">{a.title}</h3>
                                  <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* UPDATE PANEL */}
      {sidePanel && (
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-[80] border-l border-gray-200 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
                  <div className="font-bold text-xl truncate pr-4">{sidePanel.name}</div>
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setSidePanel(null)}><X size={20} className="text-gray-500"/></div>
              </div>
              <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                      <textarea className="w-full resize-none outline-none text-sm min-h-[100px] placeholder-gray-400" placeholder="Write an update... @mention teammates"></textarea>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <div className="flex gap-4 text-gray-400">
                              <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer text-xs font-medium transition"><Paperclip size={14}/> Add files</span>
                              <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer text-xs font-medium transition"><ImageIcon size={14}/> GIF</span>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition">Update</button>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Activity Log</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="space-y-6">
                      <div className="flex gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white">JD</div>
                          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                              <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform -rotate-45"></div>
                              <div className="flex justify-between mb-2">
                                  <span className="font-bold text-sm text-indigo-600">John Doe</span>
                                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> 2h ago</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">Changed status to <span className="bg-[#00c875] text-white px-1.5 py-0.5 rounded text-xs font-bold">Done</span>. Great work team!</p>
                              <div className="mt-4 flex gap-4 text-xs font-medium text-gray-500">
                                  <button className="flex items-center gap-1 hover:text-blue-600"><span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50">👍</span> Like</button>
                                  <button className="hover:text-blue-600">Reply</button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* SYNC INDICATOR */}
      <div className="fixed bottom-4 left-4 z-[90] flex items-center gap-2 pointer-events-none">
          {isSaving ? (
              <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-blue-100 flex items-center gap-2 text-xs font-bold text-blue-600 animate-in slide-in-from-bottom-2 fade-in">
                  <Loader2 size={14} className="animate-spin"/> Saving to Cloud...
              </div>
          ) : (
              <div className="bg-[#2b2c44] text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-2 fade-in opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
                  <Cloud size={14}/> Synced
              </div>
          )}
      </div>

    </div>
  );
};

export default TuesdayEnterprise;