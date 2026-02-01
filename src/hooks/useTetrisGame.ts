import { useState, useRef, useCallback } from 'react';
import { TetrisGame, GameState } from '../classes/TetrisGame';
import { useInterval } from './useInterval';

export const useTetrisGame = () => {
  const game = useRef(new TetrisGame());
  // Initialize state with the game's initial state
  const [gameState, setGameState] = useState<GameState>(game.current.getState());

  // Helper to sync state
  const syncState = useCallback(() => {
      setGameState(game.current.getState());
  }, []);

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

  const startMultiplayer = useCallback(() => {
      game.current.startMultiplayer();
      syncState(); // To reflect waiting state potentially
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
      actions: {
          move,
          drop,
          hardDrop,
          rotate,
          holdPiece,
          startGame,
          startMultiplayer,
          setDropTime
      }
  };
};