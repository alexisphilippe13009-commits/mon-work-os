'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// On utilise une instance globale pour éviter les erreurs de connexion multiples
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- GESTION DU BOARD ---
export async function getBoardData() {
  const board = await prisma.board.findFirst({
    include: {
      groups: {
        include: { items: { orderBy: { updatedAt: 'desc' } } },
        orderBy: { title: 'asc' }
      }
    }
  });

  if (!board) {
    return await createInitialSetup();
  }
  return board;
}

// --- SETUP INITIAL (CORRIGÉ: Groupes vides pour éviter l'erreur TypeScript) ---
async function createInitialSetup() {
  return await prisma.board.create({
    data: {
      name: "Roadmap Produit Q1",
      columns: [
        { id: "person", title: "Responsable", type: "text", width: 150 },
        { id: "status", title: "Statut", type: "status", width: 140, settings: { 
            options: { 
              "Done": "#00c875", 
              "Working on it": "#fdab3d", 
              "Stuck": "#e2445c", 
              "": "#c4c4c4" 
            } 
        }},
        { id: "date", title: "Échéance", type: "date", width: 120 },
        { id: "priority", title: "Priorité", type: "status", width: 140, settings: {
            options: { "High": "#401694", "Medium": "#5559df", "Low": "#579bfc" }
        }}
      ],
      groups: {
        create: [
          { title: "Fonctionnalités Principales", color: "#579bfc" },
          { title: "Bugs & Fixes", color: "#e2445c" }
        ]
      }
    },
    include: { groups: { include: { items: true } } }
  });
}

// --- ACTIONS UTILISATEUR ---

export async function createItem(boardId: string, groupId: string, name: string) {
  if (!name.trim()) return;
  await prisma.item.create({
    data: { boardId, groupId, name, values: {} }
  });
  revalidatePath('/');
}

export async function deleteItem(itemId: string) {
  await prisma.item.delete({ where: { id: itemId } });
  revalidatePath('/');
}

export async function updateCell(itemId: string, colId: string, value: any) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return;

  const newValues = { ...(item.values as object), [colId]: value };
  
  await prisma.item.update({
    where: { id: itemId },
    data: { values: newValues }
  });
  revalidatePath('/');
}

export async function createGroup(boardId: string) {
  await prisma.group.create({
    data: { boardId, title: "Nouveau Groupe", color: "#a25ddc" }
  });
  revalidatePath('/');
}