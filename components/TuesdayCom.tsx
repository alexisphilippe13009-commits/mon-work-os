// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { saveToCloud, loadFromCloud } from '@/app/actions';
import { 
  Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, Calendar as CalIcon, 
  BarChart3, Users, CheckSquare, Grid3x3, List, Trash2, Filter, Share2, Star, 
  Bell, Settings, Download, Upload, Clock, Tag, Paperclip, MessageSquare, 
  Activity, Link2, Copy, Eye, EyeOff, TrendingUp, PieChart, Zap, Home, Inbox, 
  Play, X, Edit2, UserPlus, Folder, FileText, Archive, Menu, LogOut, 
  CreditCard, Building2, Mail, Cloud, Loader2, GripVertical, Hash, AlertCircle, ThumbsUp
} from 'lucide-react';

// --- UTILS & CONSTANTS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const COLORS = {
  monday_blue: "#0073ea",
  monday_dark_blue: "#182b4d",
  bg_gray: "#eceff8",
  status: {
    done: "#00c875",
    stuck: "#e2445c",
    working: "#fdab3d",
    default: "#c4c4c4",
    purple: "#a25ddc",
    blue: "#579bfc"
  }
};

const COLUMN_TYPES = {
  STATUS: 'status',
  TEXT: 'text',
  PEOPLE: 'people',
  NUMBERS: 'numbers',
  DATE: 'date',
  TIMELINE: 'timeline',
  RATING: 'rating',
  TAGS: 'tags'
};

// Default Setup for a new Board
const createNewBoard = (name) => ({
  id: generateId(),
  name: name,
  description: '',
  favorited: false,
  columns: [
    { id: 'c_name', title: 'Item', type: 'name', width: 280, fixed: true },
    { id: 'c_person', title: 'Person', type: 'people', width: 100 },
    { id: 'c_status', title: 'Status', type: 'status', width: 140, settings: { 
        labels: { 'Done': COLORS.status.done, 'Stuck': COLORS.status.stuck, 'Working': COLORS.status.working, '': COLORS.status.default } 
    }},
    { id: 'c_date', title: 'Date', type: 'date', width: 120 }
  ],
  groups: [
    {
      id: generateId(),
      name: 'Groupe Principal',
      color: COLORS.status.blue,
      collapsed: false,
      items: [
        { id: generateId(), name: 'Tâche 1', values: { 'c_status': 'Working', 'c_person': ['Vous'] } },
        { id: generateId(), name: 'Tâche 2', values: { 'c_status': 'Done', 'c_person': [] } },
        { id: generateId(), name: 'Tâche 3', values: { 'c_status': 'Stuck', 'c_person': ['Vous'] } }
      ]
    }
  ]
});

