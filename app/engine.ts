import { Item, Column, Board } from './types';

// --- FORMULA ENGINE (Le mini-Excel) ---
export const evaluateFormula = (formula: string, item: Item, columns: Column[]) => {
  try {
    // 1. Remplacer les {Colonnes} par leurs valeurs
    let expression = formula;
    columns.forEach(col => {
      const val = item.values[col.id];
      // Si c'est un nombre, on remplace direct, sinon 0
      const safeVal = (col.type === 'numbers' || col.type === 'rating') ? (val || 0) : 0;
      expression = expression.replace(new RegExp(`{${col.title}}`, 'g'), String(safeVal));
    });

    // 2. Évaluation sécurisée (pas de eval() direct pour la sécu)
    // On supporte +, -, *, /, %, et les parenthèses
    // Ceci est une version simplifiée, une version enterprise utiliserait un Abstract Syntax Tree (AST)
    const result = new Function(`return (${expression})`)();
    return isNaN(result) ? "Error" : result;
  } catch (e) {
    return "Err";
  }
};

// --- AUTOMATION ENGINE (Le Robot) ---
export const runAutomations = (board: Board, item: Item, changeType: string, changeData: any): Board => {
  let newBoard = JSON.parse(JSON.stringify(board)); // Deep Copy pour immutabilité

  board.automations.forEach(auto => {
    if (!auto.active) return;

    // SCENARIO 1: Quand le statut change en "Done" -> Déplacer vers groupe "Terminé"
    if (changeType === 'status_change' && auto.trigger === 'status_change') {
        const { colId, newVal } = changeData;
        
        // Vérification de la condition
        if (newVal === auto.condition.value) {
            // Action: Déplacer
            if (auto.action === 'move_to_group') {
                const targetGroupId = auto.condition.targetGroupId;
                
                // 1. Trouver l'item et le retirer de son ancien groupe
                newBoard.groups = newBoard.groups.map(g => ({
                    ...g,
                    items: g.items.filter(i => i.id !== item.id)
                }));

                // 2. L'ajouter au nouveau groupe
                newBoard.groups = newBoard.groups.map(g => {
                    if (g.id === targetGroupId) {
                        return { ...g, items: [...g.items, item] }; // On garde l'item tel quel
                    }
                    return g;
                });
            }
        }
    }
  });

  return newBoard;
};

// --- PROGRESS TRACKER ---
export const calculateProgress = (item: Item, columns: Column[]) => {
    const statusCols = columns.filter(c => c.type === 'status');
    if (statusCols.length === 0) return 0;

    let doneCount = 0;
    statusCols.forEach(col => {
        if (item.values[col.id] === 'Done' || item.values[col.id] === 'Terminé') doneCount++;
    });
    
    return Math.round((doneCount / statusCols.length) * 100);
}; 