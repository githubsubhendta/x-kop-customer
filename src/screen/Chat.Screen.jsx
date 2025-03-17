import React, {useEffect, useRef, useState, useCallback, memo} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatHeader from '../Components/chat/ChatHeader';
import ChatMessageInput from '../Components/chat/ChatMessageInput';
import ChatArea from '../Components/chat/ChatArea';
import {useWebSocket} from '../shared/WebSocketProvider';
import useUserStore from '../stores/user.store';
import {getAllConversations, usePaginatedChats} from '../Api/chatService.js';
import useChatStore from '../stores/chat.store.js';
import {SvgXml} from 'react-native-svg';
import Video from 'react-native-video';
import {SVG_download, SVG_PDF} from '../utils/SVGImage.js';
import RNFS from 'rn-fetch-blob';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import CustomModal from '../Components/CustomModal.jsx';

const Message = ({item, user, onLongPress, onPress, selectedMessages}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileExists, setFileExists] = useState(false);

  const isFileExist = async fileUrl => {
    const {fs} = RNFS;
    const downloadDir =
      Platform.OS === 'android' && fs.dirs.DownloadDir
        ? fs.dirs.DownloadDir
        : fs.dirs.DocumentDir;
    const fileName = fileUrl.split('/').pop();
    const filePath = `${downloadDir}/${fileName}`;
    const exists = await fs.exists(filePath);
    return exists;
  };

  useEffect(() => {
    const checkFileExistence = async () => {
      const exists = await isFileExist(item.content);
      setFileExists(exists);
    };
    checkFileExistence();
  }, [item.content]);
  // const downloadFiles = async fileUrl => {
  //   try {
  //     setDownloading(true);
  //     setProgress(0);
  //     const {config, fs} = RNFS;

  //     const downloadDir =
  //       Platform.OS === 'android' && fs.dirs.DownloadDir
  //         ? fs.dirs.DownloadDir
  //         : fs.dirs.DocumentDir;
  //     const fileName = fileUrl.split('/').pop();
  //     const filePath = `${downloadDir}/${fileName}`;
  //     const dirExists = await fs.exists(downloadDir);
  //     if (!dirExists) {
  //       Alert.alert(
  //         'Error',
  //         `The download directory ${downloadDir} does not exist.`,
  //       );
  //       return;
  //     }
  //     const fileExists = await fs.exists(filePath);
  //     if (fileExists) {
  //       Alert.alert('File Exists', `The file "${fileName}" already exists.`);
  //       return;
  //     }
  //     const task = config({path: filePath, fileCache: true}).fetch(
  //       'GET',
  //       fileUrl,
  //     );
  //     task.progress(({bytesWritten, contentLength}) => {
  //       if (contentLength > 0) {
  //         const progressPercentage = (bytesWritten / contentLength) * 100;
  //         setProgress(progressPercentage);
  //         console.log(`Download progress: ${progressPercentage.toFixed(2)}%`);
  //       } else {
  //         console.log(
  //           'Download progress: Unknown (contentLength not available)',
  //         );
  //       }
  //     });
  //     const result = await task;
  //     if (result?.respInfo?.status === 200) {
  //       Alert.alert('Download Complete', `File downloaded to: ${filePath}`);
  //       console.log('Download successful:', filePath);
  //     } else {
  //       Alert.alert(
  //         'Download Failed',
  //         `Failed with status code: ${result?.respInfo?.status || 'unknown'}`,
  //       );
  //       console.error('Download failed with status:', result?.respInfo?.status);
  //     }
  //   } catch (error) {
  //     console.error('Download error:', error);
  //     Alert.alert('Download Error', 'An error occurred while downloading.');
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  const downloadFiles = async fileUrl => {
    try {
      setDownloading(true);
      setProgress(0);
      const {config, fs} = RNFS;

      const downloadDir =
        Platform.OS === 'android' && fs.dirs.DownloadDir
          ? fs.dirs.DownloadDir
          : fs.dirs.DocumentDir;
      const fileName = fileUrl.split('/').pop();
      const filePath = `${downloadDir}/${fileName}`;

      const task = config({path: filePath, fileCache: true}).fetch(
        'GET',
        fileUrl,
      );

      task.progress(({bytesWritten, contentLength}) => {
        if (contentLength > 0) {
          setProgress((bytesWritten / contentLength) * 100);
        }
      });

      const result = await task;

      if (result?.respInfo?.status === 200) {
        Alert.alert('Download Complete', `File downloaded to: ${filePath}`);
        setFileExists(true);
      } else {
        Alert.alert(
          'Download Failed',
          `Failed with status code: ${result?.respInfo?.status || 'unknown'}`,
        );
      }
    } catch (error) {
      Alert.alert('Download Error', 'An error occurred while downloading.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onLongPress={onLongPress}
        onPress={onPress}
        style={[
          styles.messageContainer,
          item.sender === user._id
            ? styles.currentUserMessage
            : styles.otherUserMessage,
          selectedMessages.includes(item._id) > 0 && styles.selectedMessage,
        ]}>
        {item.type === 'text' && (
          <Text style={styles.content}>{item.content}</Text>
        )}
        {item.type === 'image' && item.content && (
          <View style={styles.image}>
            <TouchableOpacity onPress={() => item.openImageModal(item.content)}>
              <Image source={{uri: item.content}} style={styles.image} />
            </TouchableOpacity>
            {!fileExists && item.sender !== user._id && (
              <View className="absolute right-0 -bottom-7 w-8 h-7">
                {downloading ? (
                  <AnimatedCircularProgress
                    size={40}
                    width={4}
                    fill={progress}
                    tintColor="#4F46E5"
                    backgroundColor="#E5E7EB"
                    lineCap="round">
                    {fill => (
                      <Text className="text-xs font-bold text-gray-700">
                        {Math.round(progress)}%
                      </Text>
                    )}
                  </AnimatedCircularProgress>
                ) : (
                  <SvgXml
                    onPress={() => downloadFiles(item.content)}
                    xml={SVG_download}
                    height={'100%'}
                    width={'100%'}
                  />
                )}
              </View>
            )}
          </View>
        )}
        {item.type === 'video' && (
          <View style={styles.videoContainer}>
            <TouchableOpacity
              onPress={() => item.openVideoModal(item.content)}
              style={styles.videoContainer}>
              <Icon
                name="play-circle-outline"
                size={40}
                color="white"
                style={styles.playIcon}
              />
            </TouchableOpacity>
            {!fileExists && item.sender !== user._id && (
              <View className="absolute right-0 -bottom-7 w-8 h-7">
                {downloading ? (
                  <AnimatedCircularProgress
                    size={40}
                    width={4}
                    fill={progress}
                    tintColor="#4F46E5"
                    backgroundColor="#E5E7EB"
                    lineCap="round">
                    {fill => (
                      <Text className="text-xs font-bold text-gray-700">
                        {Math.round(progress)}%
                      </Text>
                    )}
                  </AnimatedCircularProgress>
                ) : (
                  <SvgXml
                    onPress={() => downloadFiles(item.content)}
                    xml={SVG_download}
                    height={'100%'}
                    width={'100%'}
                  />
                )}
              </View>
            )}
          </View>
        )}
        {item.type === 'file' && (
          <View style={styles.backButton1}>
            <TouchableOpacity style={styles.backButton}>
              <SvgXml xml={SVG_PDF} height={'100%'} width={'100%'} />
            </TouchableOpacity>
            {!fileExists && item.sender !== user._id && (
              <View className="absolute right-0 -bottom-7 w-8 h-7">
                {downloading ? (
                  <AnimatedCircularProgress
                    size={40}
                    width={4}
                    fill={progress}
                    tintColor="#4F46E5"
                    backgroundColor="#E5E7EB"
                    lineCap="round">
                    {fill => (
                      <Text className="text-xs font-bold text-gray-700">
                        {Math.round(progress)}%
                      </Text>
                    )}
                  </AnimatedCircularProgress>
                ) : (
                  <SvgXml
                    onPress={() => downloadFiles(item.content)}
                    xml={SVG_download}
                    height={'100%'}
                    width={'100%'}
                  />
                )}
              </View>
            )}
          </View>
        )}
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
    </View>
  );
};

const ChatScreen = ({route, navigation}) => {
  const {webSocket} = useWebSocket();
  const {user} = useUserStore();
  const {chatId, chats} = route.params;
  const [openMenu, setOpenMenu] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const flatListRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);
  const {conversations, setConversations} = useChatStore();
  const [downloadedMedia, setDownloadedMedia] = useState({});
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const showEditButton = selectedMessages.length === 1;
  const officer =
    chats?.participants?.find(participant => participant?.officerDetails) || {};

  useEffect(() => {
    if (conversations.length) {
      const currentConversation = conversations.find(
        convo => convo.conversationId === chatId,
      );
      if (currentConversation) {
        setAllMessages(
          currentConversation.messages.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      }
    }
  }, [conversations, chatId, setConversations]);

  const handleUpdateMessage = useCallback(() => {
    if (editingMessage && editContent.trim()) {
      if (webSocket) {
        webSocket.emit('updatemessage', {
          messageId: editingMessage,
          newContent: editContent,
          reciever: {id: officer._id, mobile: officer.mobile},
        });
      }
      setSelectedMessages([]);
      setEditingMessage(null);
      setEditContent('');
    }
  }, [webSocket, editingMessage, editContent]);

  const toggleMessageSelection = messageId => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId],
    );
  };

  const openImageModal = async imageUri => {
    if (!downloadedMedia[imageUri]) {
      await downloadMedia(imageUri);
      setDownloadedMedia(prev => ({...prev, [imageUri]: true}));
    }
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const openVideoModal = async videoUri => {
    if (!downloadedMedia[videoUri]) {
      await downloadMedia(videoUri);
      setDownloadedMedia(prev => ({...prev, [videoUri]: true}));
    }
    setSelectedVideo(videoUri);
    setVideoModalVisible(true);
  };

  const downloadMedia = async uri => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const {loading, hasMoreChats, loadMoreChats} = usePaginatedChats(chatId);

  const onLoadMore = () => {
    if (!loading && hasMoreChats) {
      loadMoreChats();
    }
  };

  const updateNewMessageStore = newMessage => {
    const updatedConversations = conversations.map(convo => {
      if (convo.conversationId === chatId) {
        return {
          ...convo,
          messages: newMessage,
        };
      }
      return convo;
    });
    setConversations(updatedConversations);
  };

  useEffect(() => {
    (async () => {
      const getInitial = await getAllConversations(chatId);
      if (conversations.length === 0) {
        setConversations([
          {conversationId: chatId, messages: getInitial.messages},
        ]);
      } else {
        const currentConversation = conversations.find(
          convo => convo.conversationId === chatId,
        );
        if (currentConversation) {
          updateNewMessageStore(getInitial.messages);
        } else {
          setConversations([
            ...conversations,
            {conversationId: chatId, messages: getInitial.messages},
          ]);
        }
      }
    })();
  }, []);

  const deleteMessages = useCallback(() => {
    if (selectedMessages.length === 0) return;
    setIsDeleteVisible(true);
  }, [selectedMessages]);

  const confirmDelete = () => {
    setIsDeleteVisible(false);
    setSelectedMessages([]);
    if (webSocket) {
      webSocket.emit('deletemessages', {
        messageIds: selectedMessages,
        reciever: {id: officer._id, mobile: officer.mobile},
      });
    }
  };

  // const deleteMessages = useCallback(() => {
  //   if (selectedMessages.length === 0) return;
  //   Alert.alert(
  //     'Delete Messages',
  //     'Are you sure you want to delete the selected message(s)?',
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Delete',
  //         onPress: () => {
  //           setSelectedMessages([]);
  //           if (webSocket) {
  //             webSocket.emit('deletemessages', {
  //               messageIds: selectedMessages,
  //               reciever: {id: officer._id, mobile: officer.mobile},
  //             });
  //           }
  //         },
  //         style: 'destructive',
  //       },
  //     ],
  //   );
  // }, [selectedMessages, webSocket, user]);

  const filterMessageType = messageId => {
    const filterType = allMessages.find(msg => msg._id === messageId);
    return filterType.type;
  };

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

  return (
    <View style={styles.container}>
      <ChatHeader
        officer={officer}
        chats={chats}
        selectedMessages={selectedMessages}
        filterMessageType={filterMessageType}
        handleEditMessage={handleEditMessage}
        deleteMessages={deleteMessages}
        showEditButton={showEditButton}
        setOpenMenu={setOpenMenu}
        openMenu={openMenu}
        navigation={navigation}
      />

      <CustomModal
        isVisible={isDeleteVisible}
        message="Are you sure you want to delete the selected message(s)?"
        onClose={() => setIsDeleteVisible(false)}
        buttons={[
          {
            label: 'Cancel',
            onPress: () => {
              setIsDeleteVisible(false);
              setSelectedMessages([]);
            },
            color: '#999',
          },
          {label: 'Delete', onPress: confirmDelete, color: '#D22B2B'},
        ]}
      />

      <ChatArea
        flatListRef={flatListRef}
        allMessages={allMessages.map(message => ({
          ...message,
          openImageModal,
          openVideoModal,
        }))}
        renderMessage={({item}) => (
          <Message
            item={item}
            user={user}
            onLongPress={() =>
              item.sender != officer._id && toggleMessageSelection(item._id)
            }
            onPress={() => {
              return (
                item.sender != officer._id &&
                selectedMessages.length > 0 &&
                toggleMessageSelection(item._id)
              );
            }}
            selectedMessages={selectedMessages}
          />
        )}
        loading={loading}
        onLoadMore={onLoadMore}
      />
      <ChatMessageInput
        user={user}
        officer={officer}
        editingMessage={editingMessage}
        editContent={editContent}
        setEditContent={setEditContent}
        handleUpdateMessage={handleUpdateMessage}
        setEditingMessage={setEditingMessage}
        setSelectedMessages={setSelectedMessages}
      />

      <Modal visible={isModalVisible} transparent={true}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
            <Image source={{uri: selectedImage}} style={styles.modalImage} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal visible={isVideoModalVisible} transparent={true}>
        <TouchableWithoutFeedback onPress={() => setVideoModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVideoModalVisible(false)}>
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
            <Video
              source={{uri: selectedVideo}}
              style={styles.videoPlayer}
              controls
              resizeMode="contain"
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    marginHorizontal: 3,
    padding: 5,
    borderRadius: 10,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  progressContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -20}, {translateY: -20}],
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 8,
    color: '#000',
  },
  currentUserMessage: {
    backgroundColor: '#e1ffc7',
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 8,
    paddingLeft: 10,
    marginVertical: 5,
  },
  otherUserMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 8,
    paddingLeft: 10,
    marginVertical: 5,
  },
  selectedMessage: {
    borderColor: '#228B22',
    borderWidth: 2,
  },
  content: {
    fontSize: 16,
    color: 'black',
  },
  image: {
    position: 'relative',
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  videoContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  playIcon: {
    position: 'absolute',
  },
  timeStamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalImage: {
    width: '100%',
    height: '90%',
    borderRadius: 10,
  },
  videoPlayer: {
    width: '100%',
    height: '90%',
  },
  backButton: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  backButton1: {
    position: 'relative',
    justifyContent: 'between',
    items: 'center',
  },
});

