import React from 'react';
import { TETROMINOS, TETROMINO_TYPE } from '../gameHelpers';

interface Props {
  type: TETROMINO_TYPE | 0;
  status?: string;
}

const Cell: React.FC<Props> = ({ type, status }) => (
  <div className={`cell ${type ? 'filled' : ''}`} style={{
    width: 'auto',
    background: `rgba(${type ? TETROMINOS[type].color : '0, 0, 0'}, ${status === 'ghost' ? 0.3 : 0.8})`,
    border: type ? (status === 'ghost' ? '4px solid rgba(0,0,0,0)' : '4px solid') : '4px solid',
    borderBottomColor: `rgba(${type ? TETROMINOS[type].color : '0, 0, 0'}, ${status === 'ghost' ? 0.1 : 0.1})`,
    borderRightColor: `rgba(${type ? TETROMINOS[type].color : '0, 0, 0'}, ${status === 'ghost' ? 0.3 : 1})`,
    borderTopColor: `rgba(${type ? TETROMINOS[type].color : '0, 0, 0'}, ${status === 'ghost' ? 0.3 : 1})`,
    borderLeftColor: `rgba(${type ? TETROMINOS[type].color : '0, 0, 0'}, ${status === 'ghost' ? 0.1 : 0.3})`,
  }} />
);

export default React.memo(Cell);
