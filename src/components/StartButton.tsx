import React from 'react';

interface Props {
  callback: () => void;
}

const StartButton: React.FC<Props> = ({ callback }) => (
  <button className='start-button' onClick={callback}>Start Game</button>
);

export default StartButton;
