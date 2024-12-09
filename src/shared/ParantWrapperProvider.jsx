import { useWebSocket } from './WebSocketProvider';
import { useEffect, useRef, useState } from 'react';
import { useFirebase } from './FirebaseProvider.jsx';
import useUserStore from '../stores/user.store.js';
import useChatStore from '../stores/chat.store.js';
import CallPopup from '../Components/CallPopup.jsx';
import { createAgoraToken } from '../Api/agora.api.js';
import { getCurrentRoute } from '../navigation/NavigationService.js';

const ParantWrapperProvider = ({children}) => {
    const {webSocket,meetReceiver,callRedirect} = useWebSocket();
    const {fcmToken} = useFirebase();
    const { user, handleUpdateUser } = useUserStore();
    const { conversations,setConversations } = useChatStore();
    const [meetingData,setMeetingData] = useState({status:false,data:null})
    // const [agoraToken,setAgoraToken] = useState(null);
    const currentRoute = getCurrentRoute();
    const agoraToken = useRef(null);


  useEffect(()=>{
    if (webSocket && fcmToken) {
    webSocket.emit('onLive', {
      status: true,
      fcmToken,
    });
  } 
  else{
    webSocket && webSocket.emit('onLive', {
      status: true
    });
  }
  },[webSocket,fcmToken]);


useEffect(()=>{
if(meetReceiver){
  setMeetingData({status:true,data:meetReceiver})
}
},[meetReceiver])
  

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
      // console.log("check message data===>",data)
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


  const meetingAccept = async()=>{
      const getTokenData = await createAgoraToken({
        channelName: `${meetingData.data.to_user}-${meetingData.data.officer.mobile}`,
        uid: 0,
      })
      // setAgoraToken({data: getTokenData, mobile:meetingData.data.officer.mobile})
      agoraToken.current = {data: getTokenData, mobile:meetingData.data.officer.mobile}
    webSocket.emit('call', {
      calleeId: meetingData.data.officer.mobile,
      rtcMessage: getTokenData,
      consultationTypeName: meetingData.data.ConsultationTypeName
    });

    // setMeetingData({status:false,data:null}) 
  }

  

  useEffect(() => {
    if (webSocket) {
   if(currentRoute?.name != "FindAnOfficerScreen" || currentRoute?.name != "AudioScreen" && currentRoute?.name != "VideoScreen"){
      const handleAudioScreen = dataSet => {
        setMeetingData({status:false,data:null}) 
        callRedirect(dataSet,agoraToken,dataSet.userInfo.officerDetails.ConsultationTypeID)
      }; 
      // // 9821536060
      webSocket.on('callAnswered', handleAudioScreen); 
     
      return () => {
        webSocket.off('callAnswered', handleAudioScreen);
      };
    }
    }
  }, [webSocket]);

  const meetingReject = ()=>{
    console.log("Meeting meetingReject");
  }

  return (
    <>
    {
      meetingData.status && <CallPopup isVisible={meetingData.status} onAccept={meetingAccept} onReject={meetingReject} userInfo={meetingData.data}  />
    }
     
    {children}
    </>
  )
}

export default ParantWrapperProvider