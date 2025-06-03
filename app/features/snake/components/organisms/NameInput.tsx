import React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../../snakeStyles';

type NameInputProps = {
  playerName: string;
  setPlayerName: (name: string) => void;
  onStart: () => void;
};

export default function NameInput({ playerName, setPlayerName, onStart }: NameInputProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter your name:</Text>
      <TextInput
        style={styles.input}
        value={playerName}
        onChangeText={setPlayerName}
        placeholder="Player name"
        autoFocus
      />
      <TouchableOpacity
        style={styles.startBtn}
        onPress={onStart}
      >
        <Text style={styles.startBtnText}>Start Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}