export default ChatScreen;

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
//   TouchableWithoutFeedback,
//   Keyboard,
// } from 'react-native';
// import React, {useEffect, useRef, useState, useCallback} from 'react';
// import Icon2 from 'react-native-vector-icons/Entypo';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {SvgXml} from 'react-native-svg';
// import {SVG_arrow_back, SVG_PDF} from '../utils/SVGImage';
// import MessageInput from '../Components/MessageInput';
// import {useWebSocket} from '../shared/WebSocketProvider';
// import useUserStore from '../stores/user.store';
// import Video from 'react-native-video';
// import { Modal } from 'react-native';

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

//   const [isModalVisible, setModalVisible] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [isVideoModalVisible, setVideoModalVisible] = useState(false);

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
//       setSelectedMessages([]);
//       setEditingMessage(null);
//       setEditContent('');
//     }
//   }, [webSocket, editingMessage, editContent]);

//   const openImageModal = (imageUrl) => {
//     setSelectedImage(imageUrl);
//     setModalVisible(true);
//   };

//   const closeImageModal = () => {
//     setSelectedImage(null);
//     setModalVisible(false);
//   };

//   const openVideoModal = (videoUrl) => {
//     setSelectedVideo(videoUrl);
//     setVideoModalVisible(true);
//   };

