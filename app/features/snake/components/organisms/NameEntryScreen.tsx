import React from 'react';
import NameInput from './NameInput';

interface NameEntryScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  nameEntered: boolean;
  onNameEntered: () => void;
}

export default function NameEntryScreen({
  playerName,
  setPlayerName,
  nameEntered,
  onNameEntered,
}: NameEntryScreenProps) {
  if (nameEntered) return null;
  return (
    <NameInput
      playerName={playerName}
      setPlayerName={setPlayerName}
      onStart={() => {
        if (playerName.trim().length > 0) {
          onNameEntered();
        }
      }}
    />
  );
}