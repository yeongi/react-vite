import React, { useState, useEffect, useCallback, useRef } from 'react';

import { createStage, checkCollision } from '../gameHelpers';

// Hooks
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

// Components
import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';
import HoldPiece from './HoldPiece';
import NextPiece from './NextPiece';

const Tetris: React.FC = () => {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const { player, updatePlayerPos, resetPlayer, playerRotate, activateHold, hold, playerHardDrop, nextPiece } = usePlayer();
  const { stage, setStage, rowsCleared } = useStage(player, resetPlayer);
  const { score, rows, level, setLevel, resetGameStatus } = useGameStatus(rowsCleared);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const startGame = useCallback(() => {
    // Reset everything
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    resetGameStatus();
    wrapperRef.current?.focus();
  }, [resetPlayer, resetGameStatus, setStage]);

  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver) {
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const move = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gameOver) {
      if (e.keyCode === 37) {
        e.preventDefault();
        movePlayer(-1);
      } else if (e.keyCode === 39) {
        e.preventDefault();
        movePlayer(1);
      } else if (e.keyCode === 40) {
        e.preventDefault();
        setDropTime(30);
      } else if (e.keyCode === 38) {
        e.preventDefault();
        playerRotate(stage, 1);
      } else if (e.keyCode === 67) { // C key
        e.preventDefault();
        activateHold();
      } else if (e.keyCode === 90) { // Z key
        e.preventDefault();
        playerRotate(stage, -1);
      } else if (e.keyCode === 32) { // Space key
        e.preventDefault();
        playerHardDrop(stage);
      }
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  return (
    <div className='tetris-wrapper' role="button" tabIndex={0} onKeyDown={move} onKeyUp={keyUp} ref={wrapperRef}>
      <div className='tetris'>
        <div style={{ width: '100%', maxWidth: '200px', display: 'block', padding: '0 20px' }}>
          <NextPiece nextPiece={nextPiece} />
        </div>
        <Stage stage={stage} />
        <aside>
          {gameOver ? (
            <Display gameOver={gameOver} text="Game Over" />
          ) : (
            <div>
              <Display text={`Score: ${score}`} />
              <Display text={`Rows: ${rows}`} />
              <Display text={`Level: ${level}`} />
              <HoldPiece hold={hold} />
            </div>
          )}
          <StartButton callback={startGame} />
        </aside>
      </div>
    </div>
  );
};

export default Tetris;