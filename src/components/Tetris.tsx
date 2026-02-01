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
  const [gameMode, setGameMode] = React.useState<'single' | 'multi' | null>(null);
  const { gameState, actions } = useTetrisGame();
  const { stage, score, rows, level, gameOver, hold, nextPiece, waiting } = gameState;
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameMode && !waiting) {
        wrapperRef.current?.focus();
    }
  }, [gameMode, waiting]);

  const handleStartSingle = () => {
      setGameMode('single');
      actions.startGame();
  };

  const handleStartMulti = () => {
      setGameMode('multi');
      actions.startMultiplayer();
  };

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameMode) return;
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

  if (!gameMode) {
      return (
          <div className="tetris-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h1 style={{ marginBottom: '40px', fontFamily: 'Pixelify Sans', fontSize: '3rem' }}>Tetris Game</h1>
              <div style={{ display: 'flex', gap: '20px' }}>
                  <button className="start-button" style={{ width: '200px' }} onClick={handleStartSingle}>
                      Single Play
                  </button>
                  <button className="start-button" style={{ width: '200px' }} onClick={handleStartMulti}>
                      Multi Play
                  </button>
              </div>
          </div>
      );
  }

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
          <button className="start-button" onClick={() => { setGameMode(null); /* Reset game? */ }}>Back to Menu</button>
        </aside>
      </div>
    </div>
  );
};

export default Tetris;
