import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../../snakeStyles';

type CellProps = {
  isSnake?: boolean;
  isFruit?: boolean;
  isBomb?: boolean;
  isHeart?: boolean;
  isTimeBooster?: boolean;
};

export default function Cell({ isSnake, isFruit, isBomb, isHeart, isTimeBooster }: CellProps) {
  return (
    <View
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
}