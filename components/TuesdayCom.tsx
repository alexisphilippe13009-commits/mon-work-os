// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { saveToCloud, loadFromCloud } from '@/app/actions';
import { 
  Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, Calendar as CalIcon, 
  BarChart3, Users, CheckSquare, Grid3x3, List, Trash2, Filter, Share2, Star, 
  Bell, Settings, Upload, Clock, Tag, Paperclip, MessageSquare, 
  Activity, Link2, Copy, PieChart, Zap, Home, Inbox, 
  X, UserPlus, Folder, FileText, Menu, Play, Pause, Calculator, File, Image as ImageIcon, CornerDownRight,
  Globe, Phone, Mail, MapPin, Flag, Cloud, Loader2
} from 'lucide-react';

// --- UTILS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const COLORS = {
  monday_blue: "#0073ea",
  monday_dark: "#2b2c44",
  status: {
    done: "#00c875", stuck: "#e2445c", working: "#fdab3d", default: "#c4c4c4", 
    purple: "#a25ddc", blue: "#579bfc", black: "#333333", indigo: "#4E5BA6"
  }
};

// --- DATA INITIALE RICHE (POUR L'EFFET WOW) ---
const createEnterpriseBoard = (name) => ({
  id: generateId(),
  name: name,
  description: 'Projet Stratégique Q1 2026',
  favorited: false,
  views: [{ id: 'v1', type: 'table', name: 'Main Table' }, { id: 'v2', type: 'kanban', name: 'Kanban' }],
  columns: [
    { id: 'c_name', title: 'Item', type: 'name', width: 340, fixed: true },
    { id: 'c_person', title: 'Propriétaire', type: 'people', width: 100 },
    { id: 'c_status', title: 'Statut', type: 'status', width: 140, settings: { labels: { 'Fait': COLORS.status.done, 'Bloqué': COLORS.status.stuck, 'En cours': COLORS.status.working, '': COLORS.status.default } }},
    { id: 'c_date', title: 'Échéance', type: 'date', width: 120 },
    { id: 'c_priority', title: 'Priorité', type: 'status', width: 140, settings: { labels: { 'Haute': '#e2445c', 'Moyenne': '#fdab3d', 'Basse': '#579bfc' } } },
    { id: 'c_numbers', title: 'Budget (€)', type: 'numbers', width: 120 },
    { id: 'c_files', title: 'Fichiers', type: 'files', width: 100 },
    { id: 'c_rating', title: 'Impact', type: 'rating', width: 120 }
  ],
  groups: [
    {
      id: generateId(), name: '📌 Objectifs Q1', color: COLORS.status.blue, collapsed: false,
      items: [
        { id: generateId(), name: 'Lancement Site Web V2', values: { 'c_status': 'Fait', 'c_priority': 'Haute', 'c_numbers': 5000, 'c_person': ['Admin'] } },
        { id: generateId(), name: 'Campagne Marketing', values: { 'c_status': 'En cours', 'c_priority': 'Haute', 'c_numbers': 15000 }, subitems: [
            { id: generateId(), name: 'Création Assets', values: { 'c_status': 'Fait' } },
            { id: generateId(), name: 'Setup Ads', values: { 'c_status': 'En cours' } }
        ]}
      ]
    },
    { 
      id: generateId(), name: '🚀 Backlog Technique', color: COLORS.status.purple, collapsed: false, 
      items: [
        { id: generateId(), name: 'Migration Base de données', values: { 'c_status': 'Bloqué', 'c_priority': 'Moyenne' } }
      ]
    }
  ]
});

