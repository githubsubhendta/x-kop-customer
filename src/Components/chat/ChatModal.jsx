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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatHeader from './ChatHeader';
import ChatMessageInput from './ChatMessageInput';
import ChatArea from './ChatArea';
import {useWebSocket} from '../../shared/WebSocketProvider';
import useUserStore from '../../stores/user.store';
import {getAllConversations, usePaginatedChats} from '../../Api/chatService.js';
import useChatStore from '../../stores/chat.store.js';
import {SvgXml} from 'react-native-svg';
import Video from 'react-native-video';
import {SVG_PDF} from '../../utils/SVGImage.js';

const Message = ({item, user, onLongPress, selectedMessages}) => {
  return (
    <TouchableOpacity
      onLongPress={onLongPress}
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
        <TouchableOpacity onPress={() => item.openImageModal(item.content)}>
          <Image source={{uri: item.content}} style={styles.image} />
        </TouchableOpacity>
      )}
      {item.type === 'video' && (
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
      )}
      {item.type === 'file' && (
        <TouchableOpacity style={styles.backButton}>
          <SvgXml xml={SVG_PDF} height={'100%'} width={'100%'} />
        </TouchableOpacity>
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
  );
};

const ChatModal = ({chatId}) => {
  const {webSocket} = useWebSocket();
  const {user} = useUserStore();
  const [openMenu, setOpenMenu] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const flatListRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(false);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);
  const {conversations, setConversations} = useChatStore();
  const showEditButton = selectedMessages.length === 1;
  const chats = user.chats.find(chat => chat._id === chatId);
  // const officer =
  //   chats?.participants?.find(
  //     participant => participant?.officerDetails === undefined,
  //   ) || {};

      const officer =
    chats?.participants?.find(participant => participant?.officerDetails) || {};
    

  useEffect(() => {
    if (conversations.length) {
      const currentConversation = conversations.find(
        convo => convo.conversationId === chatId,
      );
     
      if (currentConversation) {
        setAllMessages(currentConversation.messages.sort((a, b) =>new Date(b.createdAt)-new Date(a.createdAt)));
      }
    }
  }, [conversations, chatId,setConversations]);




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

  const openImageModal = imageUri => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const openVideoModal = videoUri => {
    setSelectedVideo(videoUri);
    setVideoModalVisible(true);
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

      // setConversations([])
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
  }, [selectedMessages, webSocket, user]);

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
    <View>
        <View style={styles.container}>
      {/* <ChatHeader
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
      /> */}

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
            onLongPress={() => item.sender != officer._id && toggleMessageSelection(item._id)}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  currentUserMessage: {
    backgroundColor: '#e1ffc7',
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  selectedMessage: {
    borderColor: 'blue',
    borderWidth: 2,
  },
  content: {
    fontSize: 16,
    color: 'black',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  videoContainer: {
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
    width: 32,
    height: 32,
  },
});

export default ChatModal