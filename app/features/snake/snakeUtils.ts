import { GRID_SIZE } from '../../constants/gameConstants';
import { Coordinates } from './snakeTypes';

export const randomPos = (): Coordinates => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

export const randomSafePos = (): Coordinates => ({
  x: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2,
  y: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2,
});

export const randomSnake = (): Coordinates[] => {
  const isHorizontal = Math.random() < 0.5;
  const head = randomSafePos();
  let tail;
  if (isHorizontal) {
    tail = { x: head.x - 1, y: head.y };
  } else {
    tail = { x: head.x, y: head.y - 1 };
  }
  return [head, tail];
};

export const getUniqueRandomPos = (occupied: Coordinates[]): Coordinates => {
  let pos: Coordinates;
  do {
    pos = randomPos();
  } while (occupied.some(o => o.x === pos.x && o.y === pos.y));
  return pos;
};