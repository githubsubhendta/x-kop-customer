import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';

const AlertModal = ({ visible, message, onClose, buttonText = "OK", buttonStyle, buttonTextStyle, modalStyle, messageStyle }) => {
  const handleButtonPress = () => {
    Vibration.vibrate(10); // Add haptic feedback
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, modalStyle]}>
          <Text style={[styles.modalMessage, messageStyle]} accessibilityRole="text">
            {message}
          </Text>
          <TouchableOpacity 
            onPress={handleButtonPress} 
            style={[styles.modalButton, buttonStyle]}
            accessibilityRole="button"
            accessibilityLabel={buttonText}
          >
            <Text style={[styles.modalButtonText, buttonTextStyle]}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#7f1d1d',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
export default AlertModal;