import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

function MessageInput({ sender, receiver, webSocket }) {
  const [message, setMessage] = useState('');

  const uploadFiles = async () => {
    // Logic for uploading files (if necessary) can go here
    // For example, you can open a file picker, then set the type to 'file' or similar.
  };

  const sendMessage = async (message, type = 'text') => {
    if (message.trim() !== "") {
      webSocket.emit('sendmessage', { sender, receiver, type, content: message });
      setMessage(""); 
    } else {
      Alert.alert("Please enter a message first.");
    }
  };

  const handleChat = (value) => {
    setMessage(value);
  };

  return (
    <View style={styles.InputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Start Typing Here"
        placeholderTextColor="#888"
        value={message} 
        onChangeText={handleChat} 
      />
      <View style={styles.iconsContainer}>
        {/* Attach File Button */}
        <TouchableOpacity style={styles.iconButton} onPress={uploadFiles}>
          <Icon name="attach-file" size={24} color="#888" />
        </TouchableOpacity>
        {/* Send Message Button */}
        <TouchableOpacity style={styles.iconButton} onPress={() => sendMessage(message)}>
          <Icon name="send" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  InputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 10,
  },
});

export default MessageInput;