//   const closeVideoModal = () => {
//     setSelectedVideo(null);
//     setVideoModalVisible(false);
//   };

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
//           style={[
//             styles.messageContainer,
//             item.sender === user._id
//               ? styles.currentUserMessage
//               : styles.otherUserMessage,
//             isSelected && styles.selectedMessage,
//           ]}
//           >
//           {item.type === 'text' && (
//             <Text style={styles.content}>{item.content}</Text>
//           )}

//           {item.type === 'image' && item.content && (
//             <TouchableOpacity onPress={() => openImageModal(item.content)}>
//               <Image source={{uri: item.content}} style={styles.image} />
//             </TouchableOpacity>
//           )}

//           {item.type === 'video' && (
//             <TouchableOpacity onPress={() => openVideoModal(item.content)} className="bg-black w-[200px] h-[200px]">
//               <Icon name="play-circle-outline" size={40} color="white" style={styles.playIcon} />
//             </TouchableOpacity>
//           )}

//           {item.type === 'file' && (
//             <TouchableOpacity style={styles.backButton}>
//               <SvgXml xml={SVG_PDF} height={'100%'} width={'100%'} />
//             </TouchableOpacity>
//           )}

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
//         webSocket.emit('readmessage', {messageId});
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

//   const handleOutsidePress = () => {
//     if (selectedMessages.length > 0) {
//       setSelectedMessages([]);
//     }
//   };

