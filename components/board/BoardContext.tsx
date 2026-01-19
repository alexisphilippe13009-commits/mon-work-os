// components/board/BoardContext.tsx
'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { saveToCloud } from '@/app/actions';
import { Board, Group, Item } from '@/app/types';

type Action = 
  | { type: 'INIT_BOARD'; payload: Board }
  | { type: 'UPDATE_CELL'; payload: { groupId: string, itemId: string, colId: string, value: any } }
  | { type: 'ADD_ITEM'; payload: { groupId: string, name: string } }
  | { type: 'ADD_GROUP'; payload: { name: string } }
  | { type: 'DELETE_ITEM'; payload: { groupId: string, itemId: string } };

const boardReducer = (state: Board, action: Action): Board => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  switch (action.type) {
    case 'INIT_BOARD': return action.payload;
    case 'UPDATE_CELL':
      return {
        ...state,
        groups: state.groups.map(g => g.id !== action.payload.groupId ? g : {
          ...g, items: g.items.map(i => i.id !== action.payload.itemId ? i : { ...i, values: { ...i.values, [action.payload.colId]: action.payload.value } })
        })
      };
    case 'ADD_ITEM':
      return {
        ...state,
        groups: state.groups.map(g => g.id !== action.payload.groupId ? g : { ...g, items: [...g.items, { id: generateId(), name: action.payload.name, values: {} }] })
      };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, { id: generateId(), name: action.payload.name, color: '#579bfc', collapsed: false, items: [] }] };
    case 'DELETE_ITEM':
        return { ...state, groups: state.groups.map(g => g.id !== action.payload.groupId ? g : { ...g, items: g.items.filter(i => i.id !== action.payload.itemId) }) };
    default: return state;
  }
};

const BoardContext = createContext<{
  board: Board | null;
  dispatch: React.Dispatch<Action>;
  updateCell: (g: string, i: string, c: string, v: any) => void;
  currentView: string;
  setCurrentView: (v: string) => void;
}>({ 
    board: null, 
    dispatch: () => {}, 
    updateCell: () => {},
    currentView: 'table',
    setCurrentView: () => {}
});

export const BoardProvider = ({ children, initialData }: { children: React.ReactNode, initialData: Board }) => {
  const [board, dispatch] = useReducer(boardReducer, initialData);
  const [currentView, setCurrentView] = useState('table'); // Default view

  useEffect(() => {
    const timer = setTimeout(() => {
        saveToCloud([board]); 
    }, 2000);
    return () => clearTimeout(timer);
  }, [board]);

  const updateCell = (groupId: string, itemId: string, colId: string, value: any) => {
    dispatch({ type: 'UPDATE_CELL', payload: { groupId, itemId, colId, value } });
  };

  return (
    <BoardContext.Provider value={{ board, dispatch, updateCell, currentView, setCurrentView }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => useContext(BoardContext);