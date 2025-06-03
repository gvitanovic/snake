import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import {
    CELL_SIZE, GRID_SIZE, INIT_LIVES, INIT_SPEED,
    NUM_BOMBS, NUM_FRUITS, NUM_HEARTS,
    TIME_BOOST_DURATION
} from '../../constants/gameConstants';
import Board from './components/molecules/Board';
import NameInput from './components/organisms/NameInput';
import PauseModal from './components/organisms/PauseModal';
import { styles } from './snakeStyles';
import {
    getUniqueRandomPos,
    randomPos, randomSnake
} from './snakeUtils';

const SnakeGame = () => {
  // State
  const [playerName, setPlayerName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(5);

  const [snake, setSnake] = useState(randomSnake());
  const [fruits, setFruits] = useState(Array(NUM_FRUITS).fill(0).map(randomPos));
  const [bombs, setBombs] = useState(Array(NUM_BOMBS).fill(0).map(randomPos));
  const [hearts, setHearts] = useState(Array(NUM_HEARTS).fill(0).map(randomPos));
  const [timeBooster, setTimeBooster] = useState(randomPos());
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [lives, setLives] = useState(INIT_LIVES);
  const [speed, setSpeed] = useState(INIT_SPEED);
  const [timer, setTimer] = useState(0);
  const [timeBoostActive, setTimeBoostActive] = useState(false);
  const [timeBoostEnd, setTimeBoostEnd] = useState<number | null>(null);
  const moveInterval = useRef<number | undefined>(undefined);
  const timerInterval = useRef<number | undefined>(undefined);

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

  // Timer effect
  useEffect(() => {
    if (!isGameOver && !showCountdownModal) {
      if (timerInterval.current !== undefined) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        setTimer(t => t + 1);
        if (timeBoostActive && timeBoostEnd && Date.now() > timeBoostEnd) {
          setTimeBoostActive(false);
          setSpeed(s => Math.min(INIT_SPEED, s + 50));
        }
      }, 1000);
    }
    return () => {
      if (timerInterval.current !== undefined) clearInterval(timerInterval.current);
    };
  }, [isGameOver, timeBoostActive, timeBoostEnd, showCountdownModal]);

  // Movement effect
  useEffect(() => {
    if (!isGameOver && !showCountdownModal) {
      if (moveInterval.current !== undefined) clearInterval(moveInterval.current);
      moveInterval.current = setInterval(moveSnake, speed);
    }
    return () => {
      if (moveInterval.current !== undefined) {
        clearInterval(moveInterval.current);
      }
    };
  }, [snake, dir, isGameOver, speed, showCountdownModal]);

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
  }, [dir, isGameOver, showCountdownModal]);

  // Movement logic
  function moveSnake() {
    if (showCountdownModal) return;
    const newHead = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y,
    };

    // Check collision with wall or self
    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y >= GRID_SIZE ||
      snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
    ) {
      if (lives > 1) {
        setLives(lives - 1);
        setDir({ x: 1, y: 0 });
        // Place all items uniquely
        const newSnake = (() => {
          const offset = snake.length - 2;
          const base = randomSnake();
          if (offset > 0) {
            const tail = base[base.length - 1];
            for (let i = 0; i < offset; i++) base.push({ ...tail });
          }
          return base;
        })();
        const occupied = [...newSnake];
        const newFruits = Array(NUM_FRUITS).fill(0).map(() => {
          const pos = getUniqueRandomPos(occupied);
          occupied.push(pos);
          return pos;
        });
        const newBombs = Array(NUM_BOMBS).fill(0).map(() => {
          const pos = getUniqueRandomPos(occupied);
          occupied.push(pos);
          return pos;
        });
        const newHearts = Array(NUM_HEARTS).fill(0).map(() => {
          const pos = getUniqueRandomPos(occupied);
          occupied.push(pos);
          return pos;
        });
        const boosterPos = getUniqueRandomPos(occupied);

        setSnake(newSnake);
        setFruits(newFruits);
        setBombs(newBombs);
        setHearts(newHearts);
        setTimeBooster(boosterPos);
        setSpeed(prev => Math.max(50, prev - 20));
      } else {
        setIsGameOver(true);
        setLives(0);
        clearInterval(moveInterval.current);
      }
      return;
    }

    // Check for fruit, bomb, heart, time booster
    let ateFruitIdx = fruits.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    let ateBombIdx = bombs.findIndex(b => b.x === newHead.x && b.y === newHead.y);
    let ateHeartIdx = hearts.findIndex(h => h.x === newHead.x && h.y === newHead.y);
    let ateTimeBooster = newHead.x === timeBooster.x && newHead.y === timeBooster.y;

    let newSnake = [newHead, ...snake];

    if (ateFruitIdx !== -1) {
      // Replace eaten fruit
      setFruits(fruits.map((f, i) => (i === ateFruitIdx ? getUniqueRandomPos([...newSnake, ...fruits, ...bombs, ...hearts, timeBooster]) : f)));
      if (((snake.length - 1) % 3) === 0) setSpeed(s => Math.max(50, s - 20));
    } else {
      newSnake.pop();
    }

    if (ateBombIdx !== -1) {
      setLives(l => Math.max(0, l - 1));
      setSpeed(s => Math.max(50, s - 30));
      setBombs(bombs.map((b, i) => (i === ateBombIdx ? getUniqueRandomPos([...newSnake, ...fruits, ...bombs, ...hearts, timeBooster]) : b)));
      if (lives - 1 <= 0) {
        setIsGameOver(true);
        setLives(0);
        clearInterval(moveInterval.current);
        return;
      }
    }

    if (ateHeartIdx !== -1) {
      setLives(l => l + 1);
      setHearts(hearts.map((h, i) => (i === ateHeartIdx ? getUniqueRandomPos([...newSnake, ...fruits, ...bombs, ...hearts, timeBooster]) : h)));
    }

    if (ateTimeBooster) {
      setTimeBoostActive(true);
      setTimeBoostEnd(Date.now() + TIME_BOOST_DURATION * 1000);
      setSpeed(s => Math.max(30, s - 70));
      setTimeBooster(getUniqueRandomPos([...newSnake, ...fruits, ...bombs, ...hearts]));
    }

    setSnake(newSnake);
  }

  function changeDir(x: number, y: number) {
    if ((dir.x !== 0 && x !== 0) || (dir.y !== 0 && y !== 0)) return; // Prevent reverse
    setDir({ x, y });
  }

  function restart() {
    const newSnake = randomSnake();
    const occupied = [...newSnake];
    const newFruits = Array(NUM_FRUITS).fill(0).map(() => {
      const pos = getUniqueRandomPos(occupied);
      occupied.push(pos);
      return pos;
    });
    const newBombs = Array(NUM_BOMBS).fill(0).map(() => {
      const pos = getUniqueRandomPos(occupied);
      occupied.push(pos);
      return pos;
    });
    const newHearts = Array(NUM_HEARTS).fill(0).map(() => {
      const pos = getUniqueRandomPos(occupied);
      occupied.push(pos);
      return pos;
    });
    const boosterPos = getUniqueRandomPos(occupied);

    setSnake(newSnake);
    setDir({ x: 1, y: 0 });
    setFruits(newFruits);
    setBombs(newBombs);
    setHearts(newHearts);
    setTimeBooster(boosterPos);
    setIsGameOver(false);
    setLives(INIT_LIVES);
    setSpeed(INIT_SPEED);
    setTimer(0);
    setTimeBoostActive(false);
    setTimeBoostEnd(null);
    setShowCountdownModal(true);
    setPauseTimer(5);
  }

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
        <TouchableOpacity onPress={restart}>
          <Text style={styles.over}>Game Over. Tap to Restart.</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default SnakeGame;