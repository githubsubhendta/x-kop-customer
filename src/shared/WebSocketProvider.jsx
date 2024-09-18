import React, {createContext, useContext, useState, useEffect} from 'react';
import {io as SocketIOClient} from 'socket.io-client';
import {BASE_URI_websocket} from '../Api/ApiManager.js';
import userStoreAction from './../stores/user.store.js';

const WebSocketContext = createContext();
export const WebSocketProvider = ({children}) => {
  const [webSocket, setWebSocket] = useState(null);
  const {user, localTokens} = userStoreAction(state => state);
  const createWebSocket = async () => {
    try {
      const callerId = user.mobile;
      const token = localTokens?.accessToken;

      const socket = SocketIOClient(BASE_URI_websocket, {
        transports: ['websocket'],
        query: {callerId},
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      socket.on('connect', () => {
        console.log(user.mobile + 'WebSocket connected ' + user.name);
      });

      // fcmToken fcmToken
      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('connect_error', async error => {
        console.error('WebSocket connection error:', error);
        const newTokens = await userStoreAction(state => state.refreshTokens);
        if (newTokens) {
          socket.io.opts.extraHeaders.Authorization = `Bearer ${newTokens.accessToken}`;
          socket.connect();
        }
      });

      setWebSocket(socket);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  };

  const closeWebSocket = () => {
    if (webSocket) {
      webSocket.disconnect();
      setWebSocket(null);
    }
  };

  useEffect(() => {
    createWebSocket();
    return () => {
      closeWebSocket();
    };
  }, [user, localTokens]);

  return (
    <WebSocketContext.Provider value={{webSocket}}>
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