const TuesdayEnterprise = () => {
  // --- STATE ---
  const [workspaces, setWorkspaces] = useState([{
    id: 'ws_1', name: 'Entreprise Space', icon: '🏢',
    members: [{ id: 'u_1', name: 'Admin', role: 'Admin', avatar: 'A' }],
    boards: [createEnterpriseBoard('Roadmap Globale')]
  }]);
  
  const [activeWsId, setActiveWsId] = useState('ws_1');
  const [activeBoardId, setActiveBoardId] = useState(null); // Sera set au chargement
  const [view, setView] = useState('table');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modal, setModal] = useState(null); 
  const [sidePanel, setSidePanel] = useState(null);
  const [expandedSubitems, setExpandedSubitems] = useState({});

  const isFirstLoad = useRef(true);

  // --- SYNC ---
  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadFromCloud();
        if (data && Array.isArray(data) && data.length > 0) {
          setWorkspaces(data);
          setActiveWsId(data[0].id);
          setActiveBoardId(data[0].boards[0]?.id);
        } else {
          // Init default
          setActiveBoardId(workspaces[0].boards[0].id);
        }
      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); isFirstLoad.current = false; }
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
    const t = setTimeout(save, 2000);
    return () => clearTimeout(t);
  }, [workspaces, isLoading]);

  // --- HELPERS ---
  const workspace = workspaces.find(w => w.id === activeWsId) || workspaces[0];
  const board = workspace?.boards?.find(b => b.id === activeBoardId) || workspace?.boards?.[0];

  const updateBoard = (fn) => {
    setWorkspaces(prev => prev.map(w => w.id !== activeWsId ? w : { 
      ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : fn(b)) 
    }));
  };

  const handleCellChange = (groupId, itemId, colId, value, isSub = false, parentId = null) => {
      updateBoard(b => ({
          ...b, groups: b.groups.map(g => g.id !== groupId ? g : {
              ...g, items: isSub 
                ? g.items.map(i => i.id !== parentId ? i : { ...i, subitems: (i.subitems || []).map(s => s.id !== itemId ? s : { ...s, values: { ...s.values, [colId]: value } }) })
                : g.items.map(i => i.id !== itemId ? i : { ...i, values: { ...i.values, [colId]: value } })
          })
      }));
  };

  const addGroup = () => updateBoard(b => ({ ...b, groups: [...b.groups, { id: generateId(), name: 'Nouveau Groupe', color: COLORS.status.blue, collapsed: false, items: [] }] }));
  
  const addColumn = (type, title) => {
      const settings = type === 'status' ? { labels: { 'Fait': COLORS.status.done, 'En cours': COLORS.status.working, 'Bloqué': COLORS.status.stuck } } : {};
      updateBoard(b => ({ ...b, columns: [...b.columns, { id: `c_${generateId()}`, title, type, width: 140, settings }] }));
      setModal(null);
  };

  // --- RENDERERS ---
  const renderCell = (col, item, groupId, isSub = false, parentId = null) => {
    const val = item.values?.[col.id];
    const update = (v) => handleCellChange(groupId, item.id, col.id, v, isSub, parentId);

    if (col.type === 'status') {
        const bg = col.settings?.labels?.[val] || '#c4c4c4';
        return (
            <div className="w-full h-full relative group/cell">
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-90" style={{backgroundColor: bg}}>
                    <span className="truncate px-2">{val || ''}</span>
                    <div className="absolute right-1 opacity-0 group-hover/cell:opacity-100"><CornerDownRight size={10}/></div>
                </div>
                <select className="absolute inset-0 opacity-0 cursor-pointer" value={val || ''} onChange={(e) => update(e.target.value)}>
                    {Object.keys(col.settings?.labels || {}).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
        );
    }
    if (col.type === 'people') {
        return (
            <div className="w-full h-full flex items-center justify-center relative hover:bg-gray-100 cursor-pointer">
                {val && val.length > 0 ? (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] border-2 border-white font-bold">{val[0].charAt(0)}</div>
                ) : <Users size={16} className="text-gray-300"/>}
                <select className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => update([e.target.value])}>
                    <option value="">Assigner...</option>
                    {workspace.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
            </div>
        );
    }
    if (col.type === 'rating') {
        return (
            <div className="w-full h-full flex items-center justify-center gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className={`cursor-pointer ${s <= (val||0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} onClick={() => update(s)}/>)}
            </div>
        );
    }
    
    return <input className="w-full h-full bg-transparent px-2 text-xs outline-none" value={val || ''} onChange={e => update(e.target.value)} />;
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin"/></div>;
  if (!board) return <div className="h-screen flex items-center justify-center"><button onClick={()=>window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded">Recharger</button></div>;

  return (
    <div className="h-screen flex flex-col bg-white text-[#323338] font-sans overflow-hidden">
      
      {/* 1. TOP BAR */}
      <div className="h-12 bg-[#2b2c44] text-white flex items-center px-4 justify-between shrink-0 z-50 shadow-md">
         <div className="flex items-center gap-4">
            <div className="p-1.5 bg-blue-600 rounded hover:bg-blue-500 transition cursor-pointer"><Grid3x3 size={16}/></div>
            <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight">tuesday<span className="font-normal opacity-70">.com</span></span>
                <span className="text-[9px] text-yellow-400 font-bold tracking-widest uppercase">Enterprise</span>
            </div>
         </div>
         <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded cursor-pointer hover:bg-white/20 transition">
                 <Search size={14}/>
                 <span className="text-xs opacity-70 hidden md:inline">Rechercher...</span>
             </div>
             <Bell size={18} className="hover:text-white cursor-pointer opacity-80"/>
             <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#2b2c44] shadow-sm">Moi</div>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. SIDEBAR */}
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-64'} shrink-0 relative z-40`}>
           <div className="p-3 border-b border-gray-100 flex items-center justify-between group">
               {!sidebarCollapsed && (
                   <div className="flex items-center gap-2 px-2">
                       <div className="w-6 h-6 bg-pink-500 rounded text-white flex items-center justify-center text-xs">{workspace.icon}</div>
                       <span className="text-sm font-bold truncate">{workspace.name}</span>
                       <ChevronDown size={14} className="text-gray-400"/>
                   </div>
               )}
               <div className="p-1 hover:bg-gray-100 rounded cursor-pointer ml-auto" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                   {sidebarCollapsed ? <ChevronRight size={16}/> : <Menu size={16}/>}
               </div>
           </div>
           
           {!sidebarCollapsed ? (
               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                   <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-2">Tableaux</div>
                   {workspace.boards.map(b => (
                       <div key={b.id} onClick={() => setActiveBoardId(b.id)} className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm group transition-colors ${activeBoardId === b.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                           <div className="flex items-center gap-3 truncate">
                               <FileText size={16} className={activeBoardId === b.id ? 'fill-blue-200' : ''}/>
                               <span className="truncate">{b.name}</span>
                           </div>
                       </div>
                   ))}
                   <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-50 w-full rounded mt-2" onClick={() => {
                       const n = prompt("Nom du tableau");
                       if(n) {
                           const nb = createEnterpriseBoard(n);
                           setWorkspaces(prev => prev.map(w => w.id === activeWsId ? {...w, boards: [...w.boards, nb]} : w));
                           setActiveBoardId(nb.id);
                       }
                   }}><Plus size={14}/> Ajouter</button>
               </div>
           ) : (
               <div className="flex flex-col items-center pt-4 gap-4">
                   {workspace.boards.map(b => (
                       <div key={b.id} className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setActiveBoardId(b.id)}>
                           <FileText size={20} className={activeBoardId === b.id ? 'text-blue-600' : 'text-gray-500'}/>
                       </div>
                   ))}
               </div>
           )}
        </div>

        {/* 3. MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            {/* HEADER BOARD */}
            <div className="px-8 pt-6 pb-0 bg-white z-30">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold text-[#323338]">{board.name}</h1>
                            <Star size={20} className={`cursor-pointer transition ${board.favorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} onClick={() => updateBoard(b => ({...b, favorited: !b.favorited}))}/>
                        </div>
                        <p className="text-sm text-gray-500">{board.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 mr-2">
                            {workspace.members.map(m => (
                                <div key={m.id} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600" title={m.name}>{m.avatar}</div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-300 border-dashed flex items-center justify-center text-gray-400 text-xs cursor-pointer hover:border-blue-500 hover:text-blue-500">+1</div>
                        </div>
                        <button className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-2 transition" onClick={() => setModal('invite')}><UserPlus size={14}/> Inviter</button>
                    </div>
                </div>

                <div className="flex items-center border-b border-gray-200">
                    <button className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition ${view === 'table' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'}`} onClick={() => setView('table')}><Home size={16}/> Tableau Principal</button>
                    <button className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition ${view === 'kanban' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'}`} onClick={() => setView('kanban')}><Grid3x3 size={16}/> Kanban</button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button className="px-3 py-1 text-sm flex items-center gap-1 text-gray-500 hover:bg-gray-100 rounded transition" onClick={() => setModal('column')}><Plus size={14}/></button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2 pb-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded transition" onClick={() => setModal('automation')}>
                            <Zap size={16} className="fill-current"/> Automatisations
                        </button>
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-2 text-gray-400"/>
                            <input className="pl-7 pr-3 py-1.5 border border-gray-300 rounded-full text-sm focus:border-blue-500 focus:outline-none w-32 focus:w-48 transition-all" placeholder="Filtrer"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-auto bg-[#eceff8] p-6 pb-20">
                {view === 'table' && (
                    <div className="space-y-10">
                        {board.groups.map(group => (
                            <div key={group.id} className="bg-white rounded-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
                                <div className="flex items-center p-3 sticky left-0 z-30 bg-white group/gheader">
                                    <div className="p-1 hover:bg-gray-100 rounded cursor-pointer transition mr-2" onClick={() => updateBoard(b => ({...b, groups: b.groups.map(g => g.id === group.id ? {...g, collapsed: !g.collapsed} : g)}))}>
                                        <ChevronDown size={18} className={`transition-transform duration-200 ${group.collapsed ? '-rotate-90' : ''}`} style={{color: group.color}}/>
                                    </div>
                                    <div className="font-bold text-lg px-2 py-0.5 rounded hover:border hover:border-gray-300 border border-transparent cursor-text transition" style={{color: group.color}}>{group.name}</div>
                                    <span className="text-xs text-gray-400 ml-4 font-medium">{group.items.length} éléments</span>
                                </div>

                                {!group.collapsed && (
                                    <div className="overflow-x-auto">
                                        <div className="flex border-y border-gray-200 bg-white h-[36px]">
                                            <div className="w-8 sticky left-0 bg-white z-20 border-r border-gray-100"></div>
                                            <div className="w-1.5 sticky left-8 bg-white z-20" style={{backgroundColor: group.color}}></div>
                                            <div className="w-8 sticky left-[38px] bg-white z-20 border-r border-gray-100 flex items-center justify-center"><input type="checkbox" className="rounded border-gray-300"/></div>
                                            
                                            {board.columns.map(col => (
                                                <div key={col.id} className={`px-2 flex items-center justify-center text-xs font-semibold text-gray-500 border-r border-gray-200 shrink-0 ${col.fixed ? 'sticky left-[70px] z-20 bg-white shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]' : ''}`} style={{width: col.width}}>{col.title}</div>
                                            ))}
                                            <div className="w-10 border-r border-gray-200 flex items-center justify-center hover:bg-blue-50 cursor-pointer transition" onClick={() => setModal('column')}><Plus size={16} className="text-gray-400 hover:text-blue-600"/></div>
                                            <div className="flex-1 bg-white"></div>
                                        </div>

                                        {group.items.map(item => (
                                            <React.Fragment key={item.id}>
                                                <div className="flex border-b border-gray-100 hover:bg-[#f5f7fa] group/row h-[40px] bg-white transition-colors">
                                                    <div className="w-8 sticky left-0 bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f7fa]"><Menu size={12} className="text-gray-300 cursor-grab opacity-0 group-hover/row:opacity-100"/></div>
                                                    <div className="w-1.5 sticky left-8 z-10" style={{backgroundColor: group.color}}></div>
                                                    <div className="w-8 sticky left-[38px] bg-white z-10 border-r border-gray-100 flex items-center justify-center group-hover/row:bg-[#f5f7fa]"><input type="checkbox" className="rounded border-gray-300"/></div>

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
                                                                            {item.updates && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : renderCell(col, item, group.id)}
                                                        </div>
                                                    ))}
                                                    <div className="flex-1 bg-white group-hover/row:bg-[#f5f7fa]"></div>
                                                </div>
                                                
                                                {/* SUBITEMS */}
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
                                                                ) : renderCell(col, sub, group.id, true, item.id)}
                                                            </div>
                                                        ))}
                                                        <div className="flex-1 bg-[#f7f9fa]"></div>
                                                    </div>
                                                ))}
                                            </React.Fragment>
                                        ))}

                                        <div className="flex h-[40px] border-b border-gray-100 bg-white">
                                            <div className="w-[70px] sticky left-0 bg-white z-10 border-r border-gray-100"></div>
                                            <div className="sticky left-[70px] z-10 bg-white w-[340px] border-r border-gray-100 flex items-center px-2">
                                                <input className="w-full text-sm outline-none placeholder-gray-400 hover:bg-gray-50 p-1 rounded" placeholder="+ Ajouter un élément" onKeyDown={(e) => {if(e.key==='Enter'){updateBoard(b => ({...b, groups: b.groups.map(g => g.id !== group.id ? g : {...g, items: [...g.items, {id: generateId(), name: e.target.value, values:{}, subitems:[]}]})})); e.target.value='';}}}/>
                                            </div>
                                            <div className="flex-1 bg-white"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50 text-gray-700 transition" onClick={addGroup}><Plus size={16}/> Ajouter un groupe</button>
                    </div>
                )}

                {view === 'kanban' && (
                    <div className="flex gap-6 h-full overflow-x-auto pb-6">
                        {Object.entries(board.columns.find(c => c.type === 'status')?.settings.labels || {}).map(([label, color]) => (
                            <div key={label} className="w-72 shrink-0 flex flex-col h-full rounded-lg bg-gray-100/50 p-2">
                                <div className="font-bold mb-3 px-3 py-2 rounded text-white text-sm shadow-sm flex justify-between" style={{backgroundColor: color}}>
                                    <span>{label || 'Vide'}</span>
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

      {/* MODALS */}
      {modal === 'column' && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm" onClick={() => setModal(null)}>
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[600px] grid grid-cols-4 gap-4" onClick={e => e.stopPropagation()}>
                  {[{id:'status',l:'Statut',i:<CheckSquare/>},{id:'text',l:'Texte',i:<FileText/>},{id:'people',l:'Personne',i:<Users/>},{id:'numbers',l:'Chiffres',i:<Calculator/>},{id:'date',l:'Date',i:<CalIcon/>},{id:'files',l:'Fichier',i:<File/>},{id:'rating',l:'Vote',i:<Star/>}].map(t => (
                      <div key={t.id} className="flex flex-col items-center gap-2 p-4 border rounded hover:border-blue-500 hover:shadow-md cursor-pointer transition text-center" onClick={() => addColumn(t.id, t.l)}>
                          <div className="text-gray-500">{t.i}</div>
                          <div className="font-medium text-xs">{t.l}</div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* SIDE PANEL */}
      {sidePanel && (
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-[80] border-l border-gray-200 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
                  <div className="font-bold text-xl truncate pr-4">{sidePanel.name}</div>
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setSidePanel(null)}><X size={20} className="text-gray-500"/></div>
              </div>
              <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                      <textarea className="w-full resize-none outline-none text-sm min-h-[100px] placeholder-gray-400" placeholder="Écrire une mise à jour..."></textarea>
                      <div className="flex justify-end mt-4"><button className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition">Publier</button></div>
                  </div>
              </div>
          </div>
      )}

      {/* SYNC STATUS */}
      <div className="fixed bottom-4 left-4 z-[90]">
          {isSaving ? <div className="text-xs text-blue-600 font-bold flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Saving...</div> : <div className="text-xs text-gray-400 flex items-center gap-1"><Cloud size={10}/> Synced</div>}
      </div>
    </div>
  );
};

export default TuesdayEnterprise;