//   const showEditButton = selectedMessages.length === 1;

//   const filterMessageType = (messageId)=>{
//     const filterType = allMessages.find(msg => msg._id === messageId);

//     console.log(filterType);
//     return filterType.type;
//   }

//   return (
//     <TouchableWithoutFeedback onPress={handleOutsidePress}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}>
//             <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
//           </TouchableOpacity>

//           <View style={styles.userInfo}>
//             <View style={styles.avatarWrapper}>
//               <Image
//                 source={{uri: officer?.avatar || 'default_avatar_url'}}
//                 style={styles.avatar}
//               />
//             </View>
//             <View>
//               <Text style={styles.userName}>{officer?.name || 'Officer'}</Text>
//               <Text style={styles.userPosition}>
//                 {officer?.position || 'Position'}
//               </Text>
//             </View>
//           </View>

//           {selectedMessages.length > 0 && (
//             <View style={styles.headerButtons}>

//               {showEditButton && filterMessageType(selectedMessages[0])=="text" && (
//                 <TouchableOpacity onPress={() => handleEditMessage(selectedMessages[0])}>
//                   <Icon name="edit" size={24} color="blue" />
//                 </TouchableOpacity>
//               )}
//               <TouchableOpacity onPress={deleteMessages}>
//                 <Icon name="delete" size={24} color="red" />
//               </TouchableOpacity>
//             </View>
//           )}
//           {selectedMessages.length === 0 && (
//             <TouchableOpacity onPress={() => setOpenMenu(!openMenu)}>
//               <Icon2
//                 name="dots-three-vertical"
//                 color="#000"
//                 size={20}
//                 style={styles.menuIcon}
//               />
//             </TouchableOpacity>
//           )}
//         </View>

