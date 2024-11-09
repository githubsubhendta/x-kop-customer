import { useEffect, useRef } from 'react';

const useCallBalanceChecker = (callStatus, webSocket) => {
  useEffect(() => {
    const checkBalance = () => {
      if (webSocket) {
        webSocket.emit('checkBalance');
      }
    };

    if (callStatus && webSocket) {
      const intervalId = setInterval(checkBalance, 60000); 
      return () => clearInterval(intervalId);
    }
  }, [callStatus, webSocket]);
};

export default useCallBalanceChecker;
