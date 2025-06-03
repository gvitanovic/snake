import { useCallback } from 'react';
import {
    NUM_BOMBS, NUM_FRUITS, NUM_HEARTS
} from '../../../constants/gameConstants';
import { getUniqueRandomPos } from '../snakeUtils';

export function useBoardItems() {
interface Position {
    x: number;
    y: number;
}

interface BoardItems {
    fruits: Position[];
    bombs: Position[];
    hearts: Position[];
    booster: Position;
}

type Snake = Position[];

const placeItems = useCallback((snake: Snake): BoardItems => {
    const occupied: Position[] = [...snake];
    const fruits: Position[] = Array(NUM_FRUITS).fill(0).map(() => {
        const pos = getUniqueRandomPos(occupied);
        occupied.push(pos);
        return pos;
    });
    const bombs: Position[] = Array(NUM_BOMBS).fill(0).map(() => {
        const pos = getUniqueRandomPos(occupied);
        occupied.push(pos);
        return pos;
    });
    const hearts: Position[] = Array(NUM_HEARTS).fill(0).map(() => {
        const pos = getUniqueRandomPos(occupied);
        occupied.push(pos);
        return pos;
    });
    const booster: Position = getUniqueRandomPos(occupied);
    return { fruits, bombs, hearts, booster };
}, []);
  return { placeItems };
}