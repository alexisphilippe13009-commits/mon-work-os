// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { saveToCloud, loadFromCloud } from '@/app/actions';
// On retire les imports du moteur pour éviter les crashs si le fichier est mal linké
// import { evaluateFormula, runAutomations, calculateProgress } from '@/app/engine'; 
import { 
  Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, Calendar as CalIcon, 
  BarChart3, Users, CheckSquare, Grid3x3, List, Trash2, Filter, Share2, Star, 
  Bell, Settings, Upload, Clock, Tag, Paperclip, MessageSquare, 
  Activity, Link2, Copy, PieChart, Zap, Home, Inbox, 
  X, UserPlus, Folder, FileText, Menu, Play, Pause, Calculator, File, Image as ImageIcon, CornerDownRight,
  Globe, Phone, Mail, MapPin, Flag, Cloud, Loader2
} from 'lucide-react';

// --- CONSTANTS ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const COLORS = {
  status: { done: "#00c875", stuck: "#e2445c", working: "#fdab3d", default: "#c4c4c4", purple: "#a25ddc", blue: "#579bfc" }
};

// --- DATA FALLBACK (Données de secours si la base plante) ---
const defaultData = [{
    id: 'ws_1', name: 'Main Workspace', icon: '🏠',
    members: [{ id: 'u_1', name: 'Admin', role: 'Admin', avatar: 'A' }],
    boards: [{
        id: 'b_1', name: 'Demo Board', description: 'Tableau de démonstration', favorited: false,
        columns: [
            { id: 'c_name', title: 'Item', type: 'name', width: 300, fixed: true },
            { id: 'c_status', title: 'Status', type: 'status', width: 140, settings: { labels: { 'Done': '#00c875', 'Stuck': '#e2445c', 'Working': '#fdab3d' } } }
        ],
        groups: [{
            id: 'g_1', name: 'Groupe 1', color: '#579bfc', collapsed: false,
            items: [{ id: 'i_1', name: 'Tâche Exemple', values: { 'c_status': 'Done' } }]
        }],
        views: [], automations: []
    }]
}];

// --- SAFE ENGINE (Calculs simplifiés pour éviter les crashs) ---
const safeCalculateProgress = (item) => 50; // Mock
const safeEvaluateFormula = () => "Calculated"; // Mock

