import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- Game constants ---
const CELL_SIZE = 20;
const GRID_SIZE = 15;
const INIT_LIVES = 5;
const INIT_SPEED = 200; // ms
const TIME_BOOST_DURATION = 10; // seconds

const NUM_BOMBS = 5;
const NUM_FRUITS = 1;
const NUM_HEARTS = 1;

// Helper to get a random position in the grid
const randomPos = () => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

// Helper to get a random position at least two cells away from the wall
const randomSafePos = () => ({
  x: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2,
  y: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2,
});

// Helper to generate a random snake of length 2, horizontal or vertical, at least two cubes from edge
const randomSnake = () => {
  const isHorizontal = Math.random() < 0.5;
  const head = randomSafePos();
  let tail;
  if (isHorizontal) {
    tail = { x: Math.max(0, Math.min(GRID_SIZE - 1, head.x - 1)), y: head.y };
    if (tail.x === head.x) tail.x = Math.min(GRID_SIZE - 1, head.x + 1);
  } else {
    tail = { x: head.x, y: Math.max(0, Math.min(GRID_SIZE - 1, head.y - 1)) };
    if (tail.y === head.y) tail.y = Math.min(GRID_SIZE - 1, head.y + 1);
  }
  return [head, tail];
};

interface Coordinates {
    x: number;
    y: number;
}

const initGridItem = (num: number, fn: () => Coordinates) => Array(num).fill(0).map(() => fn())

