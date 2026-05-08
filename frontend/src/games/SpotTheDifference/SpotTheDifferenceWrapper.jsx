import React, { useState } from 'react';
import CollectionBrowser from './CollectionBrowser';
import SpotTheDifference from './SpotTheDifference';
import GameLayout from '../common/GameLayout';

export default function SpotTheDifferenceWrapper() {
  const [selectedLevel, setSelectedLevel] = useState(null);

  if (selectedLevel) {
    return (
      <SpotTheDifference 
        level={selectedLevel} 
        onExit={() => setSelectedLevel(null)} 
      />
    );
  }

  return (
    <GameLayout title="SPOT THE DIFFERENCE">
      <CollectionBrowser onSelectLevel={(level) => setSelectedLevel(level)} />
    </GameLayout>
  );
}
