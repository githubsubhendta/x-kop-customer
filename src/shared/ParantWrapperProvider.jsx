import { useWebSocket } from './WebSocketProvider';
import { useEffect } from 'react';
import { useFirebase } from './FirebaseProvider.jsx';
import useUserStore from '../stores/user.store.js';

const ParantWrapperProvider = ({children}) => {
    const {webSocket} = useWebSocket();
    const {fcmToken} = useFirebase();
    const { user, handleUpdateUser } = useUserStore();


  useEffect(()=>{
    if (webSocket && fcmToken) {
    webSocket.emit('onLive', {
      status: true,
      fcmToken,
    });
  }
  },[webSocket,fcmToken]);

  useEffect(() => {
    const handleMessage = data => {
      const updatedChats = user.chats.map(chat => {
        if (chat._id === data.message.chat_id) {
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

    };

    const handleMessageUpdate = updatedMessage => {
      const updatedChats = user.chats.map(chat => {
        if (chat._id === updatedMessage.message.chat_id) {
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
    };

    const handleMessageDeletion = ({ messageIds,chat_id }) => {
      const updatedChats = user.chats.map(chat => {
        if (chat._id === chat_id) {
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
  }, [webSocket, user, handleUpdateUser]);




  return (
    <>
    {children}
    </>
  )
}

export default ParantWrapperProvider