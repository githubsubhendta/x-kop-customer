import { useWebSocket } from './WebSocketProvider';
import { useEffect } from 'react';
import { useFirebase } from './FirebaseProvider.jsx';
import useUserStore from '../stores/user.store.js';
import useChatStore from '../stores/chat.store.js';

const ParantWrapperProvider = ({children}) => {
    const {webSocket} = useWebSocket();
    const {fcmToken} = useFirebase();
    const { user, handleUpdateUser } = useUserStore();
    const { conversations,setConversations } = useChatStore();


  useEffect(()=>{
    if (webSocket && fcmToken) {
    webSocket.emit('onLive', {
      status: true,
      fcmToken,
    });
  }
  },[webSocket,fcmToken]);


  const updateNewMessageStore = (newMessage,chatId) => {
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
    const handleMessage = data => {
      const currentConversation = conversations.find(convo => convo.conversationId === data.message.chat);
      if (currentConversation) {
          const updatedConversations = conversations.map((convo) => {
              if (convo.conversationId === data.message.chat) {
                  let allMessages = [...convo.messages];
                  allMessages.unshift(data.message)
                  return {
                      ...convo,
                      messages: allMessages,
                  };
              }
              return convo;
          });
        
          setConversations(updatedConversations);
      }
       else {
          setConversations([...conversations, { conversationId: data.message.chat, messages: [data.message] }]);
      }

    };

    const handleMessageUpdate = updatedMessage => {
      const currentConversation = conversations.find(
        convo => convo.conversationId === updatedMessage.message.chat,
      );
      let filteredMessages = currentConversation.messages.map(
        (msg) => {
           if(msg._id===updatedMessage.message._id){
          msg.content=updatedMessage.message.content
        }
        return msg;
      }
      );
      updateNewMessageStore(filteredMessages,updatedMessage.message.chat);
    };

    const handleMessageDeletion = ({ messageIds,chat_id }) => {
      const currentConversation = conversations.find(
        convo => convo.conversationId === chat_id,
      );
      let filteredMessages = currentConversation.messages.filter(
        msg => !messageIds.includes(msg._id),
      );
     
      updateNewMessageStore(filteredMessages,chat_id);
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
  }, [webSocket, user, handleUpdateUser,conversations]);

  return (
    <>
    {children}
    </>
  )
}

export default ParantWrapperProvider