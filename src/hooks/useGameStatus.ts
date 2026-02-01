import { useState, useEffect, useCallback } from 'react';

export const useGameStatus = (rowsCleared: number) => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (rowsCleared > 0) {
      const linePoints = [40, 100, 300, 1200];
      const points = linePoints[rowsCleared - 1];
      
      if (points) {
        setScore(prev => prev + points * (level + 1));
        setRows(prev => prev + rowsCleared);
        setLevel(prev => prev + rowsCleared);
      }
    }
  }, [rowsCleared, level]);

  const resetGameStatus = useCallback(() => {
    setScore(0);
    setRows(0);
    setLevel(0);
  }, []);

  return { score, rows, level, setScore, setRows, setLevel, resetGameStatus };
};
