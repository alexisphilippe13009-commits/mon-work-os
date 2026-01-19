// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { saveToCloud, loadFromCloud } from '@/app/actions';
import { Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, Calendar, BarChart3, Users, CheckSquare, Grid3x3, List, Trash2, Filter, Share2, Star, Bell, Settings, Download, Upload, Clock, Tag, Paperclip, MessageSquare, Activity, Link2, Copy, Eye, EyeOff, TrendingUp, PieChart, Zap, Home, Inbox, Play, X, Edit2, UserPlus, Folder, FileText, Archive, Menu, LogOut, CreditCard, Building2, Mail, Cloud, Loader2 } from 'lucide-react';

const TuesdayCom = () => {
  // --- DONNÉES PAR DÉFAUT (Si la base est vide) ---
  const defaultData = [
    {
      id: 1,
      name: 'Marketing',
      icon: '📢',
      members: [
        { id: 1, name: 'Marie Dupont', email: 'marie@tuesday.com', role: 'Admin', avatar: 'M' },
        { id: 2, name: 'Jean Martin', email: 'jean@tuesday.com', role: 'Membre', avatar: 'J' }
      ],
      boards: [
        {
          id: 1,
          name: 'Campagne Q1 2026',
          description: 'Campagne marketing pour le premier trimestre',
          favorited: true,
          groups: [
            {
              id: 1,
              name: 'Phase de Planification',
              color: '#579bfc',
              collapsed: false,
              items: [
                { 
                  id: 1, 
                  name: 'Analyse de marché', 
                  person: ['Marie Dupont'], 
                  status: 'Terminé', 
                  priority: 'Haute', 
                  date: '2026-01-15',
                  endDate: '2026-01-20',
                  progress: 100,
                  budget: 5000,
                  spent: 4800,
                  tags: ['Recherche', 'Urgent'],
                  dependencies: [],
                  files: 2,
                  comments: 5,
                  subitems: []
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  // --- ÉTATS ---
  const [workspaces, setWorkspaces] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Ref pour éviter la boucle infinie lors du premier chargement
  const isFirstLoad = useRef(true);

  // --- CHARGEMENT INITIAL DEPUIS LE CLOUD ---
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const cloudData = await loadFromCloud();
      if (cloudData) {
        setWorkspaces(cloudData);
      }
      setIsLoading(false);
      isFirstLoad.current = false;
    };
    initData();
  }, []);

  // --- SAUVEGARDE AUTOMATIQUE VERS LE CLOUD ---
  useEffect(() => {
    // Ne pas sauvegarder pendant le chargement initial
    if (isFirstLoad.current || isLoading) return;

    const saveData = async () => {
      setIsSaving(true);
      await saveToCloud(workspaces);
      setIsSaving(false);
      setLastSaved(new Date());
    };

    // Debounce: On attend 1 seconde après la dernière modif pour sauvegarder
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [workspaces]);


  // --- LE RESTE DU CODE (LOGIQUE MÉTIER) ---
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(1);
  const [activeBoardId, setActiveBoardId] = useState(1);
  const [view, setView] = useState('table');
  
  // Modal States
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddItem, setShowAddItem] = useState(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  
  // Form States
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceIcon, setNewWorkspaceIcon] = useState('📁');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Membre');
  const [newItemName, setNewItemName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const statusOptions = ['À faire', 'En cours', 'Terminé', 'Bloqué', 'En attente'];
  const priorityOptions = ['Basse', 'Moyenne', 'Haute', 'Critique'];
  const statusColors = {
    'À faire': '#c4c4c4',
    'En cours': '#fdab3d',
    'Terminé': '#00c875',
    'Bloqué': '#e44258',
    'En attente': '#9cd326'
  };
  const priorityColors = {
    'Basse': '#579bfc',
    'Moyenne': '#fdab3d',
    'Haute': '#e44258',
    'Critique': '#401694'
  };

  const icons = ['📁', '📢', '💻', '🎯', '🚀', '💡', '📊', '🎨', '📱', '⚡'];

  // Helper safely getting data
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || defaultData[0];
  const activeBoard = activeWorkspace?.boards.find(b => b.id === activeBoardId) || (activeWorkspace?.boards.length > 0 ? activeWorkspace.boards[0] : null);

  // Sync logic
  useEffect(() => {
    if (!activeWorkspace && workspaces.length > 0) setActiveWorkspaceId(workspaces[0].id);
    if (activeWorkspace && !activeBoard && activeWorkspace.boards.length > 0) setActiveBoardId(activeWorkspace.boards[0].id);
  }, [workspaces]);


  // --- FUNCTIONS (CRUD) ---
  const addWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    const newWorkspace = {
      id: Date.now(),
      name: newWorkspaceName,
      icon: newWorkspaceIcon,
      members: [{ id: Date.now(), name: 'Vous', email: 'vous@tuesday.com', role: 'Admin', avatar: 'V' }],
      boards: []
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
    setShowWorkspaceModal(false);
    setActiveWorkspaceId(newWorkspace.id);
  };

  const deleteWorkspace = (workspaceId) => {
    if (window.confirm('Supprimer cet espace ?')) {
      const filtered = workspaces.filter(w => w.id !== workspaceId);
      setWorkspaces(filtered);
      if (activeWorkspaceId === workspaceId && filtered.length > 0) setActiveWorkspaceId(filtered[0].id);
    }
  };

  const addBoard = () => {
    if (!newBoardName.trim()) return;
    const newBoard = {
      id: Date.now(),
      name: newBoardName,
      description: newBoardDesc,
      favorited: false,
      groups: [{ id: Date.now(), name: 'Groupe 1', color: '#579bfc', collapsed: false, items: [] }]
    };
    const newWorkspaces = workspaces.map(w => w.id === activeWorkspaceId ? { ...w, boards: [...w.boards, newBoard] } : w);
    setWorkspaces(newWorkspaces);
    setActiveBoardId(newBoard.id);
    setNewBoardName(''); setNewBoardDesc(''); setShowBoardModal(false);
  };

  const deleteBoard = (boardId) => {
    if (window.confirm('Supprimer ce tableau ?')) {
      const newWorkspaces = workspaces.map(w => w.id === activeWorkspaceId ? { ...w, boards: w.boards.filter(b => b.id !== boardId) } : w);
      setWorkspaces(newWorkspaces);
    }
  };

  const toggleBoardFavorite = (boardId) => {
    setWorkspaces(workspaces.map(w => ({
        ...w, boards: w.boards.map(b => b.id === boardId ? { ...b, favorited: !b.favorited } : b)
    })));
  };

  const addMember = () => {
    if (!newMemberEmail.trim()) return;
    const newMember = {
      id: Date.now(),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      avatar: newMemberEmail[0].toUpperCase()
    };
    setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? { ...w, members: [...w.members, newMember] } : w));
    setNewMemberEmail(''); setShowMemberModal(false);
  };

  const removeMember = (memberId) => {
    if (window.confirm('Retirer ce membre ?')) {
        setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? { ...w, members: w.members.filter(m => m.id !== memberId) } : w));
    }
  };

  const addGroup = () => {
    if (!newGroupName.trim() || !activeBoard) return;
    const colors = ['#579bfc', '#00c875', '#fdab3d', '#e44258', '#401694', '#9cd326'];
    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      color: colors[Math.floor(Math.random() * colors.length)],
      collapsed: false,
      items: []
    };
    setWorkspaces(workspaces.map(w => w.id !== activeWorkspaceId ? w : {
        ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : { ...b, groups: [...b.groups, newGroup] })
    }));
    setNewGroupName(''); setShowAddGroup(false);
  };

  const deleteGroup = (groupId) => {
    if (!activeBoard) return;
    if (window.confirm('Supprimer ce groupe ?')) {
        setWorkspaces(workspaces.map(w => w.id !== activeWorkspaceId ? w : {
            ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : { ...b, groups: b.groups.filter(g => g.id !== groupId) })
        }));
    }
  };

  const toggleGroupCollapse = (groupId) => {
    if (!activeBoard) return;
    setWorkspaces(workspaces.map(w => w.id !== activeWorkspaceId ? w : {
        ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : { 
            ...b, groups: b.groups.map(g => g.id === groupId ? { ...g, collapsed: !g.collapsed } : g) 
        })
    }));
  };

  const addItem = (groupId) => {
    if (!newItemName.trim() || !activeBoard) return;
    const newItem = {
      id: Date.now(),
      name: newItemName,
      person: [],
      status: 'À faire',
      priority: 'Moyenne',
      date: new Date().toISOString().split('T')[0],
      endDate: '',
      progress: 0,
      budget: 0,
      spent: 0,
      tags: [],
      dependencies: [],
      files: 0,
      comments: 0,
      subitems: []
    };
    setWorkspaces(workspaces.map(w => w.id !== activeWorkspaceId ? w : {
        ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : { 
            ...b, groups: b.groups.map(g => g.id !== groupId ? g : { ...g, items: [...g.items, newItem] })
        })
    }));
    setNewItemName(''); setShowAddItem(null);
  };

  const deleteItem = (groupId, itemId) => {
    if (!activeBoard) return;
    setWorkspaces(workspaces.map(w => w.id !== activeWorkspaceId ? w : {
        ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : { 
            ...b, groups: b.groups.map(g => g.id !== groupId ? g : { ...g, items: g.items.filter(i => i.id !== itemId) })
        })
    }));
  };

  const updateCell = (groupId, itemId, field, value) => {
    if (!activeBoard) return;
    setWorkspaces(workspaces.map(w => w.id !== activeWorkspaceId ? w : {
        ...w, boards: w.boards.map(b => b.id !== activeBoardId ? b : { 
            ...b, groups: b.groups.map(g => g.id !== groupId ? g : { 
                ...g, items: g.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) 
            })
        })
    }));
  };

  // --- GANTT LOGIC ---
  const getGanttDates = () => {
    if (!activeBoard) return [];
    const allItems = activeBoard.groups.flatMap(g => g.items);
    const dates = allItems.flatMap(item => [item.date, item.endDate]).filter(Boolean);
    if (dates.length === 0) return [];
    const minDate = new Date(Math.min(...dates.map(d => new Date(d))));
    const maxDate = new Date(Math.max(...dates.map(d => new Date(d))));
    const weeks = [];
    let currentDate = new Date(minDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    let loops = 0;
    while (currentDate <= maxDate && loops < 100) {
      weeks.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
      loops++;
    }
    return weeks;
  };

  const getItemPosition = (item, weekStart) => {
    if (!item.date) return null;
    const itemStart = new Date(item.date);
    const itemEnd = item.endDate ? new Date(item.endDate) : new Date(item.date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    if (itemEnd < weekStart || itemStart >= weekEnd) return null;
    const visibleStart = itemStart < weekStart ? weekStart : itemStart;
    const visibleEnd = itemEnd > weekEnd ? weekEnd : itemEnd;
    const totalDays = 7;
    const diffTime = Math.abs(visibleEnd - visibleStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
    const startOffsetTime = visibleStart - weekStart;
    const startOffsetDays = Math.floor(startOffsetTime / (1000 * 60 * 60 * 24));
    const startOffset = (startOffsetDays / totalDays) * 100;
    const width = (diffDays / totalDays) * 100;
    return { left: Math.max(0, startOffset), width: Math.min(100, width) };
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <div className="text-slate-600 font-medium">Chargement de votre Work OS...</div>
    </div>
  );

  const ganttWeeks = getGanttDates();
  const allItems = activeBoard ? activeBoard.groups.flatMap(g => g.items) : [];
  const completedItems = allItems.filter(i => i.status === 'Terminé').length;
  const totalBudget = allItems.reduce((sum, i) => sum + (i.budget || 0), 0);
  const totalSpent = allItems.reduce((sum, i) => sum + (i.spent || 0), 0);

  return (
    <div className="h-screen flex bg-gray-50 text-slate-900 font-sans">
      {/* STATUS BAR (SYNC) */}
      <div className="fixed bottom-4 right-4 z-[100]">
          {isSaving ? (
              <div className="bg-white px-3 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 text-xs font-medium text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin"/> Sauvegarde...
              </div>
          ) : lastSaved ? (
              <div className="bg-white px-3 py-2 rounded-full shadow-lg border border-green-100 flex items-center gap-2 text-xs font-medium text-green-600 opacity-80 hover:opacity-100 transition-opacity">
                  <Cloud className="w-3 h-3"/> Cloud Sync OK
              </div>
          ) : null}
      </div>

      {/* Left Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 z-50 shadow-lg`}>
        <div className="p-4 border-b border-gray-200">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-600">tuesday</span>
                </div>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              <button onClick={() => setShowWorkspaceModal(true)} className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md">
                <Plus className="w-4 h-4" /> Nouvel espace
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md"><CheckSquare className="w-5 h-5 text-white" /></div>
                <button onClick={() => setSidebarCollapsed(false)} className="p-2 hover:bg-gray-100 rounded w-full flex justify-center"><Menu className="w-5 h-5" /></button>
                <button onClick={() => setShowWorkspaceModal(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Plus className="w-5 h-5"/></button>
            </div>
          )}
        </div>
        
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            <div className="mb-4">
              <div className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Espaces de travail</div>
              <div className="space-y-1">
                {workspaces.map(workspace => (
                  <div key={workspace.id} className="relative">
                    <button
                      onClick={() => { setActiveWorkspaceId(workspace.id); setActiveBoardId(workspace.boards[0]?.id || null); }}
                      className={`w-full px-3 py-2.5 text-left text-sm rounded-lg flex items-center justify-between group transition-colors ${activeWorkspaceId === workspace.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{workspace.icon}</span>
                        <span className="truncate">{workspace.name}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteWorkspace(workspace.id); }} className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded p-1 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </button>
                    {activeWorkspaceId === workspace.id && (
                      <div className="ml-4 mt-1 pl-4 border-l-2 border-gray-100 space-y-0.5">
                        {workspace.boards.map(board => (
                          <button
                            key={board.id}
                            onClick={() => setActiveBoardId(board.id)}
                            className={`w-full px-3 py-2 text-left text-sm rounded-md flex items-center justify-between group transition-colors ${activeBoardId === board.id ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${activeBoardId === board.id ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className="truncate">{board.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }} className="hover:bg-gray-200 rounded p-1 cursor-pointer text-gray-500 hover:text-red-500"><Trash2 className="w-3 h-3" /></span>
                            </div>
                          </button>
                        ))}
                         <button onClick={() => setShowBoardModal(true)} className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 rounded-md hover:bg-blue-50 transition-colors mt-1"><Plus className="w-3 h-3"/> Nouveau tableau</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {activeBoard ? (
          <>
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between px-8 py-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-slate-800">{activeBoard.name}</h1>
                  <button onClick={() => toggleBoardFavorite(activeBoardId)} className="p-1.5 hover:bg-yellow-50 rounded-full transition-colors">
                    <Star className={`w-5 h-5 ${activeBoard.favorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-gray-50">
                      <Users className="w-4 h-4"/> Membres
                  </button>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-full text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* View Tabs */}
              <div className="px-8 flex items-end gap-1 overflow-x-auto no-scrollbar">
                {[{id: 'table', icon: List, label: 'Tableau Principal'}, {id: 'kanban', icon: Grid3x3, label: 'Kanban'}, {id: 'gantt', icon: BarChart3, label: 'Gantt'}, {id: 'dashboard', icon: PieChart, label: 'Dashboard'}].map(tab => (
                    <button key={tab.id} onClick={() => setView(tab.id)} className={`px-4 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-all ${view === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
              </div>
            </div>

            {/* Main View Area */}
            <div className="flex-1 overflow-auto bg-slate-50">
              {view === 'table' && (
                <div className="p-8 space-y-8 pb-20">
                  {activeBoard.groups.map((group) => (
                    <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 cursor-pointer group hover:bg-gray-50 transition-colors" onClick={() => toggleGroupCollapse(group.id)}>
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded hover:bg-black/10 transition-colors ${group.collapsed ? '-rotate-90' : ''}`}><ChevronDown className="w-5 h-5" style={{ color: group.color }} /></div>
                          <h2 className="font-bold text-lg" style={{ color: group.color }}>{group.name}</h2>
                          <span className="text-xs text-gray-400 font-medium px-2 py-0.5 rounded-full border border-gray-100">{group.items.length} tâches</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); setShowAddItem(group.id) }} className="p-2 hover:bg-gray-200 rounded-md text-gray-500"><Plus className="w-4 h-4"/></button>
                             <button onClick={(e) => { e.stopPropagation(); deleteGroup(group.id) }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-md text-gray-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>

                      {!group.collapsed && (
                        <div className="overflow-x-auto">
                          <div className="flex border-b border-gray-100 bg-gray-50/50 min-w-max">
                            <div className="w-10 sticky left-0 bg-gray-50/50 z-10 border-r border-gray-100"></div>
                            <div className="w-6 sticky left-10 bg-gray-50/50 z-10" style={{backgroundColor: group.color}}></div>
                            <div className="w-80 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 sticky left-16 bg-gray-50/50 z-10">Tâche</div>
                            <div className="w-32 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 text-center">Responsable</div>
                            <div className="w-32 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 text-center">Statut</div>
                            <div className="w-32 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 text-center">Date</div>
                            <div className="w-32 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 text-center">Priorité</div>
                            <div className="w-24 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 text-center">Budget</div>
                            <div className="w-40 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 text-center">Tags</div>
                            <div className="flex-1"></div>
                          </div>

                          {group.items.map((item) => (
                            <div key={item.id} className="flex border-b border-gray-100 hover:bg-blue-50/30 group/row min-w-max transition-colors h-10 items-center">
                              <div className="w-10 flex items-center justify-center sticky left-0 bg-white group-hover/row:bg-blue-50/30 z-10 border-r border-gray-100 h-full"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer" /></div>
                              <div className="w-6 sticky left-10 h-full z-10 opacity-40" style={{backgroundColor: group.color}}></div>
                              <div className="w-80 px-2 sticky left-16 bg-white group-hover/row:bg-blue-50/30 z-10 border-r border-gray-100 h-full flex items-center">
                                <input type="text" value={item.name} onChange={(e) => updateCell(group.id, item.id, 'name', e.target.value)} className="w-full bg-transparent text-sm text-gray-800 font-medium focus:outline-none truncate hover:border-b hover:border-gray-300 focus:border-blue-500 transition-colors" />
                              </div>
                              <div className="w-32 px-1 border-r border-gray-100 h-full flex items-center justify-center">
                                <div className="relative w-full h-full group/cell">
                                    <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-sm">
                                        {item.person.length > 0 ? (<div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">{item.person[0].charAt(0)}</div>) : (<Users className="w-4 h-4 text-gray-300"/>)}
                                    </div>
                                    <select className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => updateCell(group.id, item.id, 'person', [e.target.value])}>
                                        <option value="">Assigner...</option>
                                        {activeWorkspace.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                </div>
                              </div>
                              <div className="w-32 px-1 border-r border-gray-100 h-full flex items-center justify-center">
                                <div className="w-full h-8 flex items-center justify-center text-xs font-bold text-white cursor-pointer relative" style={{ backgroundColor: statusColors[item.status] }}>
                                    <span className="truncate px-2">{item.status}</span>
                                    <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.status} onChange={(e) => updateCell(group.id, item.id, 'status', e.target.value)}>
                                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                              </div>
                              <div className="w-32 px-1 border-r border-gray-100 h-full flex items-center justify-center">
                                <input type="date" value={item.date} onChange={(e) => updateCell(group.id, item.id, 'date', e.target.value)} className="w-full h-full bg-transparent text-xs text-center text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50" />
                              </div>
                               <div className="w-32 px-1 border-r border-gray-100 h-full flex items-center justify-center">
                                <div className="w-full h-8 flex items-center justify-center text-xs font-bold text-white cursor-pointer relative" style={{ backgroundColor: priorityColors[item.priority] }}>
                                    <span className="truncate px-2">{item.priority}</span>
                                    <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.priority} onChange={(e) => updateCell(group.id, item.id, 'priority', e.target.value)}>
                                        {priorityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                              </div>
                              <div className="w-24 px-2 border-r border-gray-100 h-full flex items-center justify-center">
                                <input type="number" value={item.budget} onChange={(e) => updateCell(group.id, item.id, 'budget', Number(e.target.value))} className="w-full bg-transparent text-sm text-gray-600 text-right focus:outline-none" />
                                <span className="text-xs text-gray-400 ml-1">€</span>
                              </div>
                              <div className="w-40 px-2 border-r border-gray-100 h-full flex items-center overflow-hidden">
                                <div className="flex gap-1 overflow-hidden">
                                    {item.tags.map((tag, i) => (<span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded truncate">#{tag}</span>))}
                                    <button className="text-gray-400 hover:text-blue-500" onClick={() => { const newTag = prompt("Nouveau Tag:"); if(newTag) updateCell(group.id, item.id, 'tags', [...item.tags, newTag]); }}><Plus className="w-3 h-3"/></button>
                                </div>
                              </div>
                              <div className="flex-1 flex items-center px-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <button onClick={() => deleteItem(group.id, item.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </div>
                          ))}

                          <div className="flex h-10 border-b border-gray-100">
                             <div className="w-10 sticky left-0 bg-white border-r border-gray-100 z-10"></div>
                             <div className="w-6 sticky left-10 bg-white z-10 border-l-4" style={{borderColor: group.color}}></div>
                             <div className="w-80 px-2 sticky left-16 bg-white border-r border-gray-100 z-10 flex items-center">
                                <input type="text" placeholder="+ Ajouter une tâche" className="w-full text-sm text-gray-500 placeholder-gray-400 focus:outline-none hover:bg-gray-50 p-1 rounded" onKeyDown={(e) => { if (e.key === 'Enter') { setNewItemName(e.currentTarget.value); addItem(group.id); e.currentTarget.value = ""; } }} />
                             </div>
                             <div className="flex-1 bg-gray-50/30"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button onClick={() => setShowAddGroup(true)} className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"><Plus className="w-4 h-4"/> Ajouter un groupe</button>
                  {showAddGroup && (
                      <div className="p-4 bg-white border rounded-lg shadow-sm max-w-md">
                          <input autoFocus placeholder="Nom du nouveau groupe" className="w-full p-2 border rounded mb-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup()} />
                          <div className="flex gap-2 justify-end">
                              <button onClick={() => setShowAddGroup(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded">Annuler</button>
                              <button onClick={addGroup} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Créer</button>
                          </div>
                      </div>
                  )}
                </div>
              )}

              {/* KANBAN VIEW */}
              {view === 'kanban' && (
                <div className="p-6 h-full overflow-x-auto whitespace-nowrap pb-20">
                  {statusOptions.map(status => (
                      <div key={status} className="inline-block w-80 mr-4 align-top h-full">
                          <div className="bg-gray-100 rounded-xl p-3 flex flex-col max-h-full">
                              <div className="font-bold text-gray-700 mb-3 px-2 flex justify-between items-center" style={{borderLeft: `4px solid ${statusColors[status]}`}}>
                                  <span className="pl-2">{status}</span>
                                  <span className="bg-white px-2 py-0.5 rounded-full text-xs text-gray-400">{activeBoard.groups.reduce((acc, g) => acc + g.items.filter(i => i.status === status).length, 0)}</span>
                              </div>
                              <div className="overflow-y-auto pr-1 space-y-2">
                                  {activeBoard.groups.map(g => g.items.filter(i => i.status === status).map(item => (
                                      <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer whitespace-normal">
                                          <div className="text-sm font-medium text-gray-800 mb-2">{item.name}</div>
                                          <div className="flex justify-between items-center">
                                              <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{g.name}</div>
                                              {item.person.length > 0 && <div className="w-6 h-6 bg-blue-100 rounded-full text-[10px] flex items-center justify-center text-blue-700 font-bold">{item.person[0].charAt(0)}</div>}
                                          </div>
                                      </div>
                                  )))}
                              </div>
                          </div>
                      </div>
                  ))}
                </div>
              )}
              
              {/* DASHBOARD VIEW */}
              {view === 'dashboard' && (
                  <div className="p-8 pb-20">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                              <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">Budget Total</h3>
                              <p className="text-3xl font-bold text-slate-800">{totalBudget} €</p>
                          </div>
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                              <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">Dépensé</h3>
                              <p className="text-3xl font-bold text-slate-800">{totalSpent} €</p>
                              <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${(totalSpent/totalBudget)*100}%`}}></div></div>
                          </div>
                           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                              <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">Tâches</h3>
                              <p className="text-3xl font-bold text-slate-800">{allItems.length}</p>
                          </div>
                           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                              <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">Progression</h3>
                              <p className="text-3xl font-bold text-slate-800">{Math.round((completedItems / allItems.length) * 100) || 0}%</p>
                          </div>
                      </div>
                  </div>
              )}
              
               {/* GANTT VIEW */}
               {view === 'gantt' && (
                <div className="p-6 h-full overflow-auto">
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-w-[1000px]">
                      <div className="flex bg-gray-50 border-b border-gray-200">
                         <div className="w-64 p-3 border-r border-gray-200 font-bold text-sm text-gray-600">Tâche</div>
                         <div className="flex-1 flex">
                             {ganttWeeks.map((week, i) => (
                                 <div key={i} className="flex-1 border-r border-gray-200 text-xs text-center p-2 text-gray-500 min-w-[100px]">{week.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}</div>
                             ))}
                         </div>
                      </div>
                      {activeBoard.groups.map(g => (
                          <React.Fragment key={g.id}>
                              <div className="bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">{g.name}</div>
                              {g.items.map(item => (
                                  <div key={item.id} className="flex border-b border-gray-100 hover:bg-gray-50 h-10 items-center">
                                      <div className="w-64 px-3 text-sm truncate border-r border-gray-200">{item.name}</div>
                                      <div className="flex-1 relative h-full">
                                           {ganttWeeks.map((week, i) => (<div key={i} className="absolute top-0 bottom-0 border-r border-gray-100" style={{left: `${(i / ganttWeeks.length) * 100}%`, width: `${100/ganttWeeks.length}%`}}></div>))}
                                           {(() => {
                                               const pos = getItemPosition(item, ganttWeeks[0]);
                                               if (pos) return (<div className="absolute top-2 h-6 rounded-full text-xs text-white flex items-center px-2 truncate shadow-sm z-10" style={{left: `${pos.left}%`, width: `${pos.width}%`, backgroundColor: statusColors[item.status]}}>{item.name}</div>)
                                           })()}
                                      </div>
                                  </div>
                              ))}
                          </React.Fragment>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6"><Folder className="w-10 h-10 text-blue-500" /></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Aucun tableau sélectionné</h2>
            <button onClick={() => setShowBoardModal(true)} className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"><Plus className="w-5 h-5" /> Créer un tableau</button>
          </div>
        )}
      </div>

      {/* Workspace Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowWorkspaceModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold text-slate-800">Nouvel espace</h3><button onClick={() => setShowWorkspaceModal(false)}><X className="w-5 h-5 text-gray-500" /></button></div>
            <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addWorkspace()} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4" placeholder="Nom de l'espace" autoFocus />
            <button onClick={addWorkspace} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg">Créer</button>
          </div>
        </div>
      )}

      {/* Board Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowBoardModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold text-slate-800">Nouveau tableau</h3><button onClick={() => setShowBoardModal(false)}><X className="w-5 h-5 text-gray-500" /></button></div>
            <input type="text" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addBoard()} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4" placeholder="Nom du tableau" autoFocus />
            <button onClick={addBoard} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg">Créer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuesdayCom;