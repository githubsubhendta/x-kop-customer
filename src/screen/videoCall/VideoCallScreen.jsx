// import React, {useEffect, useRef, useState} from 'react';
// import {
//   Platform,
//   Text,
//   TouchableOpacity,
//   View,
//   StyleSheet,
//   Dimensions,
//   Alert,
// } from 'react-native';
// import {
//   ChannelProfileType,
//   ClientRoleType,
//   RtcSurfaceView,
//   createAgoraRtcEngine,
// } from 'react-native-agora';
// import requestCameraAndAudioPermission from '../../Components/permissions.js';
// import {SvgXml} from 'react-native-svg';
// import {
//   SVG_hangout_red,
//   SVG_mute_mic,
//   SVG_speaker,
//   SVG_speakeroff,
//   SVG_stop_camera,
//   SVG_switch_camera,
//   SVG_unmute_mic,
// } from '../../utils/SVGImage.js';
// import {useWebSocket} from '../../shared/WebSocketProvider.jsx';
// import {useCallDuration} from '../../shared/CallDurationContext.js';
// import {Modal} from 'react-native-paper';

// const {width, height} = Dimensions.get('window');
// const appId = '1be639d040da4a42be10d134055a2abd';

// const VideoCallScreen = ({route, navigation}) => {
//   const {config, mobile} = route.params || {};
//   const _engine = useRef(null);
//   const [isJoined, setJoined] = useState(false);
//   const [peerIds, setPeerIds] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState('Not Connected');
//   const [isMicOn, setMicOn] = useState(true);
//   const [isCameraOn, setCameraOn] = useState(true);
//   const [isSpeakerOn, setSpeakerOn] = useState(true);
//   const {webSocket} = useWebSocket();
//   const [showModal, setShowModal] = useState(false);

//   const {
//     callDuration,
//     startCall,
//     stopCall,
//     isCallActive,
//     isBalanceEnough,
//     isBalanceZero,
//   } = useCallDuration();

//   // useEffect(() => {
//   //   if (isCallActive) {
//   //     const startTime = new Date();
//   //     startCall(startTime);
//   //   }
//   //   return () => {
//   //     if (isCallActive) stopCall();
//   //   };
//   // }, [isCallActive, startCall, stopCall]);

//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       requestCameraAndAudioPermission().then(() => {
//         console.log('Permissions requested!');
//       });
//     }
//     if (
//       !config ||
//       !config.channelName ||
//       !config.token ||
//       typeof config.uid !== 'number'
//     ) {
//       console.error('Invalid config parameters');
//       navigation.goBack();
//       return;
//     }
//     init();
//     return () => {
//       endCall();
//     };
//   }, []);

//   const init = async () => {
//     try {
//       _engine.current = createAgoraRtcEngine();
//       _engine.current.registerEventHandler({
//         onJoinChannelSuccess: () => {
//           showMessage('Successfully joined the channel' + config.channelName);
//           setJoined(true);
//           setConnectionStatus('Connected');
//         },
//         onUserJoined: (_connection, Uid) => {
//           showMessage('Remote user joined with uid' + Uid);
//           setPeerIds(prev => [...prev, Uid]);
//         },
//         onUserOffline: (_connection, Uid) => {
//           showMessage('Remote user left the channel. uid: ' + Uid);
//           setPeerIds(prev => prev.filter(id => id !== Uid));
//         },
//         onError: err => {
//           console.error('Agora Error:', err);
//           showMessage('Agora Error: ' + JSON.stringify(err));
//           setConnectionStatus('Error');
//         },
//       });

//       _engine.current.initialize({
//         appId: appId,
//         channelProfile: ChannelProfileType.ChannelProfileCommunication,
//       });

//       _engine.current.enableVideo();
//       _engine.current.startPreview();
//       startCallFun();
//     } catch (error) {
//       console.error('Error initializing Agora Engine:', error);
//       showMessage('Error initializing Agora Engine: ' + error);
//     }
//   };

//   const startCallFun = async () => {
//     try {
//       await _engine.current?.joinChannel(
//         config.token,
//         config.channelName,
//         config.uid,
//         {clientRoleType: ClientRoleType.ClientRoleBroadcaster},
//       );
//       setConnectionStatus('Connecting...');
//     } catch (error) {
//       console.error('Error joining channel:', error);
//       showMessage('Error joining channel: ' + error);
//       setConnectionStatus('Error');
//     }
//   };

