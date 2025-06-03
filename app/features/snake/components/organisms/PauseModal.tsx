import React from 'react';
import { Modal, Text, View } from 'react-native';
import { styles } from '../../snakeStyles';

export default function PauseModal({ visible, timer }) {
  return (
    <Modal transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.pauseText}>Game starts in</Text>
          <Text style={styles.pauseTimer}>{timer}</Text>
        </View>
      </View>
    </Modal>
  );
}