// components/board/BoardContext.tsx
'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Board, Item, User, Entity } from '@/app/types';

// Actions
type Action = 
  | { type: 'INIT_WORKSPACE'; payload: Entity[] }
  | { type: 'UPDATE_CELL'; payload: { boardId: string, groupId: string, itemId: string, colId: string, value: any } }
  | { type: 'ADD_ITEM'; payload: { boardId: string, groupId: string, name: string } }
  | { type: 'ADD_GROUP'; payload: { boardId: string, name: string } }
  | { type: 'ADD_WORKSPACE'; payload: { name: string } }
  | { type: 'UPDATE_DATE_RANGE'; payload: { boardId: string, itemId: string, start: string, end: string } };

const boardReducer = (state: Entity[], action: Action): Entity[] => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  switch (action.type) {
    case 'INIT_WORKSPACE': 
        return action.payload;

    case 'UPDATE_CELL':
        return state.map(entity => {
            if (entity.id !== action.payload.boardId || entity.type !== 'board') return entity;
            const b = entity as Board;
            return {
                ...b,
                groups: b.groups.map(g => g.id !== action.payload.groupId ? g : {
                    ...g, items: g.items.map(i => i.id !== action.payload.itemId ? i : { ...i, values: { ...i.values, [action.payload.colId]: action.payload.value } })
                })
            };
        });

    case 'ADD_ITEM':
        return state.map(entity => {
            if (entity.id !== action.payload.boardId || entity.type !== 'board') return entity;
            const b = entity as Board;
            return {
                ...b,
                groups: b.groups.map(g => g.id !== action.payload.groupId ? g : { ...g, items: [...g.items, { id: generateId(), name: action.payload.name, values: {} }] })
            };
        });

    case 'ADD_GROUP':
        return state.map(entity => {
            if (entity.id !== action.payload.boardId || entity.type !== 'board') return entity;
            const b = entity as Board;
            return { ...b, groups: [...b.groups, { id: generateId(), name: action.payload.name, color: '#579bfc', collapsed: false, items: [] }] };
        });

    case 'ADD_WORKSPACE':
        const newBoard: Board = {
            id: generateId(), type: 'board', name: action.payload.name, favorited: false,
            views: [{id:'v1', type:'table', name:'Main Table'}], automations: [],
            columns: [ {id:'c1', title:'Task', type:'name', width:300}, {id:'c2', title:'Status', type:'status', width:140, settings:{labels:{'Done':'#00c875'}}} ],
            groups: [ {id: generateId(), name:'Group 1', color:'#579bfc', items:[], collapsed:false} ]
        };
        return [...state, newBoard];

    default: return state;
  }
};

const BoardContext = createContext<{
  workspaceData: Entity[];
  dispatch: React.Dispatch<Action>;
  currentView: string;
  setCurrentView: (v: string) => void;
  users: User[];
  inviteUser: (email: string) => void;
  updateCell: (boardId: string, groupId: string, itemId: string, colId: string, value: any) => void;
}>({ 
    workspaceData: [], 
    dispatch: () => {}, 
    currentView: 'table',
    setCurrentView: () => {},
    users: [],
    inviteUser: () => {},
    updateCell: () => {}
});

export const BoardProvider = ({ children, initialData }: { children: React.ReactNode, initialData: Entity[] }) => {
  const [workspaceData, dispatch] = useReducer(boardReducer, initialData);
  const [currentView, setCurrentView] = useState('table');
  const [users, setUsers] = useState<User[]>([{ id: 'u1', name: 'Moi', avatar: 'ME', role: 'Admin' }]);

  const inviteUser = (email: string) => {
      const newUser: User = { id: Math.random().toString(), name: email.split('@')[0], avatar: email.charAt(0).toUpperCase(), role: 'Member' };
      setUsers([...users, newUser]);
      alert(`Invitation envoyée à ${email} !`);
  };

  const updateCell = (boardId: string, groupId: string, itemId: string, colId: string, value: any) => {
      dispatch({ type: 'UPDATE_CELL', payload: { boardId, groupId, itemId, colId, value } });
  };

  return (
    <BoardContext.Provider value={{ workspaceData, dispatch, currentView, setCurrentView, users, inviteUser, updateCell }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => useContext(BoardContext);