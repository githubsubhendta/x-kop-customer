import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  Button,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For delete icon
import { SvgXml } from 'react-native-svg';
import { SVG_arrow_back } from '../utils/SVGImage';
import MessageInput from '../Components/MessageInput';
import { useWebSocket } from '../shared/WebSocketProvider';
import useUserStore from '../stores/user.store';

const ChatScreen = ({ route, navigation }) => {
  const { webSocket } = useWebSocket();
  const { user, handleUpdateUser } = useUserStore();
  const [openMenu, setOpenMenu] = useState(false);
  const { chats } = route.params;
  const [allMessages, setAllMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]); // Track selected messages
  const [editingMessage, setEditingMessage] = useState(null); // Track message being edited
  const [editContent, setEditContent] = useState(''); // Track new content for editing
  const flatListRef = useRef(null);

  useEffect(() => {
    if (chats?.messages) {
      setAllMessages(chats.messages);
    }
  }, [chats]);

  useEffect(() => {
    if (flatListRef.current && allMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [allMessages]);

  const officer = chats?.participants?.find(participant => participant?.officerDetails) || {};

  const toggleMessageSelection = useCallback(
    messageId => {
      setSelectedMessages(prevSelected => {
        if (prevSelected.includes(messageId)) {
          return prevSelected.filter(id => id !== messageId); // Deselect message
        } else {
          return [...prevSelected, messageId]; // Select message
        }
      });
    },
    [],
  );

  const handleEditMessage = useCallback(
    messageId => {
      const messageToEdit = allMessages.find(msg => msg._id === messageId);
      if (messageToEdit) {
        setEditContent(messageToEdit.content);
        setEditingMessage(messageId);
      }
    },
    [allMessages],
  );

  const handleUpdateMessage = useCallback(() => {
    if (editingMessage && editContent.trim()) {
      if (webSocket) {
        webSocket.emit('updatemessage', { messageId: editingMessage, newContent: editContent });
      }
      setEditingMessage(null);
      setEditContent('');
    }
  }, [webSocket, editingMessage, editContent]);

  const renderMessage = useCallback(
    ({ item }) => {
      const isSelected = selectedMessages.includes(item._id);
      return (
        <TouchableOpacity
          onLongPress={() => toggleMessageSelection(item._id)}
          onPress={() => !editingMessage && handleEditMessage(item._id)} // Trigger edit on click
          style={[
            styles.messageContainer,
            item.sender === user._id ? styles.currentUserMessage : styles.otherUserMessage,
            isSelected && styles.selectedMessage, // Highlight selected messages
          ]}
        >
          <Text style={styles.content}>{item.content}</Text>
          <Text style={styles.timeStamp}>
            {new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}{' '}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedMessages, user._id, editingMessage],
  );

  const handleScroll = useCallback(
    event => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

      if (isCloseToBottom) {
        const lastMessage = allMessages[allMessages.length - 1];
        if (lastMessage && !lastMessage.read && lastMessage.sender !== user._id) {
          markMessageAsRead(lastMessage._id);
        }
      }
    },
    [allMessages, user._id],
  );

  const markMessageAsRead = useCallback(
    messageId => {
      if (webSocket) {
        webSocket.emit('sendmessage', { messageId });
      }
    },
    [webSocket],
  );

  const deleteMessages = useCallback(() => {
    if (selectedMessages.length === 0) return;

    Alert.alert(
      'Delete Messages',
      'Are you sure you want to delete the selected message(s)?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            setAllMessages(prevMessages =>
              prevMessages.filter(msg => !selectedMessages.includes(msg._id)),
            );
            setSelectedMessages([]);

            const updatedChats = user.chats.map(chat => {
              if (chat._id === chats._id) {
                return {
                  ...chat,
                  messages: chat.messages.filter(msg => !selectedMessages.includes(msg._id)),
                };
              }
              return chat;
            });
            handleUpdateUser({
              ...user,
              chats: updatedChats,
            });

            // Send delete event to server
            if (webSocket) {
              webSocket.emit('deletemessages', { messageIds: selectedMessages });
            }
          },
          style: 'destructive',
        },
      ],
    );
  }, [selectedMessages, webSocket, user, chats._id, handleUpdateUser]);

  useEffect(() => {
    const handleMessage = data => {
      // Update the messages in the chat for the current user
      const updatedChats = user.chats.map(chat => {
        if (chat._id === chats._id) {
          return {
            ...chat,
            messages: [...chat.messages, data.message],
          };
        }
        return chat;
      });

      handleUpdateUser({
        ...user,
        chats: updatedChats,
      });

      setAllMessages(prevMessages => [...prevMessages, data.message]);
    };

    const handleMessageUpdate = updatedMessage => {
      const updatedChats = user.chats.map(chat => {
        if (chat._id === chats._id) {
          return {
            ...chat,
            messages: chat.messages.map(msg =>
              msg._id === updatedMessage.message._id ? updatedMessage.message : msg
            ),
          };
        }
        return chat;
      });

      handleUpdateUser({
        ...user,
        chats: updatedChats,
      });

      setAllMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === updatedMessage.message._id ? updatedMessage.message : msg
        )
      );
    };

    const handleMessageDeletion = ({ messageIds }) => {
      const updatedChats = user.chats.map(chat => {
        if (chat._id === chats._id) {
          return {
            ...chat,
            messages: chat.messages.filter(msg => !messageIds.includes(msg._id)),
          };
        }
        return chat;
      });

      handleUpdateUser({
        ...user,
        chats: updatedChats,
      });

      setAllMessages(prevMessages =>
        prevMessages.filter(msg => !messageIds.includes(msg._id))
      );
    };

    if (webSocket) {
      webSocket.on('receiveMessage', handleMessage);
      webSocket.on('messageUpdated', handleMessageUpdate);
      webSocket.on('messageDeleted', handleMessageDeletion);
    }

    return () => {
      if (webSocket) {
        webSocket.off('receiveMessage', handleMessage);
        webSocket.off('messageUpdated', handleMessageUpdate);
        webSocket.off('messageDeleted', handleMessageDeletion);
      }
    };
  }, [webSocket, user, chats._id, handleUpdateUser]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: officer?.avatar || 'default_avatar_url' }}
              style={styles.avatar}
            />
          </View>
          <View>
            <Text style={styles.userName}>{officer?.name || 'Officer'}</Text>
            <Text style={styles.userPosition}>
              {officer?.position || 'Position'}
            </Text>
          </View>
        </View>

        {selectedMessages.length > 0 ? (
          <TouchableOpacity onPress={deleteMessages}>
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setOpenMenu(!openMenu)}>
            <Icon2
              name="dots-three-vertical"
              color="#000"
              size={20}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {openMenu && (
        <View style={styles.menu}>
          <Text style={styles.menuItem}>Menu Item 1</Text>
          <Text style={styles.menuItem}>Menu Item 2</Text>
        </View>
      )}

      <View style={styles.chatArea}>
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={item => item._id || item.id || Math.random().toString()}
          renderItem={renderMessage}
          onScroll={handleScroll}
        />
      </View>

      <View style={styles.messageInput}>
        {user?._id && officer?._id && !editingMessage && (
          <MessageInput
            sender={{ id: user._id, mobile: user.mobile }}
            receiver={{ id: officer._id, mobile: officer.mobile }}
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
            <Button title="Cancel" onPress={() => {
              setEditingMessage(null);
              setEditContent('');
            }} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 32,
    height: 32,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    height: 32,
    width: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  avatar: {
    height: '100%',
    width: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userPosition: {
    fontSize: 14,
    color: '#555',
  },
  menuIcon: {
    padding: 8,
  },
  menu: {
    position: 'absolute',
    top: 64,
    right: 16,
    zIndex: 99,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    color: '#000',
    paddingVertical: 8,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
  },
  messageInput: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
  },
  messageContainer: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    maxWidth: '80%',
  },
  currentUserMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    backgroundColor: '#f2f2f2',
    alignSelf: 'flex-start',
  },
  selectedMessage: {
    backgroundColor: '#FFD700',
  },
  content: {
    fontSize: 16,
    color: 'black',
  },
  timeStamp: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
    textAlign: 'right',
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

export default ChatScreen;
