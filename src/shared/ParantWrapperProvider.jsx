import { useWebSocket } from './WebSocketProvider';
import { useEffect } from 'react';
import { useFirebase } from './FirebaseProvider.jsx';

const ParantWrapperProvider = ({children}) => {
    const {webSocket} = useWebSocket();
    const {fcmToken} = useFirebase();
  useEffect(()=>{
    if (webSocket && fcmToken) {
    webSocket.emit('onLive', {
      status: true,
      fcmToken,
    });
  }
  },[webSocket,fcmToken])
  return (
    <>
    {children}
    </>
  )
}

export default ParantWrapperProvider