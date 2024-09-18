// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   FlatList,
//   Alert,
//   TextInput,
//   Button,
// } from 'react-native';
// import React, {useEffect, useRef, useState, useCallback} from 'react';
// import Icon2 from 'react-native-vector-icons/Entypo';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // For delete icon
// import {SvgXml} from 'react-native-svg';
// import {SVG_arrow_back} from '../utils/SVGImage';
// import MessageInput from '../Components/MessageInput';
// import {useWebSocket} from '../shared/WebSocketProvider';
// import useUserStore from '../stores/user.store';

// const ChatScreen = ({route, navigation}) => {
//   const {webSocket} = useWebSocket();
//   const {user} = useUserStore();
//   const [openMenu, setOpenMenu] = useState(false);
//   const {chatId} = route.params;
//   const [allMessages, setAllMessages] = useState([]);
//   const [selectedMessages, setSelectedMessages] = useState([]);
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [editContent, setEditContent] = useState('');
//   const flatListRef = useRef(null);

//   const chats = user.chats.find(chat => chat._id == chatId);

//   useEffect(() => {
//     if (chats?.messages) {
//       setAllMessages(chats.messages);
//     }
//   }, [chatId, user]);

//   useEffect(() => {
//     if (flatListRef.current && allMessages.length > 0) {
//       flatListRef.current.scrollToEnd({animated: true});
//     }
//   }, [allMessages]);

//   const officer =
//     chats?.participants?.find(participant => participant?.officerDetails) || {};

//   const toggleMessageSelection = useCallback(messageId => {
//     setSelectedMessages(prevSelected => {
//       if (prevSelected.includes(messageId)) {
//         return prevSelected.filter(id => id !== messageId);
//       } else {
//         return [...prevSelected, messageId];
//       }
//     });
//   }, []);

//   const handleEditMessage = useCallback(
//     messageId => {
//       const messageToEdit = allMessages.find(msg => msg._id === messageId);
//       if (messageToEdit) {
//         setEditContent(messageToEdit.content);
//         setEditingMessage(messageId);
//       }
//     },
//     [allMessages],
//   );

//   const handleUpdateMessage = useCallback(() => {
//     if (editingMessage && editContent.trim()) {
//       if (webSocket) {
//         webSocket.emit('updatemessage', {
//           messageId: editingMessage,
//           newContent: editContent,
//           reciever: {id: officer._id, mobile: officer.mobile},
//         });
//       }
//       setEditingMessage(null);
//       setEditContent('');
//     }
//   }, [webSocket, editingMessage, editContent]);

//   const renderMessage = useCallback(
//     ({item}) => {
//       const isSelected = selectedMessages.includes(item._id);
//       return (
//         <TouchableOpacity
//           onLongPress={() =>
//             item.sender == user._id
//               ? toggleMessageSelection(item._id)
//               : () => {}
//           }
//           onPress={() => !editingMessage && handleEditMessage(item._id)}
//           style={[
//             styles.messageContainer,
//             item.sender === user._id
//               ? styles.currentUserMessage
//               : styles.otherUserMessage,
//             isSelected && styles.selectedMessage,
//           ]}>
//           <Text style={styles.content}>{item.content}</Text>
//           <Text style={styles.timeStamp}>
//             {new Date(item.createdAt).toLocaleDateString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//             })}{' '}
//             {new Date(item.createdAt).toLocaleTimeString([], {
//               hour: '2-digit',
//               minute: '2-digit',
//               hour12: true,
//             })}
//           </Text>
//         </TouchableOpacity>
//       );
//     },
//     [selectedMessages, user._id, editingMessage],
//   );

//   const handleScroll = useCallback(
//     event => {
//       const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
//       const isCloseToBottom =
//         layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

//       if (isCloseToBottom) {
//         const lastMessage = allMessages[allMessages.length - 1];
//         if (
//           lastMessage &&
//           !lastMessage.read &&
//           lastMessage.sender !== user._id
//         ) {
//           markMessageAsRead(lastMessage._id);
//         }
//       }
//     },
//     [allMessages, user._id],
//   );

//   const markMessageAsRead = useCallback(
//     messageId => {
//       if (webSocket) {
//         webSocket.emit('sendmessage', {messageId});
//       }
//     },
//     [webSocket],
//   );

