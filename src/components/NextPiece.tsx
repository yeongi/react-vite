import React from 'react';
import Cell from './Cell';
import { TETROMINOS } from '../gameHelpers';

interface Props {
  nextPiece: any;
}

const NextPiece: React.FC<Props> = ({ nextPiece }) => {
  const tetromino = nextPiece && nextPiece !== 0 ? TETROMINOS[nextPiece as keyof typeof TETROMINOS].shape : [[0]];

  return (
    <div className='display' style={{ flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: '10px' }}>Next</div>
      <div style={{
        display: 'grid',
        gridTemplateRows: `repeat(${tetromino.length}, 1fr)`,
        gridTemplateColumns: `repeat(${tetromino[0].length}, 1fr)`,
        gap: '1px'
      }}>
        {tetromino.map((row: any[], y: number) =>
          row.map((cell, x) => (
            <div key={`${y}-${x}`} style={{ width: '15px', height: '15px' }}>
              {cell !== 0 && <Cell type={cell} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(NextPiece);