//   useEffect(() => {
//     if (!webSocket) return;

//     const handleHandsup = () => {
//       stopCall();
//       navigation.reset({
//         index: 0,
//         routes: [{name: 'LayoutScreen'}],
//       });
//     };

//     webSocket.on('appyHandsup', handleHandsup);

//     return () => {
//       webSocket.off('appyHandsup', handleHandsup);
//     };
//   }, [webSocket, stopCall, navigation]);

//   const endCall = async () => {
//     try {
//       if (_engine.current) {
//         console.log('check stop video call using ===mobile==>', mobile);
//         await _engine.current.leaveChannel();
//         _engine.current.removeAllListeners();
//         _engine.current.release();
//         webSocket.emit('handsup', {otherUserId: mobile});
//         // navigation.navigate('FindAnOfficerScreen');
//         stopCall();

//         navigation.reset({
//           index: 0,
//           routes: [{name: 'LayoutScreen'}],
//         });
//       }
//     } catch (error) {
//       console.error('Error ending call:', error);
//       showMessage('Error ending call: ' + error);
//     }

//     setPeerIds([]);
//     setJoined(false);
//     setConnectionStatus('Not Connected');
//   };
//   const toggleMic = () => {
//     _engine.current?.muteLocalAudioStream(!isMicOn);
//     setMicOn(prev => !prev);
//   };

//   const switchCamera = () => {
//     _engine.current?.switchCamera();
//   };

//   const toggleCamera = () => {
//     _engine.current?.enableLocalVideo(!isCameraOn);
//     setCameraOn(prev => !prev);
//   };
//   const toggleSpeaker = () => {
//     _engine.current?.setEnableSpeakerphone(!isSpeakerOn);
//     setSpeakerOn(prev => !prev);
//   };
//   const showMessage = message => {
//     console.log(message);
//   };
//   useEffect(() => {
//     if (isBalanceZero) {
//       endCall();
//     }
//   }, [isBalanceZero]);
//   useEffect(() => {
//     if (isBalanceEnough) {
//       setShowModal(true);
//     }
//     return () => {
//       setShowModal(false);
//     };
//   }, [isBalanceEnough]);

//   const handleModalClose = () => {
//     setShowModal(false);
//   };

//   const handleNavigateToWallet = () => {
//     setShowModal(false);
//     navigation.navigate('WalletScreen');
//   };

//   const _renderRemoteVideos = () => {
//     if (peerIds.length > 0) {
//       const id = peerIds[0];
//       return (
//         <RtcSurfaceView style={styles.remote} canvas={{uid: id}} key={id} />
//       );
//     } else {
//       return <Text style={styles.text}>No remote video</Text>;
//     }
//   };

//   const _renderVideos = () => (
//     <View style={styles.fullView}>

//       <View style={styles.remoteContainer}>
//       <View style={styles.counterContainer}>
//         <Text style={styles.callDuration}>{callDuration} mins left</Text>
//       </View>
//         {_renderRemoteVideos()}</View>

