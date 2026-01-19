'use server'

import { PrismaClient } from '@prisma/client'

// Hack pour éviter les connexions multiples en dev (Next.js Hot Reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- SAUVEGARDE (GLOBAL STATE) ---
export async function saveToCloud(data: any) {
  try {
    // On sauvegarde ou on met à jour l'état global dans la table AppState
    await prisma.appState.upsert({
      where: { id: "global_state" },
      update: { data: data },
      create: { id: "global_state", data: data }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur de sauvegarde:", error);
    return { success: false };
  }
}

// --- CHARGEMENT (GLOBAL STATE) ---
export async function loadFromCloud() {
  try {
    const state = await prisma.appState.findUnique({
      where: { id: "global_state" }
    });
    
    if (state && state.data) {
      return state.data;
    }
    return null; // Pas encore de données
  } catch (error) {
    console.error("Erreur de chargement:", error);
    return null;
  }
}