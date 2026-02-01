import { useState, useCallback, useRef } from 'react';
import { TETROMINOS, STAGE_WIDTH, checkCollision, generateBag, IPlayer, STAGE, TETROMINO_TYPE } from '../gameHelpers';

// SRS Wall Kick Data
// 0: spawn, 1: R (clockwise), 2: 2 (180), 3: L (counter-clockwise)
const SRS_KICKS_JLS_T_Z = {
  '0-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1-0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1-2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3-2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3-0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

const SRS_KICKS_I = {
  '0-1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1-0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1-2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2-1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2-3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3-2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3-0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0-3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export const usePlayer = () => {
  const [player, setPlayer] = useState<IPlayer>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
    rotation: 0,
  });
  const [hold, setHold] = useState<TETROMINO_TYPE | null>(null);
  const [holdUsed, setHoldUsed] = useState(false);
  const [nextPiece, setNextPiece] = useState<TETROMINO_TYPE | 0>(0);
  
  const bagRef = useRef<TETROMINO_TYPE[]>([]);
  const floorSpinCount = useRef(0);

  const popFromBag = () => {
    if (bagRef.current.length === 0) {
      bagRef.current = generateBag() as TETROMINO_TYPE[];
    }
    return bagRef.current.pop() as TETROMINO_TYPE;
  };

  const rotate = (matrix: (TETROMINO_TYPE | 0)[][], dir: number) => {
    // Make the rows to become cols (transpose)
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotatedTetro.map(row => row.reverse());
    return rotatedTetro.reverse();
  };

  const playerRotate = (stage: STAGE, dir: number) => {
    // Limit spins on floor to 10
    const isOnFloor = checkCollision(player, stage, { x: 0, y: 1 });
    if (isOnFloor) {
      if (floorSpinCount.current >= 10) return;
      floorSpinCount.current += 1;
    } else {
      floorSpinCount.current = 0;
    }

    const clonedPlayer: IPlayer = JSON.parse(JSON.stringify(player));
    const oldRotation = clonedPlayer.rotation;
    const newRotation = (oldRotation + (dir > 0 ? 1 : 3)) % 4;
    
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);
    clonedPlayer.rotation = newRotation;

    // Determine which kick table to use
    const type = clonedPlayer.tetromino.flat().find(cell => cell !== 0);
    if (type === 'O') {
      // O piece doesn't kick, just check basic rotation
      if (!checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
        setPlayer(clonedPlayer);
      }
      return;
    }

    const kicks = type === 'I' ? SRS_KICKS_I : SRS_KICKS_JLS_T_Z;
    const kickKey = `${oldRotation}-${newRotation}` as keyof typeof kicks;
    const activeKicks = kicks[kickKey];

    if (activeKicks) {
      for (const [kx, ky] of activeKicks) {
        // SRS y is positive upwards, our coordinate system is positive downwards
        if (!checkCollision(clonedPlayer, stage, { x: kx, y: -ky })) {
          clonedPlayer.pos.x += kx;
          clonedPlayer.pos.y -= ky;
          setPlayer(clonedPlayer);
          return;
        }
      }
    }
  };

  const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided: boolean }) => {
    if (y > 0) {
      floorSpinCount.current = 0;
    }
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  };

  const playerHardDrop = useCallback((stage: STAGE) => {
    setPlayer(prev => {
      let tmpY = 0;
      // Use a clone or just 'prev' structure since checkCollision doesn't mutate
      while (!checkCollision(prev, stage, { x: 0, y: tmpY + 1 })) {
        tmpY += 1;
      }
      return {
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + tmpY },
        collided: true,
      };
    });
  }, []);

  const resetPlayer = useCallback(() => {
    let currentNext = nextPiece;
    if (currentNext === 0) {
      // First turn, populate both
      currentNext = popFromBag();
      const newNext = popFromBag();
      setNextPiece(newNext);
      setPlayer({
        pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
        tetromino: TETROMINOS[currentNext].shape,
        collided: false,
        rotation: 0,
      });
    } else {
      // Subsequent turns
      const newNext = popFromBag();
      setNextPiece(newNext);
      setPlayer({
        pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
        tetromino: TETROMINOS[currentNext].shape,
        collided: false,
        rotation: 0,
      });
    }
    setHoldUsed(false);
  }, [nextPiece]);

  const activateHold = () => {
    if (holdUsed) return;

    const currentType = player.tetromino.flat().find(cell => cell !== 0) as TETROMINO_TYPE | undefined;
    // If currentType is 0 (shouldn't happen in game), ignore
    if (!currentType) return;

    if (!hold) {
      setHold(currentType);
      resetPlayer();
    } else {
      const newTetromino = TETROMINOS[hold!].shape;
      setHold(currentType);
      setPlayer({
        pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
        tetromino: newTetromino,
        collided: false,
        rotation: 0,
      });
    }
    setHoldUsed(true);
  };

  return { player, updatePlayerPos, resetPlayer, playerRotate, activateHold, hold, playerHardDrop, nextPiece };
};
