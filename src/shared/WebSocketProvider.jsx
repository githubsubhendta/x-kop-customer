import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import {io as SocketIOClient} from 'socket.io-client';
import {BASE_URI_websocket} from '../Api/ApiManager.js';
import userStoreAction from './../stores/user.store.js';
import {useNetwork} from './NetworkProvider';
import {getCurrentUser} from '../Api/user.api.js';
import {navigate, reset} from '../navigation/NavigationService.js';

const WebSocketContext = createContext();

export const WebSocketProvider = ({children}) => {
  const [webSocket, setWebSocket] = useState(null);
  const {user, localTokens, handleUpdateUser} = userStoreAction(state => state);
  const {isConnected} = useNetwork();
  const [callReceiver, setCallReceiver] = useState(false);
  const otherUserId = useRef(null);
  const userInfo = useRef(null);
  const [meetReceiver, setMeetReceiver] = useState(null);

  const createWebSocket = async () => {
    if (!isConnected) {
      console.log('No internet connection, WebSocket not created.');
      return;
    }

    const token = localTokens?.accessToken;
    if (!token) {
      console.log('Access token not available, WebSocket not created.');
      return;
    }

    try {
      const callerId = user.mobile;
      const socket = SocketIOClient(BASE_URI_websocket, {
        transports: ['websocket'],
        query: {callerId},
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      socket.on('connect', () => {
        console.log(user.mobile + ' WebSocket connected ' + user.name);
      });

      socket.on('updateUser', async () => {
        try {
          const data = await getCurrentUser(localTokens);
          handleUpdateUser(data.data.data.user);
        } catch (error) {
          console.log('error', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('connect_error', async error => {
        // console.error('WebSocket connection error:', error);
        const newTokens = await userStoreAction(state => state.refreshTokens);
        if (newTokens) {
          socket.io.opts.extraHeaders.Authorization = `Bearer ${newTokens.accessToken}`;
          socket.connect();
        }
      });

      setWebSocket(socket);
    } catch (error) {
      // console.error('Error creating WebSocket:', error);
    }
  };

  const closeWebSocket = () => {
    if (webSocket) {
      webSocket.disconnect();
      setWebSocket(null);
    }
  };

  useEffect(() => {
    if (isConnected && localTokens?.accessToken) {
      createWebSocket();
    } else {
      closeWebSocket();
    }

    return () => {
      closeWebSocket();
    };
  }, [isConnected, localTokens]);
  // [isConnected, user, localTokens]

  const leave = (type = 'any') => {
    webSocket.emit('handsup', {
      otherUserId: otherUserId.current,
      type: type,
    });

    // navigation.reset({
    //   index: 0,
    //   routes: [{name: 'LayoutScreen'}],
    // });
  };

  const callRedirect = (dataSet, tokenData, recieve_params) => {
    userInfo.current = dataSet.userInfo;
    navigate('AudioScreen', {
      config: tokenData.current?.data,
      mobile: tokenData.current?.mobile,
      reciever_data: dataSet,
      consultType: recieve_params,
    });
  };

  useEffect(() => {
    if (webSocket) {
      webSocket.on('meeting_receiver', data => {
       
        setMeetReceiver(data);
      });
    }
  }, [webSocket]);

  return (
    <WebSocketContext.Provider
      value={{webSocket, leave, callRedirect, meetReceiver}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
