import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import useUserStore from '../stores/user.store';

const CallDurationContext = createContext();

export const useCallDuration = () => {
  return useContext(CallDurationContext);
};

export const CallDurationProvider = ({ children }) => {
  const [callDuration, setCallDuration] = useState('00:00:00');
  const [isCallActive, setIsCallActive] = useState(false);
  const { user, handleUpdateUser } = useUserStore();
  const callDurationInterval = useRef(null);
  const [isBalanceZero, setIsBalanceZero] = useState(false);
  const [isBalanceEnough, setIsBalanceEnough] = useState(false);
  const [remainingBalance, setRemainingBalance] = useState(user.wallet.toFixed(2)); // Initialize with 2 decimal places

  let walletBalance = user.wallet;

  const startCall = useCallback((startTime, consultType, receiverUser, webSocket) => {
    if (user.wallet < consultType.FeePerMinute) {
      console.log("Insufficient balance to start the call");
      setIsBalanceZero(true);
      stopCall();
      return;
    }

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
        duration: formattedDuration
      });

      if (seconds === 59) {
        const fee = consultType.FeePerMinute;
        walletBalance = walletBalance - fee || 0;
        if (walletBalance >= 0) {
          handleUpdateUser({ ...user, wallet: walletBalance });
          console.log(user.wallet, fee, walletBalance, "========", "Updated Wallet Balance:", user.wallet - fee);

          if (walletBalance <= consultType.FeePerMinute * 5) {
            console.log("Warning: Low wallet balance");
            setIsBalanceEnough(true);
          } else {
            setIsBalanceEnough(false);
          }

          if (walletBalance <= 10) {
            console.log("Wallet balance too low, ending call...", walletBalance);
            setIsBalanceZero(true);
            stopCall();
          } else {
            setIsBalanceZero(false);
          }
        } else {
          console.log("Insufficient balance to continue the call, ending call...");
          setIsBalanceZero(true);
          stopCall();
        }
      }
    }, 1000);
  }, [user, handleUpdateUser, stopCall]);
  const stopCall = useCallback(() => {
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
      callDurationInterval.current = null;
    }
    setIsCallActive(false);
    setCallDuration('00:00:00');

    // Calculate and log the remaining balance
    const finalBalance = walletBalance.toFixed(2); 
    setRemainingBalance(finalBalance); 
    // console.log("Call ended. Remaining wallet balance:", finalBalance);
  }, [walletBalance]);

  return (
    <CallDurationContext.Provider value={{ callDuration, startCall, stopCall, isCallActive, isBalanceEnough, isBalanceZero, remainingBalance }}>
      {children}
    </CallDurationContext.Provider>
  );
};
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useRef,
//   useEffect,
// } from 'react';
// import useUserStore from '../stores/user.store';

// const CallDurationContext = createContext();

// export const useCallDuration = () => {
//   return useContext(CallDurationContext);
// };

// export const CallDurationProvider = ({children}) => {
//   const [callDuration, setCallDuration] = useState('00:00:00');
//   const [isCallActive, setIsCallActive] = useState(false);
//   const {user, updateUserWallet} = useUserStore();
//   const callDurationInterval = useRef(null);
//   const [isBalanceZero, setIsBalanceZero] = useState(false);
//   const [isBalanceEnough, setIsBalanceEnough] = useState(false);

//   useEffect(() => {
//     console.log('Updated wallet balance:', user.wallet);
//   }, [user.wallet]);

//   const stopCall = useCallback(() => {
//     if (callDurationInterval.current) {
//       clearInterval(callDurationInterval.current);
//       callDurationInterval.current = null;
//     }
//     setIsCallActive(false);
//     setCallDuration('00:00:00');
//     console.log('Call ended due to insufficient balance.');
//   }, []);

//   const startCall = useCallback(
//     (startTime, consultType, receiverUser, webSocket) => {
//       setIsCallActive(true);

//       callDurationInterval.current = setInterval(() => {
//         const currentTime = new Date();
//         const timeDifference = currentTime - startTime;
//         const seconds = Math.floor((timeDifference / 1000) % 60);
//         const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
//         const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
//         const formattedDuration = `${String(hours).padStart(2, '0')}:${String(
//           minutes,
//         ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//         setCallDuration(formattedDuration);

//         webSocket.emit('syncCallDuration', {
//           receiverUser,
//           duration: formattedDuration,
//         });

//         if (seconds === 59) {
//           const newBalance = Math.max(
//             0,
//             user.wallet - consultType.FeePerMinute,
//           );
//           updateUserWallet(consultType.FeePerMinute);

//           setIsBalanceEnough(newBalance <= consultType.FeePerMinute * 5);
//           setIsBalanceZero(newBalance <= 2);

//           console.log('Updated Wallet Balance:', newBalance);

//           // 🚀 Auto-end call when balance is below 1
//           if (newBalance <= 0) {
//             console.log('Wallet balance is 0 or below. Ending call...');
//             stopCall();
//           }
//         }
//       }, 1000);
//     },
//     [updateUserWallet, stopCall, user.wallet],
//   );

//   return (
//     <CallDurationContext.Provider
//       value={{
//         callDuration,
//         startCall,
//         stopCall,
//         isCallActive,
//         isBalanceEnough,
//         isBalanceZero,
//       }}>
//       {children}
//     </CallDurationContext.Provider>
//   );
// };
