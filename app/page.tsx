import { getBoardData } from './actions'
import BoardView from '@/components/BoardView'

export default async function Page() {
  // La nouvelle fonction récupère le board ou le crée automatiquement s'il n'existe pas
  const board = await getBoardData();
  
  return <BoardView board={board} />
}