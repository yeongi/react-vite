import React from 'react';

interface Props {
  gameOver?: boolean;
  text: string;
}

const Display: React.FC<Props> = ({ gameOver, text }) => (
  <div className='display' style={{ color: gameOver ? 'red' : '#999' }}>
    {text}
  </div>
);

export default Display;