//       {isCameraOn && (
//         <View style={styles.localContainer}>
//           <RtcSurfaceView style={styles.local} canvas={{uid: 0}} />
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <View style={styles.max}>
//       {isJoined && _renderVideos()}
//       <View style={styles.buttonHolder}>
//         <TouchableOpacity onPress={endCall} style={styles.button}>
//           <SvgXml xml={SVG_hangout_red} />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={toggleMic} style={styles.button}>
//           {isMicOn ? (
//             <SvgXml xml={SVG_mute_mic} />
//           ) : (
//             <SvgXml xml={SVG_unmute_mic} />
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity onPress={switchCamera} style={styles.button}>
//           <SvgXml xml={SVG_switch_camera} />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={toggleCamera} style={styles.button}>
//           {isCameraOn ? (
//             <SvgXml xml={SVG_stop_camera} />
//           ) : (
//             <SvgXml xml={SVG_switch_camera} />
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity onPress={toggleSpeaker} style={styles.button}>
//           {isSpeakerOn ? (
//             <SvgXml xml={SVG_speaker} />
//           ) : (
//             <SvgXml xml={SVG_speakeroff} />
//           )}
//         </TouchableOpacity>
//       </View>
//       <Modal visible={showModal} animationType="slide" transparent={true}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalText}>
//               Your balance is not enough. Please add more funds.
//             </Text>
//             <View className="flex flex-row justify-center space-x-4">
//               <TouchableOpacity
//                 onPress={handleModalClose}
//                 style={styles.modalButton}>
//                 <Text style={styles.modalButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleNavigateToWallet}
//                 style={styles.modalButton}>
//                 <Text style={styles.modalButtonText}>Go to Wallet</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   max: {
//     flex: 1,
//   },
//   fullView: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   localContainer: {
//     position: 'absolute',
//     backgroundColor:'#000',
//     bottom: 10,
//     right: 20,
//     width: 120,
//     height: 180,
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#fff',
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 5,
//   },
//   local: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//   },
//   remoteContainer: {
//     flex: 1,
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   remote: {
//     width: width - 10,
//     height: height / 2,
//     borderRadius: 10,
//   },
//   counterContainer: {
//     position: 'absolute',
//     top: 10,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     paddingVertical: 5,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   callDuration: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   buttonHolder: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 20,
//   },
//   button: {
//     width: 60,
//     height: 60,
//     borderRadius: 31,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',

//   },
//   text: {
//     color: 'black',
//   },
// });

// export default VideoCallScreen;

import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  createAgoraRtcEngine,
} from 'react-native-agora';
import Icon from 'react-native-vector-icons/MaterialIcons';
import requestCameraAndAudioPermission from '../../Components/permissions.js';
import {SvgXml} from 'react-native-svg';
import {
  SVG_hangout_red,
  SVG_mute_mic,
  SVG_speaker,
  SVG_speakeroff,
  SVG_stop_camera,
  SVG_switch_camera,
  SVG_unmute_mic,
} from '../../utils/SVGImage.js';
import {useWebSocket} from '../../shared/WebSocketProvider.jsx';
import {useCallDuration} from '../../shared/CallDurationContext.js';
import {Modal} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import useChatStore from '../../stores/chat.store.js';
import ChatModal from '../../Components/chat/ChatModal.jsx';

const {width, height} = Dimensions.get('window');
const appId = '1be639d040da4a42be10d134055a2abd';

