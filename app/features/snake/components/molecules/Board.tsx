import React from 'react';
import { View } from 'react-native';
import { GRID_SIZE } from '../../../../constants/gameConstants';
import { styles } from '../../snakeStyles';
import Cell from '../atoms/Cell';

type Position = { x: number; y: number };

type BoardProps = {
  snake: Position[];
  fruits: Position[];
  bombs: Position[];
  hearts: Position[];
  timeBooster: Position;
  onCellPress: (e: any) => void; // TODO: fix type
};

export default function Board({ snake, fruits, bombs, hearts, timeBooster, onCellPress }: BoardProps) {
  return (
    <View style={styles.board} onStartShouldSetResponder={() => true} onResponderRelease={onCellPress}>
      {[...Array(GRID_SIZE)].map((_, y) => (
        <View key={y} style={styles.row}>
          {[...Array(GRID_SIZE)].map((_, x) => (
            <Cell
              key={x}
              isSnake={snake.some(seg => seg.x === x && seg.y === y)}
              isFruit={fruits.some(f => f.x === x && f.y === y)}
              isBomb={bombs.some(b => b.x === x && b.y === y)}
              isHeart={hearts.some(h => h.x === x && h.y === y)}
              isTimeBooster={timeBooster.x === x && timeBooster.y === y}
            />
          ))}
        </View>
      ))}
    </View>
  );
}