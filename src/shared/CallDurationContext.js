import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import useUserStore from '../stores/user.store';

const CallDurationContext = createContext();

export const useCallDuration = () => {
  return useContext(CallDurationContext);
}; 

export const CallDurationProvider = ({ children }) => {
  const [callDuration, setCallDuration] = useState('00:00:00');
  const [isCallActive, setIsCallActive] = useState(false);
  const { user } = useUserStore();
  const callDurationInterval = useRef(null); 
  const [isBalanceZero, setIsBalanceZero] = useState(false);

  const [isBalanceEnough,setIsBalanceEnough] = useState(false);

  let userUpdate = user.wallet;

  useEffect(()=>{
    userUpdate = user.wallet;
  },[user])
  const startCall = useCallback((startTime, consultType,receiverUser,webSocket) => {
    setIsCallActive(true);
    callDurationInterval.current = setInterval(() => {
      const currentTime = new Date();
      const timeDifference = currentTime - startTime;
      const seconds = Math.floor((timeDifference / 1000) % 60);
      const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
      const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
      const formattedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setCallDuration(formattedDuration);

      
      webSocket.emit('syncCallDuration', {
        receiverUser,
        duration:formattedDuration
      });

      if (seconds === 59) {
        userUpdate = userUpdate-consultType.FeePerMinute;
        if(userUpdate<=consultType.FeePerMinute*5){
            console.log("check wallet have not enough rupee")
            setIsBalanceEnough(true);
        } else{
            setIsBalanceEnough(false)
        }
        if(userUpdate===0){
            setIsBalanceZero(true)
        } else{
            setIsBalanceZero(false)
        }
      }
    }, 1000);
  }, []);

  const stopCall = useCallback(() => {
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
      callDurationInterval.current = null; 
    }
    setIsCallActive(false);
    setCallDuration('00:00:00');
  }, []);

  

  return (
    <CallDurationContext.Provider value={{ callDuration, startCall, stopCall, isCallActive, isBalanceEnough, isBalanceZero }}>
      {children}
    </CallDurationContext.Provider>
  );
};