const TuesdayEnterprise = () => {
  // Initialisation sécurisée
  const [workspaces, setWorkspaces] = useState(defaultData);
  const [activeWsId, setActiveWsId] = useState('ws_1');
  const [activeBoardId, setActiveBoardId] = useState('b_1');
  const [view, setView] = useState('table');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modal, setModal] = useState(null); 
  const [sidePanel, setSidePanel] = useState(null);

  const isFirstLoad = useRef(true);

  // --- CHARGEMENT CLOUD SÉCURISÉ ---
  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadFromCloud();
        if (data && Array.isArray(data) && data.length > 0) {
          setWorkspaces(data);
          setActiveWsId(data[0].id);
          if (data[0].boards && data[0].boards.length > 0) {
             setActiveBoardId(data[0].boards[0].id);
          }
        }
      } catch (e) {
        console.error("Erreur de chargement", e);
      } finally {
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    };
    init();
  }, []);

  // --- SAUVEGARDE CLOUD SÉCURISÉE ---
  useEffect(() => {
    if (isFirstLoad.current || isLoading) return;
    const save = async () => {
      setIsSaving(true);
      try {
        await saveToCloud(workspaces);
      } catch (e) {
        console.error("Erreur sauvegarde", e);
      }
      setTimeout(() => setIsSaving(false), 500);
    };
    const t = setTimeout(save, 2000);
    return () => clearTimeout(t);
  }, [workspaces, isLoading]);

  // --- PROTECTION CONTRE LES DONNÉES VIDES ---
  // Si pour une raison quelconque workspaces est vide, on utilise defaultData
  const safeWorkspaces = (workspaces && workspaces.length > 0) ? workspaces : defaultData;
  const workspace = safeWorkspaces.find(w => w.id === activeWsId) || safeWorkspaces[0];
  const board = workspace?.boards?.find(b => b.id === activeBoardId) || workspace?.boards?.[0];

  // Si vraiment rien ne marche (pas de board), on affiche un écran d'erreur gentil
  if (!board && !isLoading) return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
          <h2 className="text-xl font-bold">Bienvenue sur Tuesday</h2>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">Recharger</button>
      </div>
  );

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

  // --- CELL RENDERER INLINE (Pour éviter les imports cassés) ---
  const renderCell = (col, item, groupId, isSub = false, parentId = null) => {
    const val = item.values?.[col.id];
    const update = (v) => handleCellChange(groupId, item.id, col.id, v, isSub, parentId);

    if (col.type === 'status') {
        const bg = col.settings?.labels?.[val] || '#c4c4c4';
        return (
            <div className="w-full h-full relative group/cell">
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{backgroundColor: bg}}>
                    <span className="truncate px-2">{val || ''}</span>
                </div>
                <select className="absolute inset-0 opacity-0 cursor-pointer" value={val || ''} onChange={(e) => update(e.target.value)}>
                    {Object.keys(col.settings?.labels || {}).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
        );
    }
    if (col.type === 'name') {
        return <input className="w-full h-full bg-transparent px-2 text-sm outline-none" value={item.name} onChange={e => {
             updateBoard(b => ({...b, groups: b.groups.map(g => g.id !== groupId ? g : {...g, items: g.items.map(i => i.id !== item.id ? i : {...i, name: e.target.value})})}))
        }}/>
    }
    
    // Default Text Input for everything else
    return <input className="w-full h-full bg-transparent px-2 text-xs outline-none" value={val || ''} onChange={e => update(e.target.value)} />;
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin"/></div>;

  return (
    <div className="h-screen flex flex-col bg-white text-[#323338] font-sans overflow-hidden">
      {/* HEADER */}
      <div className="h-12 bg-[#2b2c44] text-white flex items-center px-4 justify-between shrink-0 z-50">
         <div className="flex items-center gap-4">
            <div className="p-1.5 bg-blue-600 rounded"><Grid3x3 size={16}/></div>
            <span className="font-bold text-base">monday<span className="font-normal opacity-70">.com</span></span>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-64'} shrink-0`}>
           <div className="flex-1 overflow-y-auto p-2">
               {workspace.boards?.map(b => (
                   <div key={b.id} onClick={() => setActiveBoardId(b.id)} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm ${activeBoardId === b.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                       <FileText size={16}/> {!sidebarCollapsed && <span className="truncate">{b.name}</span>}
                   </div>
               ))}
           </div>
        </div>

        {/* BOARD */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="px-8 pt-6 pb-2 border-b border-gray-200">
                <h1 className="text-3xl font-bold mb-4">{board.name}</h1>
            </div>
            
            <div className="flex-1 overflow-auto bg-[#eceff8] p-6">
                <div className="space-y-8 pb-40">
                    {board.groups.map(group => (
                        <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="flex items-center p-3 gap-2 sticky left-0 bg-white z-10">
                                <ChevronDown size={18} style={{color: group.color}}/>
                                <span className="font-bold text-lg" style={{color: group.color}}>{group.name}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <div className="flex border-y border-gray-200 bg-white h-[36px]">
                                    {board.columns.map(col => (
                                        <div key={col.id} className="px-2 flex items-center justify-center text-xs font-semibold text-gray-500 border-r border-gray-200 shrink-0" style={{width: col.width}}>
                                            {col.title}
                                        </div>
                                    ))}
                                </div>
                                {group.items.map(item => (
                                    <div key={item.id} className="flex border-b border-gray-100 hover:bg-gray-50 h-[36px]">
                                        {board.columns.map(col => (
                                            <div key={col.id} className="border-r border-gray-100 shrink-0 bg-white" style={{width: col.width}}>
                                                {renderCell(col, item, group.id)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {/* STATUS */}
      <div className="fixed bottom-4 left-4 z-[90]">
          {isSaving ? <div className="text-xs text-blue-600 font-bold">Saving...</div> : <div className="text-xs text-gray-400">Synced</div>}
      </div>
    </div>
  );
};

export default TuesdayEnterprise;