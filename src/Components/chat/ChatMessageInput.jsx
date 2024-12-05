import React from 'react';
import {View, Button, TextInput, StyleSheet} from 'react-native';
import MessageInput from './MessageInput';
import {useWebSocket} from '../../shared/WebSocketProvider';

const ChatMessageInput = ({
  user,
  officer,
  editingMessage,
  editContent,
  setEditContent,
  handleUpdateMessage,
  setEditingMessage,
  setSelectedMessages,
}) => {
  const {webSocket} = useWebSocket();
  return (
    <View style={styles.messageInput}>
      {user?._id && officer?._id && !editingMessage && (
        <MessageInput
          sender={{id: user._id, mobile: user.mobile}}
          receiver={{id: officer._id, mobile: officer.mobile}}
          webSocket={webSocket}
        />
      )}
      {editingMessage && (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editContent}
            onChangeText={setEditContent}
            placeholder="Edit your message..."
          />
          <Button title="Update" onPress={handleUpdateMessage} />
          <Button
            title="Cancel"
            onPress={() => {
              setSelectedMessages([]);
              setEditingMessage(null);
              setEditContent('');
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageInput: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    // backgroundColor: '#fff',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    color: '#000',
  },
});

export default ChatMessageInput;
