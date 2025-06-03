import { useCallback } from 'react';
import { GRID_SIZE } from '../../../constants/gameConstants';

interface Position {
    x: number;
    y: number;
}

type Snake = Position[];

type Direction = Position;

type SetDirection = (dir: Direction) => void;

export function useSnakeMovement(
    snake: Snake,
    dir: Direction,
    setDir: SetDirection
) {
    // Prevent reverse direction
    const changeDir = useCallback((x: number, y: number): void => {
        if ((dir.x !== 0 && x !== 0) || (dir.y !== 0 && y !== 0)) return;
        setDir({ x, y });
    }, [dir, setDir]);

    // Check collision with wall or self
    const isCollision = useCallback((head: Position): boolean => {
        return (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= GRID_SIZE ||
            head.y >= GRID_SIZE ||
            snake.some((seg: Position) => seg.x === head.x && seg.y === head.y)
        );
    }, [snake]);

    return { changeDir, isCollision };
}