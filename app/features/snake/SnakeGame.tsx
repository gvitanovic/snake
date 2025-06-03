import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import {
    CELL_SIZE, GRID_SIZE
} from '../../constants/gameConstants';
import { useSnakeGame } from '../../features/snake/hooks/useSnakeGame';
import Board from './components/molecules/Board';
import NameInput from './components/organisms/NameInput';
import PauseModal from './components/organisms/PauseModal';
import { styles } from './snakeStyles';

const SnakeGame = () => {
  const [playerName, setPlayerName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(5);

  const {
    snake, fruits, bombs, hearts, timeBooster, isGameOver, lives, timer, timeBoostActive, changeDir, restart
  } = useSnakeGame(nameEntered, showCountdownModal);

  // Pause countdown effect
  useEffect(() => {
    if (!showCountdownModal) return;
    setPauseTimer(5);
    const pauseInt = setInterval(() => {
      setPauseTimer(t => {
        if (t <= 1) {
          clearInterval(pauseInt);
          setShowCountdownModal(false);
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(pauseInt);
  }, [showCountdownModal]);

  // Keyboard controls (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || showCountdownModal) return;
      if (e.key === 'h') changeDir(-1, 0);
      if (e.key === 'l') changeDir(1, 0);
      if (e.key === 'k') changeDir(0, -1);
      if (e.key === 'j') changeDir(0, 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDir, isGameOver, showCountdownModal]);

  // Render
  if (!nameEntered) {
    return (
      <NameInput
        playerName={playerName}
        setPlayerName={setPlayerName}
        onStart={() => {
          if (playerName.trim().length > 0) {
            setNameEntered(true);
            setShowCountdownModal(true);
            setPauseTimer(5);
          }
        }}
      />
    );
  }

  if (showCountdownModal && !isGameOver) {
    return <PauseModal visible={showCountdownModal} timer={pauseTimer} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.lives}>Player: {playerName}</Text>
      <Text style={styles.lives}>Lives: {lives}</Text>
      <Text style={styles.lives}>Fruits: {snake.length - 2}</Text>
      <Text style={styles.lives}>
        Timer: {timer}s {timeBoostActive && <Text style={{ color: 'blue' }}>⏱️ BOOST!</Text>}
      </Text>
      <Board
        snake={snake}
        fruits={fruits}
        bombs={bombs}
        hearts={hearts}
        timeBooster={timeBooster}
        onCellPress={e => {
          const { locationX, locationY } = e.nativeEvent;
          const centerX = (CELL_SIZE * GRID_SIZE) / 2;
          const centerY = (CELL_SIZE * GRID_SIZE) / 2;
          const dx = locationX - centerX;
          const dy = locationY - centerY;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) changeDir(1, 0);
            else changeDir(-1, 0);
          } else {
            if (dy > 0) changeDir(0, 1);
            else changeDir(0, -1);
          }
        }}
      />
      {isGameOver && (
        <TouchableOpacity onPress={() => {
          restart();
          setShowCountdownModal(true);
          setPauseTimer(5);
        }}>
          <Text style={styles.over}>Game Over. Tap to Restart.</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default SnakeGame;