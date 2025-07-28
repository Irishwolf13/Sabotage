import React from 'react';
import { useGameSubscription } from './useGameSubscription';

const GameSubscriptionManager: React.FC = () => {
  useGameSubscription();
  return null;
};

export default GameSubscriptionManager;