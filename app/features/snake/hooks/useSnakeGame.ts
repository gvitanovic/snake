import { useCallback, useEffect, useState } from 'react';
import {
  INIT_LIVES, INIT_SPEED, TIME_BOOST_DURATION
} from '../../../constants/gameConstants';
import { Coordinates } from '../snakeTypes';
import {
  randomSnake
} from '../snakeUtils';
import { useBoardItems } from './useBoardItems';
import { useSnakeMovement } from './useSnakeMovement';
import { useTimer } from './useTimer';

export function useSnakeGame(gameStarted: boolean, nameEntered: boolean, showCountdownModal: boolean) {
  const [snake, setSnake] = useState(randomSnake());
  const [fruits, setFruits] = useState<Coordinates[]>([]);
  const [bombs, setBombs] = useState<Coordinates[]>([]);
  const [hearts, setHearts] = useState<Coordinates[]>([]);
  const [timeBooster, setTimeBooster] = useState({ x: 0, y: 0 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [lives, setLives] = useState(INIT_LIVES);
  const [speed, setSpeed] = useState(INIT_SPEED);
  const [timer, setTimer] = useState(0);
  const [timeBoostActive, setTimeBoostActive] = useState(false);
  const [timeBoostEnd, setTimeBoostEnd] = useState<number | null>(null);

  const { placeItems } = useBoardItems();
  const { changeDir, isCollision } = useSnakeMovement(snake, dir, setDir);

  // Place items only on game start or restart
  useEffect(() => {
    if (gameStarted && !showCountdownModal) {
      const { fruits, bombs, hearts, booster } = placeItems(snake);
      setFruits(fruits);
      setBombs(bombs);
      setHearts(hearts);
      setTimeBooster(booster);
    }
  }, [gameStarted, showCountdownModal, placeItems]);

  // Timer effect
  useTimer(!isGameOver && !showCountdownModal && nameEntered, () => {
    setTimer(t => {
      // Boost speed every 30 seconds
      if ((t + 1) % 30 === 0) {
        setSpeed(s => Math.max(50, s - 30));
      }
      return t + 1;
    });
    if (timeBoostActive && timeBoostEnd && Date.now() > timeBoostEnd) {
      setTimeBoostActive(false);
      setSpeed(s => Math.min(INIT_SPEED, s + 50));
    }
  }, 1000);

  // Movement effect
  useEffect(() => {
    if (!isGameOver && !showCountdownModal && nameEntered) {
      const moveInt = setInterval(moveSnake, speed);
      return () => clearInterval(moveInt);
    }
  }, [snake, dir, isGameOver, speed, showCountdownModal, nameEntered]);

  const moveSnake = useCallback(() => {
    if (showCountdownModal) return;
    const newHead = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y,
    };

    if (isCollision(newHead)) {
      if (lives > 1) {
        setLives(lives - 1);
        setDir({ x: 1, y: 0 });
        const newSnake = (() => {
          const offset = snake.length - 2;
          const base = randomSnake();
          if (offset > 0) {
            const tail = base[base.length - 1];
            for (let i = 0; i < offset; i++) base.push({ ...tail });
          }
          return base;
        })();
        const { fruits, bombs, hearts, booster } = placeItems(newSnake);
        setSnake(newSnake);
        setFruits(fruits);
        setBombs(bombs);
        setHearts(hearts);
        setTimeBooster(booster);
        setSpeed(prev => Math.max(50, prev - 20));
      } else {
        setIsGameOver(true);
        setLives(0);
      }
      return;
    }

    let ateFruitIdx = fruits.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    let ateBombIdx = bombs.findIndex(b => b.x === newHead.x && b.y === newHead.y);
    let ateHeartIdx = hearts.findIndex(h => h.x === newHead.x && h.y === newHead.y);
    let ateTimeBooster = newHead.x === timeBooster.x && newHead.y === timeBooster.y;

    let newSnake = [newHead, ...snake];

    if (ateFruitIdx !== -1) {
      setFruits(fruits.map((f, i) => (i === ateFruitIdx ? placeItems(newSnake).fruits[0] : f)));
      if (((snake.length - 1) % 3) === 0) setSpeed(s => Math.max(50, s - 20));
    } else {
      newSnake.pop();
    }

    if (ateBombIdx !== -1) {
      setLives(l => Math.max(0, l - 1));
      setSpeed(s => Math.max(50, s - 30));
      setBombs(bombs.map((b, i) => (i === ateBombIdx ? placeItems(newSnake).bombs[0] : b)));
      if (lives - 1 <= 0) {
        setIsGameOver(true);
        setLives(0);
        return;
      }
    }

    if (ateHeartIdx !== -1) {
      setLives(l => l + 1);
      setHearts(hearts.map((h, i) => (i === ateHeartIdx ? placeItems(newSnake).hearts[0] : h)));
    }

    if (ateTimeBooster) {
      setTimeBoostActive(true);
      setTimeBoostEnd(Date.now() + TIME_BOOST_DURATION * 1000);
      setSpeed(s => Math.max(30, s - 70));
      setTimeBooster(placeItems(newSnake).booster);
    }

    setSnake(newSnake);
  }, [
    showCountdownModal, snake, dir, isCollision, lives,
    fruits, bombs, hearts, timeBooster, timeBoostActive, timeBoostEnd, placeItems
  ]);

  const restart = useCallback(() => {
    const newSnake = randomSnake();
    const { fruits, bombs, hearts, booster } = placeItems(newSnake);
    setSnake(newSnake);
    setDir({ x: 1, y: 0 });
    setFruits(fruits);
    setBombs(bombs);
    setHearts(hearts);
    setTimeBooster(booster);
    setIsGameOver(false);
    setLives(INIT_LIVES);
    setSpeed(INIT_SPEED);
    setTimer(0);
    setTimeBoostActive(false);
    setTimeBoostEnd(null);
  }, [placeItems]);

  return {
    snake,
    fruits,
    bombs,
    hearts,
    timeBooster,
    dir,
    isGameOver,
    lives,
    speed,
    timer,
    timeBoostActive,
    changeDir,
    restart,
    setDir,
    setSnake,
    setFruits,
    setBombs,
    setHearts,
    setTimeBooster,
    setIsGameOver,
    setLives,
    setSpeed,
    setTimer,
    setTimeBoostActive,
    setTimeBoostEnd,
  };
}