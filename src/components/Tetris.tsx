import React, { useEffect, useRef } from 'react';

// Hooks
import { useTetrisGame } from '../hooks/useTetrisGame';

// Components
import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';
import HoldPiece from './HoldPiece';
import NextPiece from './NextPiece';

const Tetris: React.FC = () => {
  const { gameState, actions } = useTetrisGame();
  const { stage, score, rows, level, gameOver, hold, nextPiece, waiting } = gameState;
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    actions.startGame();
    wrapperRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver && !waiting) {
      if (keyCode === 40) {
        actions.setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const move = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gameOver && !waiting) {
      if (e.keyCode === 37) {
        e.preventDefault();
        actions.move(-1);
      } else if (e.keyCode === 39) {
        e.preventDefault();
        actions.move(1);
      } else if (e.keyCode === 40) {
        e.preventDefault();
        actions.setDropTime(30);
      } else if (e.keyCode === 38) {
        e.preventDefault();
        actions.rotate(1);
      } else if (e.keyCode === 67) { // C key
        e.preventDefault();
        actions.holdPiece();
      } else if (e.keyCode === 90) { // Z key
        e.preventDefault();
        actions.rotate(-1);
      } else if (e.keyCode === 32) { // Space key
        e.preventDefault();
        actions.hardDrop();
      }
    }
  };

  return (
    <div className='tetris-wrapper' role="button" tabIndex={0} onKeyDown={move} onKeyUp={keyUp} ref={wrapperRef}>
      <div className='tetris' style={{ position: 'relative' }}>
        {waiting && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '2rem', zIndex: 10
          }}>
            Waiting for Opponent...
          </div>
        )}
        <div style={{ width: '100%', maxWidth: '200px', display: 'block', padding: '0 20px' }}>
          <NextPiece nextPiece={nextPiece} />
        </div>
        <Stage stage={stage} />
        <aside>
          {gameOver ? (
            <Display gameOver={gameOver} text={gameState.won ? "You Won!" : "Game Over"} />
          ) : (
            <div>
              <Display text={`Score: ${score}`} />
              <Display text={`Rows: ${rows}`} />
              <Display text={`Level: ${level}`} />
              <HoldPiece hold={hold} />
            </div>
          )}
          <StartButton callback={actions.startGame} />
        </aside>
      </div>
    </div>
  );
};

export default Tetris;