//   const deleteMessages = useCallback(() => {
//     if (selectedMessages.length === 0) return;

//     Alert.alert(
//       'Delete Messages',
//       'Are you sure you want to delete the selected message(s)?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           onPress: () => {
//             setAllMessages(prevMessages =>
//               prevMessages.filter(msg => !selectedMessages.includes(msg._id)),
//             );
//             setSelectedMessages([]);

//             if (webSocket) {
//               webSocket.emit('deletemessages', {
//                 messageIds: selectedMessages,
//                 reciever: {id: officer._id, mobile: officer.mobile},
//               });
//             }
//           },
//           style: 'destructive',
//         },
//       ],
//     );
//   }, [selectedMessages, webSocket, user, chats._id]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}>
//           <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
//         </TouchableOpacity>

//         <View style={styles.userInfo}>
//           <View style={styles.avatarWrapper}>
//             <Image
//               source={{uri: officer?.avatar || 'default_avatar_url'}}
//               style={styles.avatar}
//             />
//           </View>
//           <View>
//             <Text style={styles.userName}>{officer?.name || 'Officer'}</Text>
//             <Text style={styles.userPosition}>
//               {officer?.position || 'Position'}
//             </Text>
//           </View>
//         </View>

//         {selectedMessages.length > 0 ? (
//           <TouchableOpacity onPress={deleteMessages}>
//             <Icon name="delete" size={24} color="red" />
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity onPress={() => setOpenMenu(!openMenu)}>
//             <Icon2
//               name="dots-three-vertical"
//               color="#000"
//               size={20}
//               style={styles.menuIcon}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       {openMenu && (
//         <View style={styles.menu}>
//           <Text style={styles.menuItem}>Menu Item 1</Text>
//           <Text style={styles.menuItem}>Menu Item 2</Text>
//         </View>
//       )}

//       <View style={styles.chatArea} className="pb-32">
//         <FlatList
//           ref={flatListRef}
//           data={allMessages}
//           keyExtractor={item => item._id || item.id || Math.random().toString()}
//           renderItem={renderMessage}
//           onScroll={handleScroll}
//           onContentSizeChange={() =>
//             flatListRef.current.scrollToEnd({animated: true})
//           } // Automatically scrolls when content size changes
//         />
//       </View>