//         {openMenu && (
//           <View style={styles.menu}>
//             <Text style={styles.menuItem}>Menu Item 1</Text>
//             <Text style={styles.menuItem}>Menu Item 2</Text>
//           </View>
//         )}

//         <View style={styles.chatArea} className="pb-32">
//           <FlatList
//             ref={flatListRef}
//             data={allMessages}
//             keyExtractor={item => item._id || item.id || Math.random().toString()}
//             renderItem={renderMessage}
//             onScroll={handleScroll}
//             onContentSizeChange={() =>
//               flatListRef.current.scrollToEnd({animated: true})
//             } // Automatically scrolls when content size changes
//           />
//         </View>

//          {/* Modal for zooming images */}
//          <Modal visible={isModalVisible} transparent={true} onRequestClose={closeImageModal}>
//           <View style={styles.modalContainer}>

//               <Text>{console.log(selectedImage)}</Text>

//             <TouchableOpacity style={styles.closeModalButton} onPress={closeImageModal}>
//               <Text style={styles.closeModalText}>Close</Text>
//             </TouchableOpacity>
//             {
//               selectedImage && <Image source={{uri: selectedImage}} style={styles.modalImage} />
//             }

//           </View>
//         </Modal>

//         <Modal visible={isVideoModalVisible} transparent={true} onRequestClose={closeVideoModal}>
//           <View style={styles.modalContainer}>
//             <TouchableOpacity style={styles.closeModalButton} onPress={closeVideoModal}>
//               <Text style={styles.closeModalText}>Close</Text>
//             </TouchableOpacity>
//             <Video
//               source={{uri: selectedVideo}}
//               style={styles.videoPlayer}
//               controls={true}
//               resizeMode="contain"
//             />
//           </View>
//         </Modal>

