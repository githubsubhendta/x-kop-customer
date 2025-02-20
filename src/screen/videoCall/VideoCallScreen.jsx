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

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  createAgoraRtcEngine,
} from 'react-native-agora';
import requestCameraAndAudioPermission from '../../Components/permissions.js';
import { SvgXml } from 'react-native-svg';
import {
  SVG_hangout_red,
  SVG_mute_mic,
  SVG_speaker,
  SVG_speakeroff,
  SVG_stop_camera,
  SVG_switch_camera,
  SVG_unmute_mic,
} from '../../utils/SVGImage.js';
import { useWebSocket } from '../../shared/WebSocketProvider.jsx';
import { useCallDuration } from '../../shared/CallDurationContext.js';
import { Modal } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const appId = '1be639d040da4a42be10d134055a2abd';

const VideoCallScreen = ({ route, navigation }) => {
  const { config, mobile } = route.params || {};
  const _engine = useRef(null);
  const [isJoined, setJoined] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [isMicOn, setMicOn] = useState(true);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isSpeakerOn, setSpeakerOn] = useState(true);
  const { webSocket } = useWebSocket();
  const [showModal, setShowModal] = useState(false);

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
      init();
      return () => {
        if (_engine.current) {
          _engine.current.leaveChannel();
          _engine.current.removeAllListeners();
          _engine.current.release();
          _engine.current = null;
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
          setPeerIds((prev) => [...prev, Uid]);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setPeerIds((prev) => prev.filter((id) => id !== Uid));
        },
        onUserMuteVideo: (_connection, Uid, muted) => {
          if (muted) {
            showMessage('Remote user turned off the camera');
            // Navigate back to the previous screen if the remote user turns off the camera
            navigation.goBack();
          }
        },
        onError: (err) => {
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
        { clientRoleType: ClientRoleType.ClientRoleBroadcaster },
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
        routes: [{ name: 'LayoutScreen' }],
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
        webSocket.emit('handsup', { otherUserId: mobile });
        stopCall();

        navigation.reset({
          index: 0,
          routes: [{ name: 'LayoutScreen' }],
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

  const toggleMic = () => {
    _engine.current?.muteLocalAudioStream(!isMicOn);
    setMicOn((prev) => !prev);
  };

  const switchCamera = () => {
    _engine.current?.switchCamera();
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      _engine.current?.enableLocalVideo(false);
      _engine.current?.muteLocalVideoStream(true);
      navigation.goBack();
    } else {
      _engine.current?.enableLocalVideo(true);
      _engine.current?.muteLocalVideoStream(false);
    }
    setCameraOn((prev) => !prev);
  };

  const toggleSpeaker = () => {
    _engine.current?.setEnableSpeakerphone(!isSpeakerOn);
    setSpeakerOn((prev) => !prev);
  };

  const showMessage = (message) => {
    console.log(message);
  };

  useEffect(() => {
    if (isBalanceZero) {
      endCall();
    }
  }, [isBalanceZero]);

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
        <RtcSurfaceView style={styles.remote} canvas={{ uid: id }} key={id} />
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
        {isCameraOn && _renderRemoteVideos()}
      </View>
      {isCameraOn && (
        <View style={styles.localContainer}>
          <RtcSurfaceView style={styles.local} canvas={{ uid: 0 }} />
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
          <SvgXml xml={isCameraOn ? SVG_stop_camera : SVG_stop_camera} className="mt-2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSpeaker} style={styles.button}>
          {isSpeakerOn ? (
            <SvgXml xml={SVG_speaker} />
          ) : (
            <SvgXml xml={SVG_speakeroff} />
          )}
        </TouchableOpacity>
      </View>
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
        shadowOffset: { width: 0, height: 2 },
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
    width: 60,
    height: 60,
    borderRadius: 31,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
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
});

export default VideoCallScreen;