//       <View style={styles.messageInput}>
//         {user?._id && officer?._id && !editingMessage && (
//           <MessageInput
//             sender={{id: user._id, mobile: user.mobile}}
//             receiver={{id: officer._id, mobile: officer.mobile}}
//             webSocket={webSocket}
//           />
//         )}
//         {editingMessage && (
//           <View style={styles.editContainer}>
//             <TextInput
//               style={styles.editInput}
//               value={editContent}
//               onChangeText={setEditContent}
//               placeholder="Edit your message..."
//             />
//             <Button title="Update" onPress={handleUpdateMessage} />
//             <Button
//               title="Cancel"
//               onPress={() => {
//                 setEditingMessage(null);
//                 setEditContent('');
//               }}
//             />
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: 'relative',
//     backgroundColor: '#f0f0f0',
//   },
//   header: {
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     width: 32,
//     height: 32,
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   avatarWrapper: {
//     height: 32,
//     width: 32,
//     borderRadius: 16,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#ccc',
//   },
//   avatar: {
//     height: '100%',
//     width: '100%',
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   userPosition: {
//     fontSize: 14,
//     color: '#555',
//   },
//   menuIcon: {
//     padding: 8,
//   },
//   menu: {
//     position: 'absolute',
//     top: 64,
//     right: 16,
//     zIndex: 99,
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   menuItem: {
//     color: '#000',
//     paddingVertical: 8,
//   },
//   chatArea: {
//     flex: 1,
//     paddingHorizontal: 16,
//     backgroundColor: '#f8f8f8',
//   },
//   messageInput: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   messageContainer: {
//     padding: 10,
//     marginBottom: 5,
//     borderRadius: 5,
//     maxWidth: '80%',
//   },
//   currentUserMessage: {
//     backgroundColor: '#DCF8C6',
//     alignSelf: 'flex-end',
//   },
//   otherUserMessage: {
//     backgroundColor: '#f2f2f2',
//     alignSelf: 'flex-start',
//   },
//   selectedMessage: {
//     backgroundColor: '#FFD700',
//   },
//   content: {
//     fontSize: 16,
//     color: 'black',
//   },
//   timeStamp: {
//     fontSize: 12,
//     color: 'gray',
//     marginTop: 5,
//     textAlign: 'right',
//   },
//   editContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   editInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 8,
//     color: '#000',
//   },
// });

// export default ChatScreen;


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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {useEffect, useRef, useState, useCallback} from 'react';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For delete icon
import {SvgXml} from 'react-native-svg';
import {SVG_arrow_back} from '../utils/SVGImage';
import MessageInput from '../Components/MessageInput';
import {useWebSocket} from '../shared/WebSocketProvider';
import useUserStore from '../stores/user.store';

const ChatScreen = ({route, navigation}) => {
  const {webSocket} = useWebSocket();
  const {user} = useUserStore();
  const [openMenu, setOpenMenu] = useState(false);
  const {chatId} = route.params;
  const [allMessages, setAllMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const flatListRef = useRef(null);

  const chats = user.chats.find(chat => chat._id == chatId);

  useEffect(() => {
    if (chats?.messages) {
      setAllMessages(chats.messages);
    }
  }, [chatId, user]);

  useEffect(() => {
    if (flatListRef.current && allMessages.length > 0) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [allMessages]);

  const officer =
    chats?.participants?.find(participant => participant?.officerDetails) || {};

  const toggleMessageSelection = useCallback(messageId => {
    setSelectedMessages(prevSelected => {
      if (prevSelected.includes(messageId)) {
        return prevSelected.filter(id => id !== messageId);
      } else {
        return [...prevSelected, messageId];
      }
    });
  }, []);

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
        webSocket.emit('updatemessage', {
          messageId: editingMessage,
          newContent: editContent,
          reciever: {id: officer._id, mobile: officer.mobile},
        });
      }
      setEditingMessage(null);
      setEditContent('');
    }
  }, [webSocket, editingMessage, editContent]);

  const renderMessage = useCallback(
    ({item}) => {
      const isSelected = selectedMessages.includes(item._id);
      return (
        <TouchableOpacity
          onLongPress={() =>
            item.sender == user._id
              ? toggleMessageSelection(item._id)
              : () => {}
          }
          onPress={() => !editingMessage && handleEditMessage(item._id)}
          style={[
            styles.messageContainer,
            item.sender === user._id
              ? styles.currentUserMessage
              : styles.otherUserMessage,
            isSelected && styles.selectedMessage,
          ]}>
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
      const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

      if (isCloseToBottom) {
        const lastMessage = allMessages[allMessages.length - 1];
        if (
          lastMessage &&
          !lastMessage.read &&
          lastMessage.sender !== user._id
        ) {
          markMessageAsRead(lastMessage._id);
        }
      }
    },
    [allMessages, user._id],
  );

  const markMessageAsRead = useCallback(
    messageId => {
      if (webSocket) {
        webSocket.emit('sendmessage', {messageId});
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

            if (webSocket) {
              webSocket.emit('deletemessages', {
                messageIds: selectedMessages,
                reciever: {id: officer._id, mobile: officer.mobile},
              });
            }
          },
          style: 'destructive',
        },
      ],
    );
  }, [selectedMessages, webSocket, user, chats._id]);

  const handleOutsidePress = () => {
    if (selectedMessages.length > 0) {
      setSelectedMessages([]);
    }
  };

  const showEditButton = selectedMessages.length === 1;

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{uri: officer?.avatar || 'default_avatar_url'}}
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

          {selectedMessages.length > 0 && (
            <View style={styles.headerButtons}>
              {showEditButton && (
                <TouchableOpacity onPress={() => handleEditMessage(selectedMessages[0])}>
                  <Icon name="edit" size={24} color="blue" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={deleteMessages}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          {selectedMessages.length === 0 && (
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

        <View style={styles.chatArea} className="pb-32">
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={item => item._id || item.id || Math.random().toString()}
            renderItem={renderMessage}
            onScroll={handleScroll}
            onContentSizeChange={() =>
              flatListRef.current.scrollToEnd({animated: true})
            } // Automatically scrolls when content size changes
          />
        </View>

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
                  setEditingMessage(null);
                  setEditContent('');
                }}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});

export default ChatScreen;