//         <View style={styles.messageInput}>
//           {user?._id && officer?._id && !editingMessage && (
//             <MessageInput
//               sender={{id: user._id, mobile: user.mobile}}
//               receiver={{id: officer._id, mobile: officer.mobile}}
//               webSocket={webSocket}
//             />
//           )}
//           {editingMessage && (
//             <View style={styles.editContainer}>
//               <TextInput
//                 style={styles.editInput}
//                 value={editContent}
//                 onChangeText={setEditContent}
//                 placeholder="Edit your message..."
//               />
//               <Button title="Update" onPress={handleUpdateMessage} />
//               <Button
//                 title="Cancel"
//                 onPress={() => {
//                   setSelectedMessages([]);
//                   setEditingMessage(null);
//                   setEditContent('');

//                 }}
//               />
//             </View>
//           )}
//         </View>
//       </View>
//     </TouchableWithoutFeedback>
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
//     marginBottom:100,
//     paddingBottom:10
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
//   headerButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   image: {
//     width: 200,
//     height: 200,
//     resizeMode: 'cover',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   playIcon: {
//     position: 'absolute',
//     top: '40%',
//     left: '40%',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalImage: {
//     width: '90%',
//     height: '70%',
//     resizeMode: 'contain',
//   },
//   closeModalButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//   },
//   closeModalText: {
//     color: '#fff',
//     fontSize: 18,
//   },
//   videoPlayer: {
//     width: '100%',
//     height: '70%',
//   },
// });

// export default ChatScreen;
