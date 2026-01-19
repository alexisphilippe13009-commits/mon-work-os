import { createDemoBoard, getBoard } from './actions'
import BoardView from '@/components/BoardView'

export default async function Page() {
  const boardId = await createDemoBoard();
  const board = await getBoard(boardId);
  
  return <BoardView board={board} />
}