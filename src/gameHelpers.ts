export const STAGE_WIDTH = 12;
export const STAGE_HEIGHT = 20;

export type TETROMINO_TYPE = '0' | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface ITetromino {
  shape: (TETROMINO_TYPE | 0)[][];
  color: string;
}

export const TETROMINOS: Record<string, ITetromino> = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
    ],
    color: '80, 227, 230',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0],
    ],
    color: '36, 95, 223',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L'],
    ],
    color: '223, 173, 36',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O'],
    ],
    color: '223, 217, 36',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0],
    ],
    color: '48, 211, 56',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0],
    ],
    color: '132, 61, 198',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0],
    ],
    color: '227, 78, 78',
  },
};

export type STAGE_CELL = [TETROMINO_TYPE | 0, string];
export type STAGE = STAGE_CELL[][];

export const createStage = (): STAGE =>
  Array.from(Array(STAGE_HEIGHT), () =>
    new Array(STAGE_WIDTH).fill([0, 'clear'])
  ) as STAGE;

export interface IPlayer {
  pos: { x: number; y: number };
  tetromino: (TETROMINO_TYPE | 0)[][];
  collided: boolean;
  rotation: number;
}

export const checkCollision = (
  player: IPlayer,
  stage: STAGE,
  { x: moveX, y: moveY }: { x: number; y: number }
) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Check that we're on an actual Tetromino cell
      if (player.tetromino[y][x] !== 0) {
        if (
          // 2. Check that our move is inside the game areas height (y)
          // We shouldn't go through the bottom of the play area
          !stage[y + player.pos.y + moveY] ||
          // 3. Check that our move is inside the game areas width (x)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // 4. Check that the cell we're moving to is 'merged'
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] === 'merged'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino =
    tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino as keyof typeof TETROMINOS];
};

export const generateBag = () => {
  const tetrominos = 'IJLOSTZ';
  const bag: string[] = [];
  // Standard 7-bag: one of each type
  for (const char of tetrominos) {
    bag.push(char);
  }
  // Shuffle the bag
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};
