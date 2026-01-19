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
            return { ...b, groups: [...b.groups, { id: generateId(), name: action.payload