'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// Récupérer le board complet
export async function getBoard(id: string) {
  return await prisma.board.findUnique({
    where: { id },
    include: {
      groups: {
        include: { items: { orderBy: { updatedAt: 'desc' } } }
      }
    }
  })
}

// Créer un item
export async function createItem(boardId: string, groupId: string, name: string) {
  await prisma.item.create({
    data: { boardId, groupId, name, values: {} }
  })
  revalidatePath('/')
}

// Mettre à jour une cellule (Magie du JSON)
export async function updateCell(itemId: string, colId: string, value: any) {
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item) return

  const newValues = { ...(item.values as object), [colId]: value }
  
  await prisma.item.update({
    where: { id: itemId },
    data: { values: newValues }
  })
  revalidatePath('/')
}

// Initialiser un Board de démo (pour que tu aies un truc à voir direct)
export async function createDemoBoard() {
  const existing = await prisma.board.findFirst();
  if (existing) return existing.id;

  const board = await prisma.board.create({
    data: {
      name: "Projet Alpha (Demo)",
      columns: [
        { id: "status", title: "Statut", type: "status", settings: { options: { "done": "#00c875", "stuck": "#e2445c", "working": "#fdab3d" } } },
        { id: "date", title: "Échéance", type: "date" },
        { id: "priority", title: "Priorité", type: "text" }
      ],
      groups: {
        create: [
          { title: "Cette semaine", color: "#579bfc" },
          { title: "Plus tard", color: "#a25ddc" }
        ]
      }
    }
  });
  return board.id;
}