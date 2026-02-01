import React from 'react';
import Cell from './Cell';
import { TETROMINOS } from '../gameHelpers';

interface Props {
  hold: any;
}

const HoldPiece: React.FC<Props> = ({ hold }) => {
  const tetromino = hold ? TETROMINOS[hold as keyof typeof TETROMINOS].shape : [[0]];

  return (
    <div className='display' style={{ flexDirection: 'column', alignItems: 'center', width: '100%', height: '120px', justifyContent: 'center' }}>
      <div style={{ marginBottom: '10px' }}>Hold</div>
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

export default React.memo(HoldPiece);
