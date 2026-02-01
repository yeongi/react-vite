import { useState, useEffect } from 'react';
import { createStage, checkCollision, STAGE, STAGE_CELL, IPlayer } from '../gameHelpers';

export const useStage = (player: IPlayer, resetPlayer: () => void) => {
  const [stage, setStage] = useState<STAGE>(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newStage: STAGE) => {
      return newStage.reduce((ack, row) => {
        if (row.findIndex(cell => cell[0] === 0) === -1) {
          setRowsCleared(prev => prev + 1);
          ack.unshift(new Array(newStage[0].length).fill([0, 'clear']) as STAGE_CELL[]);
          return ack;
        }
        ack.push(row);
        return ack;
      }, [] as STAGE);
    };

    const updateStage = (prevStage: STAGE) => {
      // First flush the stage from the scan
      const newStage = prevStage.map(row =>
        row.map(cell => (cell[1] === 'merged' ? cell : [0, 'clear']))
      ) as STAGE;

      // Draw ghost
      let ghostY = 0;
      while (ghostY < newStage.length && !checkCollision(player, newStage, { x: 0, y: ghostY + 1 })) {
        ghostY += 1;
      }

      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const targetY = y + player.pos.y + ghostY;
            const targetX = x + player.pos.x;
            if (
              newStage[targetY] &&
              newStage[targetY][targetX] &&
              newStage[targetY][targetX][1] === 'clear'
            ) {
              newStage[targetY][targetX] = [value, 'ghost'];
            }
          }
        });
      });

      // Then draw the tetromino
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newStage[y + player.pos.y][x + player.pos.x] = [
              value,
              `${player.collided ? 'merged' : 'clear'}`,
            ];
          }
        });
      });

      // Check if we collided
      if (player.collided) {
        return sweepRows(newStage);
      }

      return newStage;
    };

    setStage(prev => updateStage(prev));

    if (player.collided) {
      resetPlayer();
    }
  }, [player, resetPlayer]);

  return { stage, setStage, rowsCleared };
};