const VideoCallScreen = ({route, navigation}) => {
  const {config, mobile, reciever_data, consultType} = route.params || {};

  const _engine = useRef(null);
  const [isJoined, setJoined] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isSpeakerOn, setSpeakerOn] = useState(true);
  const {webSocket} = useWebSocket();
  const [showModal, setShowModal] = useState(false);
  const [modelChat, setModelChat] = useState(false);
  const {conversations} = useChatStore();

  const {
    callDuration,
    startCall,
    stopCall,
    isCallActive,
    isBalanceEnough,
    isBalanceZero,
  } = useCallDuration();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        requestCameraAndAudioPermission().then(() => {
          console.log('Permissions requested!');
        });
      }

      if (
        !config ||
        !config.channelName ||
        !config.token ||
        typeof config.uid !== 'number'
      ) {
        console.error('Invalid config parameters');
        navigation.goBack();
        return;
      }

      if (!_engine.current) {
        init();
      } else {
        startCallFun();
      }

      return () => {
        if (_engine.current) {
          _engine.current.leaveChannel();
        }
      };
    }, [config, navigation]),
  );

  const init = async () => {
    try {
      _engine.current = createAgoraRtcEngine();
      _engine.current.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + config.channelName);
          setJoined(true);
          setConnectionStatus('Connected');
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setPeerIds(prev => [...prev, Uid]);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setPeerIds(prev => prev.filter(id => id !== Uid));
        },
        onUserMuteVideo: (_connection, Uid, muted) => {
          if (muted) {
            showMessage('Remote user turned off the camera');
          }
        },
        onError: err => {
          console.error('Agora Error:', err);
          showMessage('Agora Error: ' + JSON.stringify(err));
          setConnectionStatus('Error');
        },
      });

      _engine.current.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      _engine.current.enableVideo();
      _engine.current.startPreview();
      startCallFun();
    } catch (error) {
      console.error('Error initializing Agora Engine:', error);
      showMessage('Error initializing Agora Engine: ' + error);
    }
  };

  const startCallFun = async () => {
    try {
      await _engine.current?.joinChannel(
        config.token,
        config.channelName,
        config.uid,
        {clientRoleType: ClientRoleType.ClientRoleBroadcaster},
      );
      setConnectionStatus('Connecting...');
    } catch (error) {
      console.error('Error joining channel:', error);
      showMessage('Error joining channel: ' + error);
      setConnectionStatus('Error');
    }
  };

  useEffect(() => {
    if (!webSocket) return;

    const handleHandsup = () => {
      stopCall();
      navigation.reset({
        index: 0,
        routes: [{name: 'LayoutScreen'}],
      });
    };

    webSocket.on('appyHandsup', handleHandsup);

    return () => {
      webSocket.off('appyHandsup', handleHandsup);
    };
  }, [webSocket, stopCall, navigation]);

  const endCall = async () => {
    try {
      if (_engine.current) {
        await _engine.current.leaveChannel();
        _engine.current.removeAllListeners();
        _engine.current.release();
        webSocket.emit('handsup', {otherUserId: mobile});
        stopCall();

        navigation.reset({
          index: 0,
          routes: [{name: 'LayoutScreen'}],
        });
      }
    } catch (error) {
      console.error('Error ending call:', error);
      showMessage('Error ending call: ' + error);
    }

    setPeerIds([]);
    setJoined(false);
    setConnectionStatus('Not Connected');
  };

  // const toggleMic = () => {
  //   _engine.current?.muteLocalAudioStream(!isMicOn);
  //   setMicOn((prev) => !prev);
  // };

  const toggleMic = () => {
    const newMicStatus = !isMicOn;
    _engine.current?.muteLocalAudioStream(newMicStatus);
    setMicOn(newMicStatus);
    console.log('Microphone toggled:', newMicStatus);
  };

  const switchCamera = () => {
    _engine.current?.switchCamera();
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      _engine.current?.enableLocalVideo(false);
      _engine.current?.muteLocalVideoStream(true);
    } else {
      _engine.current?.enableLocalVideo(true);
      _engine.current?.muteLocalVideoStream(false);
    }
    setCameraOn(prev => !prev);
  };

  const toggleSpeaker = () => {
    const newSpeakerStatus = !isSpeakerOn;
    _engine.current?.setEnableSpeakerphone(newSpeakerStatus);
    setSpeakerOn(newSpeakerStatus);
    console.log('Speaker toggled:', newSpeakerStatus);
  };

  const showMessage = message => {
    console.log(message);
  };

  useEffect(() => {
    if (isBalanceZero) {
      endCall();
    }
  }, [isBalanceZero]);

  const handleClose = useCallback(() => setModelChat(false), []);

  // Debug chat data before rendering
  useEffect(() => {
    console.log('Chat ID:', reciever_data?.chatId);
    console.log('Conversations:', conversations);
  }, [reciever_data, conversations, modelChat]);

  const chatModal = useMemo(
    () => (
      <ChatModal
        chatId={reciever_data?.chatId}
        isVisible={modelChat}
        onClose={handleClose}
      />
    ),
    [reciever_data?.chatId, modelChat, handleClose, conversations],
  );

  useEffect(() => {
    if (isBalanceEnough) {
      setShowModal(true);
    }
    return () => {
      setShowModal(false);
    };
  }, [isBalanceEnough]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleNavigateToWallet = () => {
    setShowModal(false);
    navigation.navigate('WalletScreen');
  };

  const _renderRemoteVideos = () => {
    if (peerIds.length > 0) {
      const id = peerIds[0];
      return (
        <RtcSurfaceView style={styles.remote} canvas={{uid: id}} key={id} />
      );
    } else {
      return <Text style={styles.text}>No remote video</Text>;
    }
  };

  const _renderVideos = () => (
    <View style={styles.fullView}>
      <View style={styles.remoteContainer}>
        <View style={styles.counterContainer}>
          <Text style={styles.callDuration}>{callDuration} mins left</Text>
        </View>
        {_renderRemoteVideos()}
      </View>

      {isCameraOn ? (
        <View style={styles.localContainer}>
          <RtcSurfaceView style={styles.local} canvas={{uid: 0}} />
        </View>
      ) : (
        <View style={styles.localContainer2}>
          <Svg width={50} height={50} viewBox="0 0 640 512" fill="white">
            <Path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-86.4-67.7 13.8 9.2c9.8 6.5 22.4 7.2 32.9 1.6s16.9-16.4 16.9-28.2l0-256c0-11.8-6.5-22.6-16.9-28.2s-23-5-32.9 1.6l-96 64L448 174.9l0 17.1 0 128 0 5.8-32-25.1L416 128c0-35.3-28.7-64-64-64L113.9 64 38.8 5.1zM407 416.7L32.3 121.5c-.2 2.1-.3 4.3-.3 6.5l0 256c0 35.3 28.7 64 64 64l256 0c23.4 0 43.9-12.6 55-31.3z" />
          </Svg>
          <Text style={styles.cameraOffText}>Camera is off</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.max}>
      {isJoined && _renderVideos()}
      <View style={styles.buttonHolder}>
        <TouchableOpacity onPress={toggleMic} style={styles.button}>
          {isMicOn ? (
            <SvgXml xml={SVG_unmute_mic} />
          ) : (
            <SvgXml xml={SVG_mute_mic} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={switchCamera} style={styles.button}>
          <SvgXml xml={SVG_switch_camera} />
        </TouchableOpacity>
        <TouchableOpacity onPress={endCall} style={styles.button}>
          <SvgXml xml={SVG_hangout_red} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCamera} style={styles.button}>
          <SvgXml
            xml={isCameraOn ? SVG_stop_camera : SVG_stop_camera}
            className="mt-2"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModelChat(true)}>
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            width={28}
            height={28}
            fill="#000">
            <Path d="M284 224.8a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 284 224.8zm-110.5 0a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 173.6 224.8zm220.9 0a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 394.5 224.8zm153.8-55.3c-15.5-24.2-37.3-45.6-64.7-63.6-52.9-34.8-122.4-54-195.7-54a406 406 0 0 0 -72 6.4 238.5 238.5 0 0 0 -49.5-36.6C99.7-11.7 40.9 .7 11.1 11.4A14.3 14.3 0 0 0 5.6 34.8C26.5 56.5 61.2 99.3 52.7 138.3c-33.1 33.9-51.1 74.8-51.1 117.3 0 43.4 18 84.2 51.1 118.1 8.5 39-26.2 81.8-47.1 103.5a14.3 14.3 0 0 0 5.6 23.3c29.7 10.7 88.5 23.1 155.3-10.2a238.7 238.7 0 0 0 49.5-36.6A406 406 0 0 0 288 460.1c73.3 0 142.8-19.2 195.7-54 27.4-18 49.1-39.4 64.7-63.6 17.3-26.9 26.1-55.9 26.1-86.1C574.4 225.4 565.6 196.4 548.3 169.5zM285 409.9a345.7 345.7 0 0 1 -89.4-11.5l-20.1 19.4a184.4 184.4 0 0 1 -37.1 27.6 145.8 145.8 0 0 1 -52.5 14.9c1-1.8 1.9-3.6 2.8-5.4q30.3-55.7 16.3-100.1c-33-26-52.8-59.2-52.8-95.4 0-83.1 104.3-150.5 232.8-150.5s232.9 67.4 232.9 150.5C517.9 342.5 413.6 409.9 285 409.9z" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSpeaker} style={styles.button}>
          {isSpeakerOn ? (
            <SvgXml xml={SVG_speaker} />
          ) : (
            <SvgXml xml={SVG_speakeroff} />
          )}
        </TouchableOpacity>
      </View>
      {/* Render ChatModal outside the buttonHolder */}
      {chatModal}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Your balance is not enough. Please add more funds.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNavigateToWallet}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Go to Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  max: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localContainer: {
    position: 'absolute',
    backgroundColor: '#000',
    bottom: 10,
    right: 20,
    width: 120,
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2},
      },
      android: {
        elevation: 5,
      },
    }),
  },
  local: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  remoteContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remote: {
    width: width - 10,
    height: height / 2.6,
    borderRadius: 10,
  },
  counterContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  callDuration: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonHolder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 31,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2},
      },
      android: {
        elevation: 5,
      },
    }),
  },
  text: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  localContainer2: {
    position: 'absolute',
    backgroundColor: '#000',
    bottom: 10,
    right: 20,
    width: 120,
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOffText: {
    color: 'white',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default VideoCallScreen;