const SnakeGame = () => {
  // --- All hooks at the top ---
  const [playerName, setPlayerName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(5);

  // --- Randomize snake and items on start/restart ---
  const [snake, setSnake] = useState(randomSnake());
  // Fruits, bombs, hearts as arrays for easy scaling
  const [fruits, setFruits] = useState(initGridItem(NUM_FRUITS, randomPos));
  const [bombs, setBombs] = useState(initGridItem(NUM_BOMBS, randomPos));
  const [hearts, setHearts] = useState(initGridItem(NUM_HEARTS, randomPos));
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

  // --- Pause countdown effect ---
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
        // Deactivate time boost if expired
        if (timeBoostActive && timeBoostEnd && Date.now() > timeBoostEnd) {
          setTimeBoostActive(false);
          setSpeed(s => Math.min(INIT_SPEED, s + 50)); // Restore speed a bit
        }
      }, 1000);
    }
    return () => {
      if (timerInterval.current !== undefined) clearInterval(timerInterval.current);
    };
  }, [isGameOver, timeBoostActive, timeBoostEnd, showCountdownModal]);

  // --- moveSnake must be defined before useEffect ---
  const moveSnake = () => {
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
        setFruits(fruits.map(randomPos));
        setBombs(bombs.map(randomPos));
        setHearts(hearts.map(randomPos));
        setTimeBooster(randomPos());
        setSpeed(prev => Math.max(50, prev - 20));
        // Keep snake size, but randomize position
        const offset = snake.length - 2;
        const newSnake = randomSnake();
        if (offset > 0) {
          const tail = newSnake[newSnake.length - 1];
          for (let i = 0; i < offset; i++) {
            newSnake.push({ ...tail });
          }
        }
        setSnake(newSnake);
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
      setFruits(fruits.map((f, i) => (i === ateFruitIdx ? randomPos() : f)));
      const nextFruits = snake.length - 1 - 2 + 1; // +1 for this move
      if (nextFruits % 3 === 0) setSpeed(s => Math.max(50, s - 20));
    } else {
      newSnake.pop();
    }

    if (ateBombIdx !== -1) {
      setLives(l => Math.max(0, l - 1));
      setSpeed(s => Math.max(50, s - 30));
      setBombs(bombs.map((b, i) => (i === ateBombIdx ? randomPos() : b)));
      if (lives - 1 <= 0) {
        setIsGameOver(true);
        setLives(0);
        clearInterval(moveInterval.current);
        return;
      }
    }

    if (ateHeartIdx !== -1) {
      setLives(l => l + 1);
      setHearts(hearts.map((h, i) => (i === ateHeartIdx ? randomPos() : h)));
    }

    if (ateTimeBooster) {
      setTimeBoostActive(true);
      setTimeBoostEnd(Date.now() + TIME_BOOST_DURATION * 1000);
      setSpeed(s => Math.max(30, s - 70));
      setTimeBooster(randomPos());
    }

    setSnake(newSnake);
  };

  // --- Now useEffect can reference moveSnake safely ---
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

  // Keyboard controls (h, j, k, l) - only for web
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

  // --- Only then, do conditional returns ---
  if (!nameEntered) {
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
          onPress={() => {
            if (playerName.trim().length > 0) {
              setNameEntered(true);
              setShowCountdownModal(true); // Show pause modal after name entered
              setPauseTimer(5);   // Reset timer
            }
          }}
        >
          <Text style={styles.startBtnText}>Start Game</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (showCountdownModal && !isGameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <Modal transparent visible>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.pauseText}>Game starts in</Text>
              <Text style={styles.pauseTimer}>{pauseTimer}</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const changeDir = (x: number, y: number) => {
    if ((dir.x !== 0 && x !== 0) || (dir.y !== 0 && y !== 0)) return; // Prevent reverse
    setDir({ x, y });
  };

  const restart = () => {
    // Prepare occupied array with the new snake
    const newSnake = randomSnake();
    const occupied = [...newSnake];

    // Fruits
    const newFruits = Array(NUM_FRUITS).fill(0).map(() => {
      const pos = getUniqueRandomPos(occupied);
      occupied.push(pos);
      return pos;
    });

    // Bombs
    const newBombs = Array(NUM_BOMBS).fill(0).map(() => {
      const pos = getUniqueRandomPos(occupied);
      occupied.push(pos);
      return pos;
    });

    // Hearts
    const newHearts = Array(NUM_HEARTS).fill(0).map(() => {
      const pos = getUniqueRandomPos(occupied);
      occupied.push(pos);
      return pos;
    });

    // Time booster
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
  };

  // Prevent items from spawning on the snake
  const getUniqueRandomPos = (occupied: Coordinates[]) => {
    let pos: Coordinates;
    do {
      pos = randomPos();
    } while (occupied.some(o => o.x === pos.x && o.y === pos.y));
    return pos;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.lives}>Player: {playerName}</Text>
      <Text style={styles.lives}>Lives: {lives}</Text>
      <Text style={styles.lives}>Fruits: {snake.length - 2}</Text>
      <Text style={styles.lives}>
        Timer: {timer}s {timeBoostActive && <Text style={{ color: 'blue' }}>⏱️ BOOST!</Text>}
      </Text>
      <View
        style={styles.board}
        onStartShouldSetResponder={() => true}
        onResponderRelease={e => {
          const { locationX, locationY } = e.nativeEvent;
          const centerX = (CELL_SIZE * GRID_SIZE) / 2;
          const centerY = (CELL_SIZE * GRID_SIZE) / 2;
          const dx = locationX - centerX;
          const dy = locationY - centerY;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) changeDir(1, 0); // right
            else changeDir(-1, 0); // left
          } else {
            if (dy > 0) changeDir(0, 1); // down
            else changeDir(0, -1); // up
          }
        }}
      >
        {[...Array(GRID_SIZE)].map((_, y) => (
          <View key={y} style={styles.row}>
            {[...Array(GRID_SIZE)].map((_, x) => {
              const isSnake = snake.some(seg => seg.x === x && seg.y === y);
              const isFruit = fruits.some(f => f.x === x && f.y === y);
              const isBomb = bombs.some(b => b.x === x && b.y === y);
              const isHeart = hearts.some(h => h.x === x && h.y === y);
              const isTimeBooster = timeBooster.x === x && timeBooster.y === y;
              return (
                <View
                  key={x}
                  style={[
                    styles.cell,
                    isSnake && styles.snake,
                    isFruit && styles.food,
                    isBomb && styles.bomb,
                    isHeart && styles.heart,
                    isTimeBooster && styles.timeBooster,
                  ]}
                >
                  {isFruit && <Text style={styles.icon}>🥒</Text>}
                  {isBomb && <Text style={styles.icon}>💣</Text>}
                  {isHeart && <Text style={styles.icon}>❤️</Text>}
                  {isTimeBooster && <Text style={styles.icon}>⏱️</Text>}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      {isGameOver && (
        <TouchableOpacity onPress={restart}>
          <Text style={styles.over}>Game Over. Tap to Restart.</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  board: { width: CELL_SIZE * GRID_SIZE, height: CELL_SIZE * GRID_SIZE },
  row: { flexDirection: 'row' },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#eee',
    borderWidth: 0.5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snake: { backgroundColor: 'green' },
  food: { backgroundColor: 'rgba(9, 125, 9, 0.3)' },
  bomb: { backgroundColor: '#333' },
  heart: { backgroundColor: '#ffe6ea' },
  timeBooster: { backgroundColor: '#e0f7fa' },
  icon: { fontSize: 14, textAlign: 'center' },
  controls: { marginTop: 20, alignItems: 'center' },
  btn: { fontSize: 30, padding: 10 },
  over: { fontSize: 18, color: 'red', marginTop: 20 },
  lives: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    width: 200,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pauseTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196f3',
  },
});

export default SnakeGame;