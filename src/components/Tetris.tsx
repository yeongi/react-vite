import React, { useEffect, useRef, useState } from 'react';

// Hooks
import { useTetrisGame, GameMode } from '../hooks/useTetrisGame';

// Components
import Stage from './Stage';
import Display from './Display';
// import StartButton from './StartButton';
import HoldPiece from './HoldPiece';
import NextPiece from './NextPiece';

const Tetris: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const { gameState, opponentStage, isWaiting, countdown, actions } = useTetrisGame(gameMode);
  const { stage, score, rows, level, gameOver, won, hold, nextPiece } = gameState;
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWaiting && !countdown && gameMode) {
        wrapperRef.current?.focus();
        if (gameMode === 'single' && !gameState.gameOver && gameState.score === 0 && !gameState.nextPiece) {
            // Check if game hasn't started (heuristic: score 0, no nextPiece maybe? actually nextPiece is initialized in constructor)
            // Better: just call start if single mode selected and not started
             actions.startGame();
        }
    }
  }, [isWaiting, countdown, gameMode]); // Added gameMode dependency

  // Auto-start for single player when mode is selected
  useEffect(() => {
      if (gameMode === 'single') {
          actions.startGame();
      }
  }, [gameMode]);


  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver && !isWaiting && !countdown) {
      if (keyCode === 40) {
        actions.setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const move = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gameOver && !isWaiting && !countdown) {
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
                  <button className="start-button" style={{ width: '200px' }} onClick={() => setGameMode('single')}>
                      Single Play
                  </button>
                  <button className="start-button" style={{ width: '200px' }} onClick={() => setGameMode('multi')}>
                      Multi Play
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div 
        className={`tetris-wrapper ${gameOver && !won ? 'grayscale' : ''}`} 
        role="button" 
        tabIndex={0} 
        onKeyDown={move} 
        onKeyUp={keyUp} 
        ref={wrapperRef}
    >
      {isWaiting && (
          <div className="waiting-overlay">
              Waiting for opponent...
          </div>
      )}
      {countdown !== null && (
           <div className="waiting-overlay">
               <span style={{ fontSize: '5rem', fontWeight: 'bold' }}>{countdown}</span>
           </div>
      )}
      
      <div className='tetris'>
        
        {/* Player Section */}
        <div className="stage-container">
            <h2>You {won ? '🏆' : ''}</h2>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <div style={{ paddingRight: '10px' }}>
                    <NextPiece nextPiece={nextPiece} />
                </div>
                <Stage stage={stage} />
            </div>
        </div>

        {/* Stats Section */}
        <aside>
          {gameOver ? (
            <Display gameOver={gameOver} text={won ? "You Won!" : "Game Over"} />
          ) : (
            <div>
              <Display text={`Score: ${score}`} />
              <Display text={`Rows: ${rows}`} />
              <Display text={`Goal: 20`} />
              <Display text={`Level: ${level}`} />
              <HoldPiece hold={hold} />
            </div>
          )}
          <button className="start-button" onClick={() => setGameMode(null)}>Back to Menu</button>
        </aside>

        {/* Opponent Section - Only show in Multi mode */}
        {gameMode === 'multi' && (
            <div className="stage-container">
                <h2>Opponent</h2>
                <Stage stage={opponentStage} />
            </div>
        )}

      </div>
    </div>
  );
};

export default Tetris;