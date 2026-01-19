// components/board/BoardContext.tsx
'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveToCloud } from '@/app/actions';
import { Board, Group, Item } from '@/app/types';

// --- ACTIONS DEFINITION ---
type Action = 
  | { type: 'INIT_BOARD'; payload: Board }
  | { type: 'UPDATE_CELL'; payload: { groupId: string, itemId: string, colId: string, value: any } }
  | { type: 'ADD_ITEM'; payload: { groupId: string, name: string } }
  | { type: 'ADD_GROUP'; payload: { name: string } }
  | { type: 'DELETE_ITEM'; payload: { groupId: string, itemId: string } };

// --- REDUCER (Logic) ---
const boardReducer = (state: Board, action: Action): Board => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  switch (action.type) {
    case 'INIT_BOARD':
      return action.payload;

    case 'UPDATE_CELL':
      // Deep immutability update
      return {
        ...state,
        groups: state.groups.map(g => g.id !== action.payload.groupId ? g : {
          ...g,
          items: g.items.map(i => i.id !== action.payload.itemId ? i : {
            ...i,
            values: { ...i.values, [action.payload.colId]: action.payload.value }
          })
        })
      };

    case 'ADD_ITEM':
      const newItem: Item = { id: generateId(), name: action.payload.name, values: {} };
      return {
        ...state,
        groups: state.groups.map(g => g.id !== action.payload.groupId ? g : {
          ...g, items: [...g.items, newItem]
        })
      };

    case 'ADD_GROUP':
      const newGroup: Group = { id: generateId(), name: action.payload.name, color: '#579bfc', collapsed: false, items: [] };
      return { ...state, groups: [...state.groups, newGroup] };

    case 'DELETE_ITEM':
        return {
            ...state,
            groups: state.groups.map(g => g.id !== action.payload.groupId ? g : {
                ...g, items: g.items.filter(i => i.id !== action.payload.itemId)
            })
        };

    default:
      return state;
  }
};

// --- CONTEXT ---
const BoardContext = createContext<{
  board: Board | null;
  dispatch: React.Dispatch<Action>;
  updateCell: (groupId: string, itemId: string, colId: string, value: any) => void;
}>({ board: null, dispatch: () => {}, updateCell: () => {} });

export const BoardProvider = ({ children, initialData }: { children: React.ReactNode, initialData: Board }) => {
  const [board, dispatch] = useReducer(boardReducer, initialData);

  // Auto-save effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
        // En prod, on ne sauvegarde que si ça a changé
        saveToCloud([board]); // Adapte selon la structure de ton action
    }, 2000);
    return () => clearTimeout(timer);
  }, [board]);

  const updateCell = (groupId: string, itemId: string, colId: string, value: any) => {
    dispatch({ type: 'UPDATE_CELL', payload: { groupId, itemId, colId, value } });
  };

  return (
    <BoardContext.Provider value={{ board, dispatch, updateCell }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => useContext(BoardContext);