const TuesdayCom = () => {
  // --- STATE MANAGEMENT ---
  // Initial Data Structure
  const initialData = [{
    id: 'ws_1',
    name: 'Main Workspace',
    icon: '🏠',
    members: [{ id: 'u_1', name: 'Vous', role: 'Admin', avatar: 'V', email: 'admin@monday.clone' }],
    boards: [createNewBoard('Mon Premier Tableau')]
  }];

  const [workspaces, setWorkspaces] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isFirstLoad = useRef(true);

  // Active Context
  const [activeWsId, setActiveWsId] = useState(initialData[0].id);
  const [activeBoardId, setActiveBoardId] = useState(initialData[0].boards[0].id);
  const [view, setView] = useState('table'); // table, kanban, gantt, dashboard
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Panels
  const [modal, setModal] = useState(null); // 'workspace', 'board', 'column', 'automation'
  const [sidePanel, setSidePanel] = useState(null); // { type: 'item', itemId: '...', groupId: '...' }

  // --- CLOUD SYNC ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
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
      setTimeout(() => setIsSaving(false), 500); // Fake visual delay for comfort
    };
    const t = setTimeout(save, 1500); // Debounce save
    return () => clearTimeout(t);
  }, [workspaces]);

  // --- DERIVED DATA ---
  const workspace = workspaces.find(w => w.id === activeWsId) || workspaces[0];
  const board = workspace?.boards.find(b => b.id === activeBoardId) || workspace?.boards[0];

  // --- ACTIONS (REDUCER-LIKE) ---
  const updateBoard = (fn) => {
    setWorkspaces(prev => prev.map(w => {
      if (w.id !== activeWsId) return w;
      return { ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : fn(b)) };
    }));
  };

  const addGroup = () => {
    updateBoard(b => ({
      ...b, groups: [...b.groups, { id: generateId(), name: 'Nouveau Groupe', color: COLORS.status.purple, collapsed: false, items: [] }]
    }));
  };

  const addItem = (groupId, name) => {
    updateBoard(b => ({
      ...b, groups: b.groups.map(g => g.id !== groupId ? g : {
        ...g, items: [...g.items, { id: generateId(), name: name || 'Nouvelle tâche', values: {} }]
      })
    }));
  };

  const updateItemValue = (groupId, itemId, colId, value) => {
    updateBoard(b => ({
      ...b, groups: b.groups.map(g => g.id !== groupId ? g : {
        ...g, items: g.items.map(i => i.id !== itemId ? i : {
          ...i, values: { ...i.values, [colId]: value }
        })
      })
    }));
  };

  const updateItemName = (groupId, itemId, name) => {
    updateBoard(b => ({
      ...b, groups: b.groups.map(g => g.id !== groupId ? g : {
        ...g, items: g.items.map(i => i.id !== itemId ? i : { ...i, name })
      })
    }));
  };

  const deleteItem = (groupId, itemId) => {
    updateBoard(b => ({
      ...b, groups: b.groups.map(g => g.id !== groupId ? g : {
        ...g, items: g.items.filter(i => i.id !== itemId)
      })
    }));
  };

  const addColumn = (type, title) => {
    updateBoard(b => ({
      ...b, columns: [...b.columns, { 
        id: `c_${generateId()}`, 
        title, 
        type, 
        width: 140,
        settings: type === 'status' ? { labels: { 'Done': COLORS.status.done, 'Stuck': COLORS.status.stuck, 'Working': COLORS.status.working, '': COLORS.status.default } } : {}
      }]
    }));
    setModal(null);
  };

  // --- RENDERERS ---
  const renderCell = (col, item, groupId) => {
    const val = item.values[col.id];

    switch (col.type) {
      case COLUMN_TYPES.STATUS:
        const labels = col.settings?.labels || {};
        const bg = labels[val] || COLORS.status.default;
        return (
          <div className="w-full h-full relative group/cell">
            <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-opacity hover:opacity-90" style={{backgroundColor: bg}}>
              {val || <span className="opacity-0 group-hover/cell:opacity-50">Label</span>}
            </div>
            {/* Simple Dropdown Simulator */}
            <select 
              className="absolute inset-0 opacity-0 cursor-pointer"
              value={val || ''}
              onChange={(e) => updateItemValue(groupId, item.id, col.id, e.target.value)}
            >
              {Object.keys(labels).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        );
      
      case COLUMN_TYPES.PEOPLE:
        return (
          <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
            {val && val.length > 0 ? (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs border-2 border-white" title={val[0]}>
                {val[0].charAt(0)}
              </div>
            ) : (
              <Users className="w-4 h-4 text-gray-300" />
            )}
             <select 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => updateItemValue(groupId, item.id, col.id, [e.target.value])}
            >
              <option value="">Assign...</option>
              {workspace.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        );

      case COLUMN_TYPES.DATE:
        return (
          <div className="w-full h-full relative group/cell flex items-center justify-center hover:bg-gray-100">
             <span className="text-xs text-gray-700">{val ? new Date(val).toLocaleDateString() : '-'}</span>
             <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => updateItemValue(groupId, item.id, col.id, e.target.value)}
             />
          </div>
        );

      case COLUMN_TYPES.NUMBERS:
        return (
          <div className="w-full h-full flex items-center justify-center hover:bg-gray-50 px-2">
             <input 
                className="w-full text-center bg-transparent text-sm focus:outline-none"
                placeholder="0"
                type="number"
                value={val || ''}
                onChange={(e) => updateItemValue(groupId, item.id, col.id, e.target.value)}
             />
          </div>
        );
      
      case COLUMN_TYPES.TIMELINE:
        // Simulated Timeline with 2 dates
        const start = val?.start;
        const end = val?.end;
        return (
           <div className="w-full h-full flex items-center justify-center px-1">
              <div className="h-6 rounded-full bg-blue-400 w-full flex items-center justify-center text-[10px] text-white overflow-hidden cursor-pointer relative hover:opacity-90">
                 {start && end ? `${new Date(start).getDate()} - ${new Date(end).getDate()} ${new Date(end).toLocaleString('default',{month:'short'})}` : <span className="opacity-50">Set Dates</span>}
                 {/* Fake inputs for demo */}
                 <input type="date" className="absolute left-0 w-1/2 opacity-0" onChange={(e) => updateItemValue(groupId, item.id, col.id, {...val, start: e.target.value})} />
                 <input type="date" className="absolute right-0 w-1/2 opacity-0" onChange={(e) => updateItemValue(groupId, item.id, col.id, {...val, end: e.target.value})} />
              </div>
           </div>
        );

      case COLUMN_TYPES.RATING:
        const rating = parseInt(val) || 0;
        return (
          <div className="w-full h-full flex items-center justify-center gap-0.5">
             {[1,2,3,4,5].map(star => (
               <div 
                 key={star} 
                 className={`w-3 h-3 rounded-full cursor-pointer ${star <= rating ? 'bg-yellow-400' : 'bg-gray-300'}`}
                 onClick={() => updateItemValue(groupId, item.id, col.id, star)}
               />
             ))}
          </div>
        );

      default: // Text
        return (
          <div className="w-full h-full px-2 flex items-center hover:border-gray-300 border border-transparent">
            <input 
              className="w-full bg-transparent text-xs focus:outline-none truncate"
              value={val || ''}
              onChange={(e) => updateItemValue(groupId, item.id, col.id, e.target.value)}
              placeholder="..."
            />
          </div>
        );
    }
  };

  const renderFooterCell = (col, items) => {
      if (col.type === COLUMN_TYPES.NUMBERS) {
          const sum = items.reduce((acc, item) => acc + (parseFloat(item.values[col.id]) || 0), 0);
          return <div className="w-full text-center text-xs font-bold text-gray-700">{sum}</div>;
      }
      if (col.type === COLUMN_TYPES.STATUS) {
          const counts = items.reduce((acc, item) => {
              const v = item.values[col.id] || '';
              acc[v] = (acc[v] || 0) + 1;
              return acc;
          }, {});
          const total = items.length || 1;
          const labels = col.settings.labels;
          return (
              <div className="w-full h-6 flex overflow-hidden rounded-sm px-2">
                  {Object.entries(counts).map(([key, count]) => (
                      <div key={key} style={{width: `${(count/total)*100}%`, backgroundColor: labels[key] || '#ccc'}} className="h-full hover:opacity-80" title={`${key}: ${count}`}></div>
                  ))}
              </div>
          );
      }
      return null;
  };

  // --- LOADER ---
  if (isLoading || !board) return <div className="h-screen w-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 text-blue-600 animate-spin"/></div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-[#323338] font-sans overflow-hidden">
      
      {/* 1. TOP BAR */}
      <div className="h-12 bg-[#2b2c44] text-white flex items-center px-4 justify-between shrink-0 z-50">
         <div className="flex items-center gap-4">
            <div className="p-1 bg-blue-600 rounded cursor-pointer hover:bg-blue-500 transition"><Grid3x3 size={18}/></div>
            <span className="font-bold text-lg tracking-tight">monday<span className="font-normal opacity-80">.com</span></span>
            <div className="h-6 w-px bg-white/20 mx-2"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded hover:bg-white/20 cursor-pointer transition">
                <span className="text-xs">Workspaces</span>
                <ChevronDown size={12}/>
            </div>
         </div>
         <div className="flex items-center gap-4 text-white/80">
             <Bell size={18} className="hover:text-white cursor-pointer"/>
             <Inbox size={18} className="hover:text-white cursor-pointer"/>
             <UserPlus size={18} className="hover:text-white cursor-pointer"/>
             <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#2b2c44]">V</div>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. SIDEBAR */}
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-4' : 'w-64'} shrink-0 relative group/sidebar`}>
           <div 
             className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm z-20 opacity-0 group-hover/sidebar:opacity-100 transition"
             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
           >
               <ChevronRight size={14} className={`transition-transform ${!sidebarCollapsed ? 'rotate-180' : ''}`}/>
           </div>
           
           {!sidebarCollapsed && (
               <div className="flex flex-col h-full">
                   {/* Workspace Selector */}
                   <div className="p-4 border-b border-gray-100">
                       <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition">
                           <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-400 rounded text-white flex items-center justify-center text-lg">{workspace.icon}</div>
                           <div className="flex-1 min-w-0">
                               <div className="font-bold text-sm truncate">{workspace.name}</div>
                               <div className="text-xs text-gray-500">Free Plan</div>
                           </div>
                           <ChevronDown size={14}/>
                       </div>
                   </div>

                   {/* Boards List */}
                   <div className="flex-1 overflow-y-auto p-2 space-y-1">
                       <div className="flex items-center justify-between px-3 py-2 text-gray-500 hover:bg-gray-100 rounded cursor-pointer">
                           <span className="text-sm flex items-center gap-2"><Home size={14}/> Home</span>
                       </div>
                       <div className="flex items-center justify-between px-3 py-2 text-gray-500 hover:bg-gray-100 rounded cursor-pointer">
                           <span className="text-sm flex items-center gap-2"><MyWorkIcon/> My Work</span>
                       </div>
                       
                       <div className="mt-4 px-3 text-xs font-bold text-gray-400 uppercase">Favoris</div>
                       {workspace.boards.filter(b => b.favorited).map(b => (
                           <BoardNavItem key={b.id} board={b} isActive={activeBoardId === b.id} onClick={() => setActiveBoardId(b.id)} />
                       ))}

                       <div className="mt-4 px-3 flex items-center justify-between group/add">
                           <span className="text-xs font-bold text-gray-400 uppercase">Dashboards</span>
                           <Plus size={12} className="text-gray-400 cursor-pointer hover:text-blue-600 opacity-0 group-hover/add:opacity-100" onClick={() => {
                               const name = prompt("Nom du tableau:");
                               if(name) {
                                   const newB = createNewBoard(name);
                                   setWorkspaces(prev => prev.map(w => w.id === activeWsId ? {...w, boards: [...w.boards, newB]} : w));
                                   setActiveBoardId(newB.id);
                               }
                           }}/>
                       </div>
                       {workspace.boards.map(b => (
                           <BoardNavItem key={b.id} board={b} isActive={activeBoardId === b.id} onClick={() => setActiveBoardId(b.id)} />
                       ))}
                   </div>
                   
                   {/* Bottom Actions */}
                   <div className="p-2 border-t border-gray-200">
                       <div className="p-2 flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
                           <Plus size={16} className="bg-blue-600 text-white rounded p-0.5"/>
                           <span>Add New Item</span>
                       </div>
                   </div>
               </div>
           )}
        </div>

        {/* 3. MAIN BOARD AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
            
            {/* Header */}
            <div className="px-8 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 group">
                        <h1 className="text-3xl font-bold text-[#323338]">{board.name}</h1>
                        <Star 
                            size={20} 
                            className={`cursor-pointer transition ${board.favorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400 opacity-0 group-hover:opacity-100'}`}
                            onClick={() => updateBoard(b => ({...b, favorited: !b.favorited}))}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {workspace.members.map(m => (
                                <div key={m.id} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600" title={m.name}>{m.avatar}</div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-300 border-dashed flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition text-xs">+2</div>
                        </div>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                            <UserPlus size={14}/> / Invite
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 truncate mb-4">{board.description || "Ajoutez une description à ce tableau..."}</p>
                
                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200">
                    <Tab active={view === 'table'} label="Main Table" icon={<Home size={14}/>} onClick={() => setView('table')}/>
                    <Tab active={view === 'kanban'} label="Kanban" icon={<Grid3x3 size={14}/>} onClick={() => setView('kanban')}/>
                    <Tab active={view === 'gantt'} label="Gantt" icon={<BarChart3 size={14}/>} onClick={() => setView('gantt')}/>
                    <Tab active={view === 'chart'} label="Chart" icon={<PieChart size={14}/>} onClick={() => setView('chart')}/>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2 pb-2">
                        <button 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded transition"
                            onClick={() => setModal('automation')}
                        >
                            <Zap size={14} className="fill-purple-500 text-purple-500"/>
                            Automate
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded transition">
                            <Filter size={14}/> Filter
                        </button>
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-2 text-gray-400"/>
                            <input 
                                className="pl-7 pr-3 py-1.5 border border-gray-300 rounded-full text-sm focus:border-blue-500 focus:outline-none transition-all w-32 focus:w-48"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* VIEW CONTENT */}
            <div className="flex-1 overflow-auto bg-[#eceff8] p-6 relative">
                
                {/* --- TABLE VIEW --- */}
                {view === 'table' && (
                    <div className="space-y-8 pb-32">
                        {board.groups.map(group => (
                            <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200/60 overflow-hidden">
                                {/* Group Header */}
                                <div className="flex items-center gap-2 p-3 group/header sticky left-0">
                                    <ChevronDown 
                                        size={18} 
                                        className={`cursor-pointer text-gray-400 hover:bg-gray-100 rounded transition ${group.collapsed ? '-rotate-90' : ''}`}
                                        style={{color: group.color}}
                                        onClick={() => updateBoard(b => ({...b, groups: b.groups.map(g => g.id === group.id ? {...g, collapsed: !g.collapsed} : g)}))}
                                    />
                                    <div className="font-bold text-lg px-2 py-0.5 rounded hover:border hover:border-gray-300 border border-transparent cursor-text" style={{color: group.color}}>
                                        {group.name}
                                    </div>
                                    <span className="text-xs text-gray-400">{group.items.length} items</span>
                                    <div className="flex-1"></div>
                                    <div className="opacity-0 group-hover/header:opacity-100 transition flex gap-1">
                                        <button onClick={() => deleteGroup(group.id)} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded"><Trash2 size={14}/></button>
                                    </div>
                                </div>

                                {!group.collapsed && (
                                    <div className="overflow-x-auto">
                                        {/* Columns Header */}
                                        <div className="flex border-y border-gray-200 bg-white">
                                            <div className="w-8 sticky left-0 bg-white z-20 border-r border-gray-100"></div>
                                            <div className="w-1.5 sticky left-8 bg-white z-20" style={{backgroundColor: group.color}}></div>
                                            {board.columns.map(col => (
                                                <div 
                                                    key={col.id} 
                                                    className={`px-2 py-2 text-xs font-normal text-gray-500 text-center border-r border-gray-200 flex items-center justify-center shrink-0 ${col.fixed ? 'sticky left-[38px] z-20 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                                                    style={{width: col.width}}
                                                >
                                                    {col.title}
                                                </div>
                                            ))}
                                            <div className="w-10 border-r border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 shrink-0" onClick={() => setModal('column')}>
                                                <Plus size={16} className="text-gray-400"/>
                                            </div>
                                            <div className="flex-1 bg-white border-b border-gray-200"></div>
                                        </div>

                                        {/* Rows */}
                                        {group.items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                                            <div key={item.id} className="flex border-b border-gray-100 hover:bg-gray-50/50 group/row h-[38px]">
                                                <div className="w-8 sticky left-0 bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f6f8]">
                                                    <div className="w-4 h-4 border border-gray-300 rounded cursor-pointer"></div>
                                                </div>
                                                <div className="w-1.5 sticky left-8 z-10" style={{backgroundColor: group.color}}></div>
                                                
                                                {/* Cells */}
                                                {board.columns.map(col => (
                                                    <div 
                                                        key={col.id} 
                                                        className={`border-r border-gray-100 shrink-0 bg-white group-hover/row:bg-[#f5f6f8] ${col.fixed ? 'sticky left-[38px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                                                        style={{width: col.width}}
                                                    >
                                                        {col.type === 'name' ? (
                                                            <div className="w-full h-full flex items-center px-2 justify-between">
                                                                <input 
                                                                    className="bg-transparent border-none outline-none text-sm w-full text-gray-800" 
                                                                    value={item.name} 
                                                                    onChange={(e) => updateItemName(group.id, item.id, e.target.value)}
                                                                />
                                                                <div 
                                                                    className="opacity-0 group-hover/row:opacity-100 cursor-pointer text-gray-400 hover:text-blue-600 relative"
                                                                    onClick={() => setSidePanel({type: 'item', item, group})}
                                                                >
                                                                    <MessageSquare size={16} />
                                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            renderCell(col, item, group.id)
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="w-10 border-r border-gray-100 bg-white group-hover/row:bg-[#f5f6f8] flex items-center justify-center shrink-0"></div>
                                                <div className="flex-1 bg-white group-hover/row:bg-[#f5f6f8]"></div>
                                            </div>
                                        ))}

                                        {/* Add Item Row */}
                                        <div className="flex h-[38px] border-b border-gray-100">
                                            <div className="w-8 sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                                            <div className="w-1.5 sticky left-8 bg-white z-10" style={{backgroundColor: group.color}}></div>
                                            <div className="sticky left-[38px] z-10 bg-white w-[280px] border-r border-gray-100 flex items-center px-2">
                                                <input 
                                                    className="w-full text-sm outline-none placeholder-gray-400" 
                                                    placeholder="+ Add Item"
                                                    onKeyDown={(e) => {
                                                        if(e.key === 'Enter') {
                                                            addItem(group.id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 bg-white"></div>
                                        </div>

                                        {/* Footer Summary */}
                                        <div className="flex h-[38px] border-b border-gray-200 font-bold bg-white">
                                            <div className="w-8 sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                                            <div className="w-1.5 sticky left-8 bg-white z-10"></div>
                                            <div className="sticky left-[38px] z-10 bg-white w-[280px] border-r border-gray-100 flex items-center px-2 text-xs text-gray-400 uppercase"></div>
                                            {board.columns.map(col => {
                                                if(col.fixed) return null;
                                                return (
                                                    <div key={col.id} className="border-r border-gray-100 shrink-0 flex items-center justify-center bg-white" style={{width: col.width}}>
                                                        {renderFooterCell(col, group.items)}
                                                    </div>
                                                )
                                            })}
                                            <div className="flex-1 bg-white"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button 
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-blue-600 text-sm font-medium hover:bg-gray-50 shadow-sm transition"
                            onClick={addGroup}
                        >
                            <Plus size={16}/> Add New Group
                        </button>
                    </div>
                )}

                {/* --- KANBAN VIEW --- */}
                {view === 'kanban' && (
                    <div className="flex gap-6 h-full overflow-x-auto pb-4">
                        {Object.keys(board.columns.find(c => c.type === 'status').settings.labels).map(statusLabel => (
                            <div key={statusLabel} className="w-72 shrink-0 flex flex-col h-full">
                                <div className="font-bold mb-3 px-3 py-1 rounded-t-lg text-white text-sm" style={{backgroundColor: board.columns.find(c => c.type === 'status').settings.labels[statusLabel] || '#ccc'}}>
                                    {statusLabel || 'Empty'}
                                </div>
                                <div className="flex-1 bg-gray-100/50 rounded-b-lg p-2 space-y-3 overflow-y-auto">
                                    {board.groups.flatMap(g => g.items).filter(i => i.values['c_status'] === statusLabel).map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition">
                                            <div className="text-sm font-medium mb-2">{item.name}</div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">V</div>
                                                <div className="text-xs text-gray-400">#{item.id.substr(0,4)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- CHART VIEW --- */}
                {view === 'chart' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <PieChart size={64} className="text-gray-300"/>
                        <p>Charts & Dashboards are available in the Enterprise Plan.</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium">Upgrade Now</button>
                    </div>
                )}

                {/* --- GANTT VIEW --- */}
                {view === 'gantt' && (
                    <div className="bg-white rounded shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between">
                            <h3 className="font-bold">Project Timeline</h3>
                            <div className="flex gap-2">
                                <button className="px-2 py-1 text-xs border rounded bg-gray-100">Weeks</button>
                                <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Months</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto relative">
                            {/* Fake Gantt Grid */}
                            <div className="flex h-full min-w-[1000px]">
                                <div className="w-64 border-r border-gray-200 bg-gray-50 shrink-0 sticky left-0 z-10">
                                    <div className="h-10 border-b border-gray-200 flex items-center px-4 font-bold text-xs text-gray-500">Item</div>
                                    {board.groups.flatMap(g => g.items).map(i => (
                                        <div key={i.id} className="h-8 border-b border-gray-100 flex items-center px-4 text-xs truncate bg-white">{i.name}</div>
                                    ))}
                                </div>
                                <div className="flex-1 relative">
                                    {/* Grid Lines */}
                                    {Array.from({length: 20}).map((_, i) => (
                                        <div key={i} className="absolute top-0 bottom-0 border-r border-gray-100 text-[10px] text-gray-400 pt-2 pl-1" style={{left: `${i * 100}px`}}>
                                            W{i+1}
                                        </div>
                                    ))}
                                    {/* Bars */}
                                    <div className="mt-10">
                                        {board.groups.flatMap(g => g.items).map((i, idx) => (
                                            <div key={i.id} className="h-8 relative flex items-center">
                                                <div 
                                                    className="h-4 rounded-full absolute"
                                                    style={{
                                                        backgroundColor: COLORS.status[i.values['c_status']?.toLowerCase()] || COLORS.status.blue,
                                                        left: `${Math.random() * 200 + 50}px`,
                                                        width: `${Math.random() * 200 + 50}px`
                                                    }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

      </div>

      {/* --- SIDE PANEL (UPDATES) --- */}
      {sidePanel && (
          <div className="absolute top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-[60] flex flex-col transform transition-transform duration-300 border-l border-gray-200">
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                  <div className="font-bold text-lg">{sidePanel.item.name}</div>
                  <X size={20} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSidePanel(null)}/>
              </div>
              <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                      <textarea className="w-full resize-none outline-none text-sm min-h-[80px]" placeholder="Write an update..."></textarea>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <div className="flex gap-2 text-gray-400">
                              <Paperclip size={16} className="cursor-pointer hover:text-blue-600"/>
                              <SmileIcon/>
                          </div>
                          <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Update</button>
                      </div>
                  </div>
                  
                  {/* Fake History */}
                  <div className="space-y-6">
                      <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">V</div>
                          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
                              <div className="absolute -left-2 top-4 w-3 h-3 bg-white border-l border-t border-gray-200 transform -rotate-45"></div>
                              <div className="flex justify-between mb-2">
                                  <span className="font-bold text-sm text-blue-600">Vous</span>
                                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> 2d ago</span>
                              </div>
                              <p className="text-sm text-gray-700">Started working on this task. Waiting for approval.</p>
                              <div className="mt-4 flex gap-4 text-xs font-medium text-gray-500">
                                  <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><ThumbsUp size={12}/> Like</span>
                                  <span className="cursor-pointer hover:text-blue-600">Reply</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- ADD COLUMN MODAL --- */}
      {modal === 'column' && (
          <div className="fixed inset-0 bg-black/20 z-[70] flex items-center justify-center" onClick={() => setModal(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-bold">Column Center</h2>
                      <p className="text-gray-500 text-sm">Add new columns to your board</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4">
                      {[
                          {id: 'status', label: 'Status', icon: <CheckSquare className="text-green-500"/>, desc: 'Track progress'},
                          {id: 'people', label: 'People', icon: <Users className="text-blue-500"/>, desc: 'Assign items'},
                          {id: 'date', label: 'Date', icon: <CalIcon className="text-orange-500"/>, desc: 'Add deadlines'},
                          {id: 'timeline', label: 'Timeline', icon: <Activity className="text-purple-500"/>, desc: 'Visual timeline'},
                          {id: 'numbers', label: 'Numbers', icon: <Hash className="text-red-500"/>, desc: 'Track budget/qty'},
                          {id: 'rating', label: 'Rating', icon: <Star className="text-yellow-500"/>, desc: 'Rate items'},
                          {id: 'text', label: 'Text', icon: <FileText className="text-gray-500"/>, desc: 'Free text notes'},
                          {id: 'tags', label: 'Tags', icon: <Tag className="text-indigo-500"/>, desc: 'Categorize items'},
                      ].map(type => (
                          <div key={type.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition flex flex-col items-center text-center gap-2 group"
                               onClick={() => addColumn(type.id, type.label)}>
                              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition">{type.icon}</div>
                              <div className="font-bold text-sm">{type.label}</div>
                              <div className="text-xs text-gray-400">{type.desc}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- AUTOMATION MODAL --- */}
      {modal === 'automation' && (
          <div className="fixed inset-0 bg-[#2b2c44]/50 z-[70] flex items-center justify-center backdrop-blur-sm" onClick={() => setModal(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="bg-[#2b2c44] text-white p-6 flex justify-between items-center">
                      <div>
                          <h2 className="text-xl font-bold flex items-center gap-2"><Zap className="fill-yellow-400 text-yellow-400"/> Automations Center</h2>
                          <p className="text-white/60 text-sm">Automate your workflow in seconds</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 rounded font-medium hover:bg-blue-500">Create Custom Automation</button>
                  </div>
                  <div className="flex-1 bg-gray-50 p-8 grid grid-cols-2 gap-6 overflow-y-auto">
                      {[
                          "When Status changes to Done, move item to Group Done",
                          "When date arrives, notify Person",
                          "When Item created, assign to Me",
                          "When Priority is High, send email to Admin",
                          "Every Monday, create a new task"
                      ].map((text, i) => (
                          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between h-40 hover:shadow-lg hover:border-blue-300 cursor-pointer transition">
                              <div className="text-lg font-medium text-gray-700 leading-relaxed">
                                  {text.split(' ').map((word, idx) => (
                                      ['Status', 'Done', 'Group', 'Person', 'Item', 'Priority', 'High', 'Monday'].includes(word.replace(',','')) ? 
                                      <span key={idx} className="bg-blue-50 text-blue-600 px-1 rounded border border-blue-100 mx-0.5">{word}</span> : 
                                      <span key={idx}>{word} </span>
                                  ))}
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                  <span className="text-xs text-gray-400">Used 1.2k times</span>
                                  <button className="text-sm font-bold text-blue-600 hover:underline">Add to Board</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- STATUS BAR --- */}
      <div className="fixed bottom-4 right-4 z-[100] flex gap-2">
          {isSaving && <div className="bg-white px-3 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 text-xs font-bold text-blue-600 animate-pulse"><Loader2 size={12} className="animate-spin"/> Saving...</div>}
          {!isSaving && <div className="bg-[#2b2c44] text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium"><Cloud size={12}/> Synced</div>}
      </div>

    </div>
  );
};

// --- SUB-COMPONENTS ---
const BoardNavItem = ({ board, isActive, onClick }) => (
    <div onClick={onClick} className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition group ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
        <span className="text-sm flex items-center gap-2 truncate"><FileText size={14} className={isActive ? 'fill-blue-100' : ''}/> {board.name}</span>
        {board.favorited && <Star size={10} className="fill-yellow-400 text-yellow-400"/>}
    </div>
);

const Tab = ({ active, label, icon, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm cursor-pointer border-b-2 transition ${active ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
    >
        {icon} {label}
    </div>
);

const SmileIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
const MyWorkIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;

export default TuesdayCom;