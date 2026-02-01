import { useState, useRef, useCallback, useEffect } from 'react';
import { TetrisGame, GameState } from '../classes/TetrisGame';
import { useInterval } from './useInterval';
import { io, Socket } from 'socket.io-client';
import { createStage, STAGE } from '../gameHelpers';

const SOCKET_URL = 'http://localhost:3001';

export type GameMode = 'single' | 'multi' | null;

export const useTetrisGame = (gameMode: GameMode) => {
  const game = useRef(new TetrisGame());
  const [gameState, setGameState] = useState<GameState>(game.current.getState());
  const [opponentStage, setOpponentStage] = useState<STAGE>(createStage());
  
  // Multi-player states
  const [isWaiting, setIsWaiting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (gameMode !== 'multi') {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsWaiting(false);
        return;
    }

    // Initialize Socket only for multi
    socketRef.current = io(SOCKET_URL);

    const socket = socketRef.current;

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('waiting_for_opponent', () => {
        setIsWaiting(true);
    });

    socket.on('start_game', () => {
        setIsWaiting(false);
        startCountdown();
    });

    socket.on('opponent_state', (stage: STAGE) => {
        setOpponentStage(stage);
    });

    socket.on('game_over_lose', () => {
        game.current.setGameOver(false);
        setGameState(game.current.getState());
    });

    socket.on('game_over_win', () => {
         game.current.setGameOver(true);
         setGameState(game.current.getState());
    });

    return () => {
        socket.disconnect();
    };
  }, [gameMode]);

  const startCountdown = () => {
      setCountdown(3);
      let count = 3;
      const interval = setInterval(() => {
          count -= 1;
          if (count > 0) {
              setCountdown(count);
          } else {
              clearInterval(interval);
              setCountdown(null);
              game.current.start();
              setGameState(game.current.getState());
          }
      }, 1000);
  };

  // Helper to sync state
  const syncState = useCallback(() => {
      const state = game.current.getState();
      setGameState(state);
      
      // Emit state to opponent
      if (gameMode === 'multi' && socketRef.current && !state.gameOver) {
          socketRef.current.emit('update_state', state.stage);
      }

      // Check for win condition emission
      if (gameMode === 'multi' && state.won && socketRef.current) {
          socketRef.current.emit('player_won');
      }

  }, [gameMode]);

  // Actions
  const move = useCallback((dir: number) => {
      game.current.move(dir);
      syncState();
  }, [syncState]);

  const drop = useCallback(() => {
      game.current.drop();
      syncState();
  }, [syncState]);

  const hardDrop = useCallback(() => {
      game.current.hardDrop();
      syncState();
  }, [syncState]);

  const rotate = useCallback((dir: number) => {
      game.current.rotate(dir);
      syncState();
  }, [syncState]);

  const holdPiece = useCallback(() => {
      game.current.holdPiece();
      syncState();
  }, [syncState]);

  const startGame = useCallback(() => {
      game.current.start();
      syncState();
  }, [syncState]);

  const setDropTime = useCallback((time: number | null) => {
      game.current.setDropTime(time);
      syncState();
  }, [syncState]);

  // Game Loop
  useInterval(() => {
      drop();
  }, gameState.dropTime);

  return {
      gameState,
      opponentStage,
      isWaiting,
      countdown,
      actions: {
          move,
          drop,
          hardDrop,
          rotate,
          holdPiece,
          startGame,
          setDropTime
      }
  };
};
