'use client'
import React, { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, Calendar, BarChart3, Users, CheckSquare, Grid3x3, List, Trash2, Filter, Share2, Star, Bell, Settings, Download, Upload, Clock, Tag, Paperclip, MessageSquare, Activity, Link2, Copy, Eye, EyeOff, TrendingUp, PieChart, Zap, Home, Inbox, Play, X, Edit2, UserPlus, Folder, FileText, Archive, Menu, LogOut, CreditCard, Building2, Mail } from 'lucide-react';

const TuesdayCom = () => {
  // Workspaces and Boards State
  const [workspaces, setWorkspaces] = useState([
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
    },
    {
      id: 2,
      name: 'Développement',
      icon: '💻',
      members: [
        { id: 3, name: 'Sophie Bernard', email: 'sophie@tuesday.com', role: 'Admin', avatar: 'S' }
      ],
      boards: []
    }
  ]);

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
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [ganttZoom, setGanttZoom] = useState('weeks');
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

  // Get Active Workspace and Board
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activeBoard = activeWorkspace?.boards.find(b => b.id === activeBoardId);

  // Workspace Management
  const addWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    
    const newWorkspace = {
      id: Date.now(),
      name: newWorkspaceName,
      icon: newWorkspaceIcon,
      members: [
        { id: Date.now(), name: 'Vous', email: 'vous@tuesday.com', role: 'Admin', avatar: 'V' }
      ],
      boards: []
    };
    
    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
    setShowWorkspaceModal(false);
  };

  const deleteWorkspace = (workspaceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet espace de travail ?')) {
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
      if (activeWorkspaceId === workspaceId) {
        setActiveWorkspaceId(workspaces[0]?.id || null);
      }
    }
  };

  // Board Management
  const addBoard = () => {
    if (!newBoardName.trim()) return;
    
    const newBoard = {
      id: Date.now(),
      name: newBoardName,
      description: newBoardDesc,
      favorited: false,
      groups: [
        {
          id: Date.now(),
          name: 'Groupe 1',
          color: '#579bfc',
          collapsed: false,
          items: []
        }
      ]
    };
    
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    workspace.boards.push(newBoard);
    setWorkspaces(newWorkspaces);
    setActiveBoardId(newBoard.id);
    setNewBoardName('');
    setNewBoardDesc('');
    setShowBoardModal(false);
  };

  const deleteBoard = (boardId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tableau ?')) {
      const newWorkspaces = [...workspaces];
      const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
      workspace.boards = workspace.boards.filter(b => b.id !== boardId);
      setWorkspaces(newWorkspaces);
      if (activeBoardId === boardId) {
        setActiveBoardId(workspace.boards[0]?.id || null);
      }
    }
  };

  const toggleBoardFavorite = (boardId) => {
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const board = workspace.boards.find(b => b.id === boardId);
    board.favorited = !board.favorited;
    setWorkspaces(newWorkspaces);
  };

  // Member Management
  const addMember = () => {
    if (!newMemberEmail.trim()) return;
    
    const newMember = {
      id: Date.now(),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      avatar: newMemberEmail[0].toUpperCase()
    };
    
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    workspace.members.push(newMember);
    setWorkspaces(newWorkspaces);
    setNewMemberEmail('');
    setShowMemberModal(false);
  };

  const removeMember = (memberId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      const newWorkspaces = [...workspaces];
      const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
      workspace.members = workspace.members.filter(m => m.id !== memberId);
      setWorkspaces(newWorkspaces);
    }
  };

  const updateMemberRole = (memberId, newRole) => {
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const member = workspace.members.find(m => m.id === memberId);
    member.role = newRole;
    setWorkspaces(newWorkspaces);
  };

  // Group Management
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
    
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const board = workspace.boards.find(b => b.id === activeBoardId);
    board.groups.push(newGroup);
    setWorkspaces(newWorkspaces);
    setNewGroupName('');
    setShowAddGroup(false);
  };

  const deleteGroup = (groupId) => {
    if (!activeBoard) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      const newWorkspaces = [...workspaces];
      const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
      const board = workspace.boards.find(b => b.id === activeBoardId);
      board.groups = board.groups.filter(g => g.id !== groupId);
      setWorkspaces(newWorkspaces);
    }
  };

  const toggleGroupCollapse = (groupId) => {
    if (!activeBoard) return;
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const board = workspace.boards.find(b => b.id === activeBoardId);
    const group = board.groups.find(g => g.id === groupId);
    group.collapsed = !group.collapsed;
    setWorkspaces(newWorkspaces);
  };

  // Item Management
  const addItem = (groupId) => {
    if (!newItemName.trim() || !activeBoard) return;
    
    const newItem = {
      id: Date.now(),
      name: newItemName,
      person: [],
      status: 'À faire',
      priority: 'Moyenne',
      date: '',
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
    
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const board = workspace.boards.find(b => b.id === activeBoardId);
    const group = board.groups.find(g => g.id === groupId);
    group.items.push(newItem);
    setWorkspaces(newWorkspaces);
    setNewItemName('');
    setShowAddItem(null);
  };

  const deleteItem = (groupId, itemId) => {
    if (!activeBoard) return;
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const board = workspace.boards.find(b => b.id === activeBoardId);
    const group = board.groups.find(g => g.id === groupId);
    group.items = group.items.filter(i => i.id !== itemId);
    setWorkspaces(newWorkspaces);
  };

  const updateCell = (groupId, itemId, field, value) => {
    if (!activeBoard) return;
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const board = workspace.boards.find(b => b.id === activeBoardId);
    const group = board.groups.find(g => g.id === groupId);
    const item = group.items.find(i => i.id === itemId);
    item[field] = value;
    setWorkspaces(newWorkspaces);
  };

  const duplicateItem = (groupId, itemId) => {
    if (!activeBoard) return;
    const newWorkspaces = [...workspaces];
    const workspace = newWorkspaces.find(w => w.id === activeWorkspaceId);
    const board = workspace.boards.find(b => b.id === activeBoardId);
    const group = board.groups.find(g => g.id === groupId);
    const item = group.items.find(i => i.id === itemId);
    const duplicatedItem = { ...item, id: Date.now(), name: `${item.name} (copie)` };
    group.items.push(duplicatedItem);
    setWorkspaces(newWorkspaces);
  };

  // Gantt helpers
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
    
    while (currentDate <= maxDate) {
      weeks.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return weeks;
  };

  const getItemPosition = (item, weekStart) => {
    if (!item.date || !item.endDate) return null;
    
    const itemStart = new Date(item.date);
    const itemEnd = new Date(item.endDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    if (itemEnd < weekStart || itemStart >= weekEnd) return null;
    
    const visibleStart = itemStart < weekStart ? weekStart : itemStart;
    const visibleEnd = itemEnd > weekEnd ? weekEnd : itemEnd;
    
    const totalDays = 7;
    const startOffset = ((visibleStart - weekStart) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    const width = ((visibleEnd - visibleStart) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    
    return { left: startOffset, width };
  };

  const ganttWeeks = getGanttDates();
  const allItems = activeBoard ? activeBoard.groups.flatMap(g => g.items) : [];
  const completedItems = allItems.filter(i => i.status === 'Terminé').length;
  const totalBudget = allItems.reduce((sum, i) => sum + i.budget, 0);
  const totalSpent = allItems.reduce((sum, i) => sum + i.spent, 0);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 border-b border-gray-200">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">tuesday</span>
                </div>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-gray-100 rounded">
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => setShowWorkspaceModal(true)}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvel espace
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarCollapsed(false)} className="p-2 hover:bg-gray-100 rounded w-full">
              <Menu className="w-5 h-5 mx-auto" />
            </button>
          )}
        </div>
        
        {!sidebarCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1 mb-4">
                <button className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Accueil
                </button>
                <button className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  Ma boîte
                </button>
              </div>
              
              {/* Workspaces */}
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center justify-between">
                  <span>Espaces de travail</span>
                  <button onClick={() => setShowWorkspaceModal(true)} className="hover:bg-gray-200 rounded p-1">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {workspaces.map(workspace => (
                    <div key={workspace.id}>
                      <button
                        onClick={() => {
                          setActiveWorkspaceId(workspace.id);
                          setActiveBoardId(workspace.boards[0]?.id || null);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center justify-between group ${activeWorkspaceId === workspace.id ? 'bg-purple-50 text-purple-700 font-medium' : 'hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{workspace.icon}</span>
                          <span>{workspace.name}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteWorkspace(workspace.id); }}
                          className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </button>
                      
                      {/* Boards in Workspace */}
                      {activeWorkspaceId === workspace.id && workspace.boards.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {workspace.boards.map(board => (
                            <button
                              key={board.id}
                              onClick={() => setActiveBoardId(board.id)}
                              className={`w-full px-3 py-1.5 text-left text-sm rounded-lg flex items-center justify-between group ${activeBoardId === board.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{board.name}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleBoardFavorite(board.id); }}
                                  className="hover:bg-gray-200 rounded p-1"
                                >
                                  <Star className={`w-3 h-3 ${board.favorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }}
                                  className="hover:bg-gray-200 rounded p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 space-y-1">
              <button 
                onClick={() => setShowSettings(true)}
                className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
              <button className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-100 flex items-center gap-2 text-red-600">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeBoard ? (
          <>
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">{activeBoard.name}</h1>
                  <button 
                    onClick={() => toggleBoardFavorite(activeBoardId)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Star className={`w-5 h-5 ${activeBoard.favorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button 
                    onClick={() => setShowMemberModal(true)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Inviter
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Partager
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Progression:</span>
                    <span className="font-semibold">{completedItems}/{allItems.length} tâches</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${allItems.length > 0 ? (completedItems / allItems.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-semibold">{totalSpent.toLocaleString()}€ / {totalBudget.toLocaleString()}€</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Membres:</span>
                    <div className="flex -space-x-2">
                      {activeWorkspace.members.slice(0, 5).map(member => (
                        <div 
                          key={member.id}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                          title={member.name}
                        >
                          {member.avatar}
                        </div>
                      ))}
                      {activeWorkspace.members.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold border-2 border-white">
                          +{activeWorkspace.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Tabs */}
              <div className="px-6 py-2 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setView('table')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${view === 'table' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                    Tableau
                  </button>
                  <button
                    onClick={() => setView('kanban')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${view === 'kanban' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    Kanban
                  </button>
                  <button
                    onClick={() => setView('gantt')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${view === 'gantt' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Gantt
                  </button>
                  <button
                    onClick={() => setView('calendar')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${view === 'calendar' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendrier
                  </button>
                  <button
                    onClick={() => setView('dashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${view === 'dashboard' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <PieChart className="w-4 h-4" />
                    Dashboard
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filtrer
                    </button>
                    <button 
                      onClick={() => setShowBoardModal(true)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau tableau
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main View Area */}
            <div className="flex-1 overflow-auto">
              {view === 'table' && (
                <div className="p-6 space-y-4">
                  {activeBoard.groups.map((group) => (
                    <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Group Header */}
                      <div 
                        className="flex items-center justify-between px-4 py-3 cursor-pointer"
                        style={{ backgroundColor: group.color }}
                        onClick={() => toggleGroupCollapse(group.id)}
                      >
                        <div className="flex items-center gap-3">
                          {group.collapsed ? (
                            <ChevronRight className="w-4 h-4 text-white" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white" />
                          )}
                          <span className="font-semibold text-white">{group.name}</span>
                          <span className="text-xs text-white opacity-80">{group.items.length} élément(s)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowAddItem(group.id); }}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>

                      {!group.collapsed && (
                        <>
                          {/* Table Header */}
                          <div className="grid grid-cols-24 gap-2 px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600">
                            <div className="col-span-1"></div>
                            <div className="col-span-4">Tâche</div>
                            <div className="col-span-3">Personnes</div>
                            <div className="col-span-2">Statut</div>
                            <div className="col-span-2">Priorité</div>
                            <div className="col-span-2">Date début</div>
                            <div className="col-span-2">Date fin</div>
                            <div className="col-span-2">Progrès</div>
                            <div className="col-span-2">Budget</div>
                            <div className="col-span-2">Tags</div>
                            <div className="col-span-2">Actions</div>
                          </div>

                          {/* Items */}
                          {group.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-24 gap-2 px-4 py-3 border-b hover:bg-gray-50 items-center">
                              <div className="col-span-1">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateCell(group.id, item.id, 'name', e.target.value)}
                                  className="w-full px-2 py-1 text-sm font-medium border-none focus:outline-none focus:ring-1 focus:ring-purple-500 rounded"
                                />
                              </div>
                              <div className="col-span-3">
                                <select
                                  multiple
                                  value={item.person}
                                  onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    updateCell(group.id, item.id, 'person', selected);
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  size="1"
                                >
                                  {activeWorkspace.members.map(member => (
                                    <option key={member.id} value={member.name}>{member.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <select
                                  value={item.status}
                                  onChange={(e) => updateCell(group.id, item.id, 'status', e.target.value)}
                                  className="w-full px-2 py-1 text-xs rounded font-medium text-white cursor-pointer"
                                  style={{ backgroundColor: statusColors[item.status] }}
                                >
                                  {statusOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <select
                                  value={item.priority}
                                  onChange={(e) => updateCell(group.id, item.id, 'priority', e.target.value)}
                                  className="w-full px-2 py-1 text-xs rounded font-medium text-white cursor-pointer"
                                  style={{ backgroundColor: priorityColors[item.priority] }}
                                >
                                  {priorityOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="date"
                                  value={item.date}
                                  onChange={(e) => updateCell(group.id, item.id, 'date', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="date"
                                  value={item.endDate}
                                  onChange={(e) => updateCell(group.id, item.id, 'endDate', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={item.progress}
                                  onChange={(e) => updateCell(group.id, item.id, 'progress', parseInt(e.target.value) || 0)}
                                  className="w-12 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                                <span className="text-xs ml-1">%</span>
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  value={item.budget}
                                  onChange={(e) => updateCell(group.id, item.id, 'budget', parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  placeholder="Budget"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  value={item.tags.join(', ')}
                                  onChange={(e) => updateCell(group.id, item.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  placeholder="Tags"
                                />
                              </div>
                              <div className="col-span-2">
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => duplicateItem(group.id, item.id)}
                                    className="p-1 hover:bg-gray-200 rounded" 
                                    title="Dupliquer"
                                  >
                                    <Copy className="w-4 h-4 text-gray-400" />
                                  </button>
                                  <button className="p-1 hover:bg-gray-200 rounded" title="Commentaires">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                  </button>
                                  <button 
                                    onClick={() => deleteItem(group.id, item.id)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4 text-gray-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add Item */}
                          {showAddItem === group.id ? (
                            <div className="px-4 py-3 border-b bg-gray-50">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addItem(group.id)}
                                  placeholder="Nom de la tâche"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => addItem(group.id)}
                                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                                >
                                  Ajouter
                                </button>
                                <button
                                  onClick={() => { setShowAddItem(null); setNewItemName(''); }}
                                  className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add Group */}
                  {showAddGroup ? (
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addGroup()}
                          placeholder="Nom du groupe"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          onClick={addGroup}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => { setShowAddGroup(false); setNewGroupName(''); }}
                          className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddGroup(true)}
                      className="w-full bg-white rounded-lg shadow-sm px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un groupe
                    </button>
                  )}
                </div>
              )}

              {view === 'kanban' && (
                <div className="p-6">
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex-shrink-0 w-80">
                        <div className="bg-white rounded-lg shadow-sm flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
                          <div className="px-4 py-3 border-b">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[status] }}></div>
                                <span className="font-semibold">{status}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {activeBoard.groups.reduce((acc, g) => acc + g.items.filter(i => i.status === status).length, 0)}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 space-y-3 overflow-y-auto flex-1">
                            {activeBoard.groups.map((group) =>
                              group.items
                                .filter((item) => item.status === status)
                                .map((item) => (
                                  <div key={item.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer">
                                    <div className="font-medium text-sm mb-3">{item.name}</div>
                                    
                                    {item.person.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {item.person.map((p, i) => (
                                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                            {p}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {item.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {item.tags.map((tag, i) => (
                                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs mb-2">
                                      <span className="px-2 py-1 rounded text-white font-medium" style={{ backgroundColor: priorityColors[item.priority] }}>
                                        {item.priority}
                                      </span>
                                      {item.date && (
                                        <div className="flex items-center gap-1 text-gray-500">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-green-500 transition-all"
                                          style={{ width: `${item.progress}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-600">{item.progress}%</span>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'gantt' && (
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold">Diagramme de Gantt</h3>
                    </div>
                    
                    {ganttWeeks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <div className="min-w-max">
                          {/* Gantt Header */}
                          <div className="flex border-b bg-gray-50">
                            <div className="w-64 px-4 py-3 font-semibold text-sm border-r">Tâches</div>
                            <div className="flex flex-1">
                              {ganttWeeks.map((week, idx) => (
                                <div key={idx} className="flex-1 px-2 py-3 text-xs text-center border-r min-w-32">
                                  {week.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Gantt Rows */}
                          {activeBoard.groups.map((group) => (
                            <div key={group.id}>
                              <div className="flex bg-gray-100 border-b">
                                <div className="w-64 px-4 py-2 font-semibold text-sm border-r" style={{ color: group.color }}>
                                  {group.name}
                                </div>
                                <div className="flex-1"></div>
                              </div>
                              {group.items.map((item) => (
                                <div key={item.id} className="flex border-b hover:bg-gray-50 relative">
                                  <div className="w-64 px-4 py-3 text-sm border-r">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {item.person.join(', ')}
                                    </div>
                                  </div>
                                  <div className="flex flex-1 relative" style={{ height: '60px' }}>
                                    {ganttWeeks.map((week, idx) => {
                                      const position = getItemPosition(item, week);
                                      return (
                                        <div key={idx} className="flex-1 border-r min-w-32 relative">
                                          {position && (
                                            <div
                                              className="absolute top-1/2 transform -translate-y-1/2 h-8 rounded flex items-center px-2 text-xs text-white font-medium shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                                              style={{
                                                backgroundColor: statusColors[item.status],
                                                left: `${position.left}%`,
                                                width: `${position.width}%`,
                                              }}
                                              title={`${item.name} (${item.progress}%)`}
                                            >
                                              <div className="truncate">{item.progress}%</div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        Aucune tâche avec dates pour afficher le Gantt
                      </div>
                    )}
                  </div>
                </div>
              )}

              {view === 'calendar' && (
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Janvier 2026</h3>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Précédent</button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Suivant</button>
                      </div>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date(2026, 0, i - 2);
                        const dateStr = date.toISOString().split('T')[0];
                        const itemsOnDate = activeBoard.groups.flatMap(g => g.items).filter(item => 
                          item.date === dateStr || item.endDate === dateStr
                        );
                        
                        return (
                          <div key={i} className={`min-h-24 border rounded-lg p-2 ${date.getMonth() !== 0 ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}>
                            <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                            <div className="space-y-1">
                              {itemsOnDate.map(item => (
                                <div
                                  key={item.id}
                                  className="text-xs px-2 py-1 rounded text-white truncate cursor-pointer"
                                  style={{ backgroundColor: statusColors[item.status] }}
                                  title={item.name}
                                >
                                  {item.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {view === 'dashboard' && (
                <div className="p-6 space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">Tâches complétées</span>
                        <CheckSquare className="w-6 h-6" />
                      </div>
                      <div className="text-4xl font-bold">{completedItems}</div>
                      <div className="text-sm opacity-90 mt-1">sur {allItems.length} total</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">Budget total</span>
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="text-4xl font-bold">{totalBudget.toLocaleString()}€</div>
                      <div className="text-sm opacity-90 mt-1">{totalSpent.toLocaleString()}€ dépensés</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">En cours</span>
                        <Activity className="w-6 h-6" />
                      </div>
                      <div className="text-4xl font-bold">
                        {allItems.filter(i => i.status === 'En cours').length}
                      </div>
                      <div className="text-sm opacity-90 mt-1">tâches actives</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">Équipe</span>
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="text-4xl font-bold">{activeWorkspace.members.length}</div>
                      <div className="text-sm opacity-90 mt-1">membres actifs</div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="font-semibold mb-4">Statut des tâches</h3>
                      <div className="space-y-3">
                        {statusOptions.map(status => {
                          const count = allItems.filter(i => i.status === status).length;
                          const percentage = allItems.length > 0 ? (count / allItems.length) * 100 : 0;
                          return (
                            <div key={status}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{status}</span>
                                <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: statusColors[status]
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="font-semibold mb-4">Distribution des priorités</h3>
                      <div className="space-y-3">
                        {priorityOptions.map(priority => {
                          const count = allItems.filter(i => i.priority === priority).length;
                          const percentage = allItems.length > 0 ? (count / allItems.length) * 100 : 0;
                          return (
                            <div key={priority}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{priority}</span>
                                <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: priorityColors[priority]
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Team Performance */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Performance de l'équipe</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {activeWorkspace.members.map(member => {
                        const memberTasks = allItems.filter(i => i.person.includes(member.name));
                        const completed = memberTasks.filter(i => i.status === 'Terminé').length;
                        const completionRate = memberTasks.length > 0 ? (completed / memberTasks.length) * 100 : 0;
                        return (
                          <div key={member.id} className="border rounded-lg p-4">
                                                          <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {member.avatar}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.role}</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {completed}/{memberTasks.length} tâches
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Folder className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Aucun tableau sélectionné</h2>
                <p className="text-gray-500 mb-6">Créez un nouveau tableau pour commencer</p>
                <button
                  onClick={() => setShowBoardModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Créer un tableau
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Workspace Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowWorkspaceModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Nouvel espace de travail</h3>
              <button onClick={() => setShowWorkspaceModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'espace</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWorkspace()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Marketing, Développement..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
                <div className="grid grid-cols-5 gap-2">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewWorkspaceIcon(icon)}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${newWorkspaceIcon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={addWorkspace}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Créer
                </button>
                <button
                  onClick={() => { setShowWorkspaceModal(false); setNewWorkspaceName(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBoardModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Nouveau tableau</h3>
              <button onClick={() => setShowBoardModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du tableau</label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBoard()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Projet Q1 2026"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                <textarea
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Description du tableau..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={addBoard}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Créer
                </button>
                <button
                  onClick={() => { setShowBoardModal(false); setNewBoardName(''); setNewBoardDesc(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && activeWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMemberModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Gérer les membres - {activeWorkspace.name}</h3>
              <button onClick={() => setShowMemberModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Add Member Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Inviter un nouveau membre</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMember()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="email@exemple.com"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Membre">Membre</option>
                  <option value="Admin">Admin</option>
                  <option value="Invité">Invité</option>
                </select>
                <button
                  onClick={addMember}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Inviter
                </button>
              </div>
            </div>

            {/* Members List */}
            <div>
              <h4 className="font-medium mb-3">Membres de l'espace ({activeWorkspace.members.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeWorkspace.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Membre">Membre</option>
                        <option value="Admin">Admin</option>
                        <option value="Invité">Invité</option>
                      </select>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Retirer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Paramètres</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Compte
                </h4>
                <div className="space-y-3 pl-7">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Profil utilisateur</div>
                      <div className="text-sm text-gray-500">vous@tuesday.com</div>
                    </div>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h4>
                <div className="space-y-2 pl-7">
                  <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span>Notifications par email</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span>Notifications desktop</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span>Résumé quotidien</span>
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Abonnement
                </h4>
                <div className="space-y-3 pl-7">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                    <div className="font-semibold mb-1">Plan Pro</div>
                    <div className="text-sm opacity-90">29€/mois - Toutes les fonctionnalités</div>
                    <button className="mt-3 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-gray-100">
                      Gérer l'abonnement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuesdayCom;