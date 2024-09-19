import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useWebSocket } from './WebSocketProvider'; 
import useHttpRequest from '../hooks/useHttpRequest'; 

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { webSocket } = useWebSocket();
  const { loading, error, data, fetchData } = useHttpRequest();
  const [mobile, setMobile] = useState('');
  const [config, setConfig] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const tokenData = useRef(null);

  const fetchOfficerData = useCallback(async (consultationTypeName) => {
    const now = new Date();
    const later = new Date(now.getTime() + 10 * 60 * 1000);
    
    fetchData('/officer_schedule/find-officer', 'POST', {
      startTime: now.toISOString(),
      endTime: later.toISOString(),
      consultationTypeName,
    });
  }, [fetchData]);

  const generateToken = useCallback(async (mobile) => {
    fetchData('/token/agora_token', 'POST', {
      channelName: `${mobile}-${mobile}`,
      uid: 0,
    });
  }, [fetchData]);

  useEffect(() => {
    if (data?.data?.mobile) {
      setMobile(data?.data?.mobile);
    }
    if (data?.data) {
      webSocket.emit('call', {
        calleeId: mobile,
        rtcMessage: data.data,
      });
      tokenData.current = { data: data.data, mobile };
    }
  }, [data, mobile, webSocket]);

  const contextValue = {
    mobile,
    setMobile,
    config,
    setConfig,
    connectionStatus,
    setConnectionStatus,
    fetchOfficerData,
    generateToken,
    tokenData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
