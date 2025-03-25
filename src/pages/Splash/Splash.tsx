import React, { useEffect } from 'react';
import './Splash.css';

interface ContainerProps {
  name: string;
}

const Splash: React.FC<ContainerProps> = ({ name }) => {

  return (
    <div>
      Splash Page
    </div>
  );
};

export default Splash;
