// import React, {useCallback, useEffect, useMemo, useState} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   TextInput,
//   Platform,
//   PermissionsAndroid,
//   Dimensions,
// } from 'react-native';
// import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
// import {SvgXml} from 'react-native-svg';
// import RNFS from 'react-native-fs';
// import useAgoraEngine from '../../hooks/useAgoraEngine';
// import {
//   SVG_arrow_back,
//   SVG_hangout_red,
//   SVG_mute_mic,
//   SVG_request_video,
//   SVG_speaker,
//   SVG_speakeroff,
//   SVG_unmute_mic,
// } from '../../utils/SVGImage.js';
// import {useWebSocket} from '../../shared/WebSocketProvider.jsx';
// import ChatModal from '../../Components/chat/ChatModal.jsx';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {useFocusEffect} from '@react-navigation/native';
// import CustomModal from '../../Components/CustomModal.jsx';
// import {navigate} from '../../navigation/NavigationService.js';

// const {width, height} = Dimensions.get('window');

// const AudioScreen = ({route, navigation}) => {
//   const {config, mobile, chatId, userInfo} = route.params || {};
//   const {webSocket, leave} = useWebSocket();
//   const [isMuted, setIsMuted] = useState(false);
//   const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
//   const [connectionStatus, setConnectionStatus] = useState('Not Connected');
//   const [peerIds, setPeerIds] = useState([]);
//   const [modelChat, setModelChat] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [callDuration, setCallDuration] = useState('00:00:00');
//   const [showVideoCallModal, setShowVideoCallModal] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);

//   const {engine, isJoined} = useAgoraEngine(
//     config,
//     useCallback(() => setConnectionStatus('Connected'), []),
//     useCallback(Uid => {
//       setPeerIds(prev => [...prev, Uid]);
//     }, []),
//     useCallback(Uid => {
//       setPeerIds(prev => prev.filter(id => id !== Uid));
//     }, []),
//     useCallback(() => setConnectionStatus('Not Connected'), []),
//   );

//   const requestPermissions = useCallback(async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.requestMultiple([
//           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//           PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//         ]);
//         if (
//           granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
//             PermissionsAndroid.RESULTS.GRANTED &&
//           granted['android.permission.READ_EXTERNAL_STORAGE'] ===
//             PermissionsAndroid.RESULTS.GRANTED &&
//           granted['android.permission.RECORD_AUDIO'] ===
//             PermissionsAndroid.RESULTS.GRANTED &&
//           granted['android.permission.CAMERA'] ===
//             PermissionsAndroid.RESULTS.GRANTED
//         ) {
//           console.log('Permissions granted');
//         } else {
//           console.log('Permissions denied');
//         }
//       } catch (err) {
//         console.warn(err);
//       }
//     } else if (Platform.OS === 'ios') {
//       const microphoneStatus = await request(PERMISSIONS.IOS.MICROPHONE);
//       const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
//       if (
//         microphoneStatus === RESULTS.GRANTED &&
//         cameraStatus === RESULTS.GRANTED
//       ) {
//         console.log('Microphone and camera permissions granted');
//       } else {
//         console.log('Microphone or camera permission denied');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     requestPermissions();
//   }, [requestPermissions]);

//   const getRecordingFilePath = useCallback(() => {
//     const directoryPath =
//       Platform.OS === 'android'
//         ? `${RNFS.DownloadDirectoryPath}/MyRecordings`
//         : `${RNFS.DocumentDirectoryPath}/Recordings`;

//     RNFS.mkdir(directoryPath)
//       .then(() => console.log('Directory created or already exists'))
//       .catch(err => console.error('Error creating directory:', err));

//     return `${directoryPath}/call_recording_${Date.now()}.aac`;
//   }, []);

//   const confirmAndStartRecording = () => {
//     setIsModalVisible(true);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   const handleOK = () => {
//     setIsModalVisible(false);
//     startRecording();
//   };

//   const startRecording = async () => {
//     if (!engine.current) {
//       console.error('Engine is not initialized');
//       Alert.alert('Error', 'Recording engine is not initialized.');
//       return;
//     }

//     try {
//       const filePath = getRecordingFilePath();
//       const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));

//       // Ensure the directory exists
//       await RNFS.mkdir(directoryPath, {recursive: true});

//       console.log('Recording filePath ====>', filePath);

//       // Start the recording
//       await engine.current.startAudioRecording({
//         filePath,
//         sampleRate: 32000,
//         quality: 1,
//       });

//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error starting recording:', error);
//       Alert.alert(
//         'Error',
//         'Failed to start recording. Please check permissions and try again.',
//       );
//     }
//   };

//   const stopRecording = useCallback(async () => {
//     if (engine.current) {
//       try {
//         await engine.current.stopAudioRecording();
//         setIsRecording(false);
//       } catch (error) {
//         console.error('Error stopping recording:', error);
//       }
//     }
//   }, [engine]);

//   const toggleMute = useCallback(async () => {
//     if (engine.current) {
//       await engine.current.muteLocalAudioStream(!isMuted);
//       setIsMuted(prev => !prev);
//     }
//   }, [isMuted, engine]);

//   const toggleSpeaker = useCallback(async () => {
//     const newState = !isSpeakerEnabled;
//     setIsSpeakerEnabled(newState);
//     if (engine.current) {
//       await engine.current.setEnableSpeakerphone(newState);
//     }
//   }, [isSpeakerEnabled, engine]);

//   const endCall = useCallback(async () => {
//     try {
//       if (engine.current) {
//         await engine.current.leaveChannel();
//         await engine.current.release(); // destroy engine
//       }
//       leave(); // notify server via WebSocket
//       navigate('LayoutScreen'); // close call screen
//     } catch (err) {
//       console.error('Error ending call:', err);
//     }
//   }, [engine, leave, navigation]);

//   const switchToVideoCall = useCallback(async () => {
//     if (engine.current) {
//       webSocket.emit('videocall', {calleeId: mobile});
//     }
//   }, [engine, webSocket, mobile]);

//   const createTwoButtonAlert = () => {
//     setShowVideoCallModal(true);
//   };

//   const handleVideoCallModalClose = () => {
//     setShowVideoCallModal(false);
//   };

//   const handleVideoCallConfirm = async () => {
//     setShowVideoCallModal(false);
//     webSocket.emit('VideoCallanswerCall', {callerId: mobile});
//     await engine.current?.leaveChannel();
//     setTimeout(() => {
//       navigation.navigate('VideoCallScreen', {
//         config,
//         mobile,
//         chatId,
//         userInfo,
//       });
//     }, 300);
//   };

//   useEffect(() => {
//     webSocket.on('newVideoCall', createTwoButtonAlert);
//     webSocket.on('VideoCallAnswered', async () => {
//       await engine.current?.leaveChannel();
//       navigation.navigate('VideoCallScreen', {
//         config,
//         mobile,
//         userInfo,
//         chatId,
//       });
//     });
//     return () => {
//       webSocket.off('newVideoCall', createTwoButtonAlert);
//       webSocket.off('VideoCallAnswered');
//     };
//   }, [
//     webSocket,
//     engine,
//     createTwoButtonAlert,
//     navigation,
//     config,
//     mobile,
//     userInfo,
//     chatId,
//   ]);

//   useEffect(() => {
//     const handleCallDurationUpdate = data => {
//       setCallDuration(data.callDuration);
//     };

//     webSocket.on('updateCallDuration', handleCallDurationUpdate);
//     return () => {
//       webSocket.off('updateCallDuration', handleCallDurationUpdate);
//     };
//   }, [webSocket]);

//   const handleClose = useCallback(() => setModelChat(false), []);

//   const chatModal = useMemo(
//     () => (
//       <ChatModal chatId={chatId} isVisible={modelChat} onClose={handleClose} />
//     ),
//     [chatId, modelChat, handleClose],
//   );

//   return (
//     <View style={styles.container}>
//       {connectionStatus !== 'Connected' ? (
//         <Text style={styles.connectionStatus}>{connectionStatus}</Text>
//       ) : (
//         <View style={styles.mainContent}>
//           <View style={styles.endCallButton}>
//             {/* <TouchableOpacity onPress={() => navigation.goBack()}>
//               <SvgXml xml={SVG_arrow_back} width={30} height={30} />
//             </TouchableOpacity> */}
//             <TouchableOpacity onPress={endCall}>
//               <SvgXml xml={SVG_hangout_red} width={80} height={80} />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.infoContainer}>
//             <Image
//               source={
//                 userInfo?.avatar
//                   ? {uri: userInfo?.avatar}
//                   : require('./../../images/book2.jpg')
//               }
//               style={styles.profileImage}
//             />
//             <View style={styles.textContainer}>
//               <Text style={styles.name}>{userInfo?.name}</Text>
//               <Text style={styles.title}>General Offences</Text>
//               <Text style={styles.status}>Call in Progress</Text>
//               <View style={styles.counterContainer}>
//                 <Text style={styles.callDuration}>
//                   {callDuration} mins left
//                 </Text>
//               </View>
//             </View>
//           </View>
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity style={styles.button} onPress={switchToVideoCall}>
//               <SvgXml xml={SVG_request_video} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.button} onPress={toggleMute}>
//               {isMuted ? (
//                 <SvgXml xml={SVG_unmute_mic} />
//               ) : (
//                 <SvgXml xml={SVG_mute_mic} />
//               )}
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.button} onPress={toggleSpeaker}>
//               {isSpeakerEnabled ? (
//                 <SvgXml xml={SVG_speaker} />
//               ) : (
//                 <SvgXml xml={SVG_speakeroff} />
//               )}
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={isRecording ? stopRecording : confirmAndStartRecording}>
//               <Icon
//                 name={isRecording ? 'stop' : 'fiber-manual-record'}
//                 size={24}
//                 color={isRecording ? 'black' : 'red'}
//               />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.messageInputContainer}>
//             <TouchableOpacity
//               style={styles.InputContainer}
//               onPress={() => setModelChat(true)}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Start Typing Here"
//                 placeholderTextColor="#888"
//                 editable={false}
//               />
//               <View style={styles.iconsContainer}>
//                 <View style={styles.iconButton}>
//                   <Icon name="attach-file" size={24} color="#888" />
//                 </View>
//                 <View style={styles.iconButton}>
//                   <Icon name="send" size={24} color="#888" />
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
//           {chatModal}
//         </View>
//       )}

//       <CustomModal
//         isVisible={showVideoCallModal}
//         onClose={handleVideoCallModalClose}
//         message="Requesting for Video Call"
//         buttons={[
//           {label: 'Cancel', onPress: handleVideoCallModalClose, color: 'gray'},
//           {
//             label: 'OK',
//             onPress: handleVideoCallConfirm,
//           },
//         ]}
//       />

//       <CustomModal
//         isVisible={isModalVisible}
//         onClose={handleCancel}
//         message="Do you want to start recording?"
//         buttons={[
//           {
//             label: 'Cancel',
//             onPress: handleCancel,
//             color: 'gray',
//           },
//           {
//             label: 'OK',
//             onPress: handleOK,
//           },
//         ]}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   connectionStatus: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: 'black',
//     fontSize: width > 400 ? 18 : 16,
//   },
//   mainContent: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   endCallButton: {
//     margin: Platform.OS === 'ios' ? 40 : 20,
//     // alignItems: 'flex-end',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   infoContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: width * 0.4,
//     height: width * 0.4,
//     borderRadius: (width * 0.4) / 2,
//   },
//   textContainer: {
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   name: {
//     fontSize: width > 400 ? 24 : 20,
//     fontWeight: '500',
//     color: 'gray',
//   },
//   title: {
//     fontSize: width > 400 ? 20 : 18,
//     color: 'gray',
//   },
//   status: {
//     fontSize: width > 400 ? 16 : 14,
//     color: 'gray',
//   },
//   counterContainer: {
//     backgroundColor: '#997654',
//     borderRadius: 15,
//     marginTop: 10,
//     padding: 10,
//   },
//   callDuration: {
//     fontSize: width > 400 ? 18 : 16,
//     color: 'white',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 20,
//   },
//   button: {
//     width: width * 0.15,
//     height: width * 0.15,
//     borderRadius: (width * 0.15) / 2,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderColor: 'slategray',
//     borderWidth: 2,
//   },
//   messageInputContainer: {
//     paddingHorizontal: 10,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 10,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   input: {
//     fontSize: width > 400 ? 16 : 14,
//     color: '#000',
//     width: 'auto',
//   },
//   iconsContainer: {
//     flexDirection: 'row',
//   },
//   iconButton: {
//     padding: 5,
//     marginLeft: 5,
//   },
//   InputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     margin: 10,
//   },
// });

// export default AudioScreen;

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {SvgXml} from 'react-native-svg';
import RNFS from 'react-native-fs';
import useAgoraEngine from '../../hooks/useAgoraEngine';
import {
  SVG_arrow_back,
  SVG_hangout_red,
  SVG_mute_mic,
  SVG_request_video,
  SVG_speaker,
  SVG_speakeroff,
  SVG_unmute_mic,
} from '../../utils/SVGImage.js';
import {useWebSocket} from '../../shared/WebSocketProvider.jsx';
import ChatModal from '../../Components/chat/ChatModal.jsx';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/CustomModal.jsx';
import {navigate} from '../../navigation/NavigationService.js';
import {useCall} from '../../context/callContext.js';

const {width, height} = Dimensions.get('window');

const AudioScreen = ({route, navigation}) => {
  const configuration = route.params || {};
  const {webSocket, leave} = useWebSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [peerIds, setPeerIds] = useState([]);
  const [modelChat, setModelChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00:00');
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {startCall, endCall: contextEndCall, engine, isJoined} = useCall();

  useEffect(() => {
    if (isJoined) {
      setConnectionStatus('Connected');
    }

    console.log(isJoined);
  }, [isJoined]);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        if (
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === 'ios') {
      const microphoneStatus = await request(PERMISSIONS.IOS.MICROPHONE);
      const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
      if (
        microphoneStatus === RESULTS.GRANTED &&
        cameraStatus === RESULTS.GRANTED
      ) {
        console.log('Microphone and camera permissions granted');
      } else {
        console.log('Microphone or camera permission denied');
      }
    }
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    if (configuration != undefined && Object.keys(configuration).length) {
      startCall(configuration);
    }
  }, [configuration]);

  const getRecordingFilePath = useCallback(() => {
    const directoryPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/MyRecordings`
        : `${RNFS.DocumentDirectoryPath}/Recordings`;

    RNFS.mkdir(directoryPath)
      .then(() => console.log('Directory created or already exists'))
      .catch(err => console.error('Error creating directory:', err));

    return `${directoryPath}/call_recording_${Date.now()}.aac`;
  }, []);

  const confirmAndStartRecording = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOK = () => {
    setIsModalVisible(false);
    startRecording();
  };

  const startRecording = async () => {
    if (!engine.current) {
      console.error('Engine is not initialized');
      Alert.alert('Error', 'Recording engine is not initialized.');
      return;
    }

    try {
      const filePath = getRecordingFilePath();
      const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));

      // Ensure the directory exists
      await RNFS.mkdir(directoryPath, {recursive: true});

      console.log('Recording filePath ====>', filePath);

      // Start the recording
      await engine.current.startAudioRecording({
        filePath,
        sampleRate: 32000,
        quality: 1,
      });

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert(
        'Error',
        'Failed to start recording. Please check permissions and try again.',
      );
    }
  };

  const stopRecording = useCallback(async () => {
    if (engine.current) {
      try {
        await engine.current.stopAudioRecording();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  }, [engine]);

  const toggleMute = useCallback(async () => {
    if (engine.current) {
      await engine.current.muteLocalAudioStream(!isMuted);
      setIsMuted(prev => !prev);
    }
  }, [isMuted, engine]);

  const toggleSpeaker = useCallback(async () => {
    const newState = !isSpeakerEnabled;
    setIsSpeakerEnabled(newState);
    if (engine.current) {
      await engine.current.setEnableSpeakerphone(newState);
    }
  }, [isSpeakerEnabled, engine]);

  const endCall = useCallback(async () => {
    try {
      contextEndCall();
      navigate('LayoutScreen');
    } catch (err) {
      console.error('Error ending call:', err);
    }
  }, [engine, leave, navigation]);

  const switchToVideoCall = useCallback(async () => {
    if (engine.current) {
      webSocket.emit('videocall', {calleeId: configuration.mobile});
    }
  }, [engine, webSocket, configuration]);

  const createTwoButtonAlert = () => {
    setShowVideoCallModal(true);
  };

  const handleVideoCallModalClose = () => {
    setShowVideoCallModal(false);
  };

  const handleVideoCallConfirm = async () => {
    setShowVideoCallModal(false);
    webSocket.emit('VideoCallanswerCall', {callerId: configuration.mobile});
    await engine.current?.leaveChannel();
    setTimeout(() => {
      navigation.navigate('VideoCallScreen', {
        config: configuration.config,
        mobile: configuration.mobile,
        chatId: configuration.reciever_data.chatId,
        userInfo: configuration.userInfo,
      });
    }, 300);
  };

  useEffect(() => {
    webSocket.on('newVideoCall', createTwoButtonAlert);
    webSocket.on('VideoCallAnswered', async () => {
      await engine.current?.leaveChannel();

      navigation.navigate('VideoCallScreen', {
        config: configuration.config,
        mobile: configuration.mobile,
        chatId: configuration.reciever_data.chatId,
        userInfo: configuration.userInfo,
      });
    });
    return () => {
      webSocket.off('newVideoCall', createTwoButtonAlert);
      webSocket.off('VideoCallAnswered');
    };
  }, [webSocket, engine, createTwoButtonAlert, navigation, configuration]);

  useEffect(() => {
    const handleCallDurationUpdate = data => {
      setCallDuration(data.callDuration);
    };

    webSocket.on('updateCallDuration', handleCallDurationUpdate);
    return () => {
      webSocket.off('updateCallDuration', handleCallDurationUpdate);
    };
  }, [webSocket]);

  const handleClose = useCallback(() => setModelChat(false), []);

  const chatModal = useMemo(
    () => (
      <ChatModal
        chatId={configuration.reciever_data.chatId}
        isVisible={modelChat}
        onClose={handleClose}
      />
    ),
    [configuration, modelChat, handleClose],
  );

  return (
    <View style={styles.container}>
      {connectionStatus !== 'Connected' ? (
        <Text style={styles.connectionStatus}>{connectionStatus}</Text>
      ) : (
        <View style={styles.mainContent}>
          <View style={styles.endCallButton}>
            {/* <TouchableOpacity onPress={() => navigation.goBack()}>
              <SvgXml xml={SVG_arrow_back} width={30} height={30} />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={endCall}>
              <SvgXml xml={SVG_hangout_red} width={80} height={80} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoContainer}>
            <Image
              source={
                configuration?.userInfo?.avatar
                  ? {uri: configuration?.userInfo?.avatar}
                  : require('./../../images/book2.jpg')
              }
              style={styles.profileImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{configuration?.userInfo?.name}</Text>
              <Text style={styles.title}>General Offences</Text>
              <Text style={styles.status}>Call in Progress</Text>
              <View style={styles.counterContainer}>
                <Text style={styles.callDuration}>
                  {callDuration} mins left
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={switchToVideoCall}>
              <SvgXml xml={SVG_request_video} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={toggleMute}>
              {isMuted ? (
                <SvgXml xml={SVG_unmute_mic} />
              ) : (
                <SvgXml xml={SVG_mute_mic} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={toggleSpeaker}>
              {isSpeakerEnabled ? (
                <SvgXml xml={SVG_speaker} />
              ) : (
                <SvgXml xml={SVG_speakeroff} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={isRecording ? stopRecording : confirmAndStartRecording}>
              <Icon
                name={isRecording ? 'stop' : 'fiber-manual-record'}
                size={24}
                color={isRecording ? 'black' : 'red'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.messageInputContainer}>
            <TouchableOpacity
              style={styles.InputContainer}
              onPress={() => setModelChat(true)}>
              <TextInput
                style={styles.input}
                placeholder="Start Typing Here"
                placeholderTextColor="#888"
                editable={false}
              />
              <View style={styles.iconsContainer}>
                <View style={styles.iconButton}>
                  <Icon name="attach-file" size={24} color="#888" />
                </View>
                <View style={styles.iconButton}>
                  <Icon name="send" size={24} color="#888" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          {chatModal}
        </View>
      )}

      <CustomModal
        isVisible={showVideoCallModal}
        onClose={handleVideoCallModalClose}
        message="Requesting for Video Call"
        buttons={[
          {label: 'Cancel', onPress: handleVideoCallModalClose, color: 'gray'},
          {
            label: 'OK',
            onPress: handleVideoCallConfirm,
          },
        ]}
      />

      <CustomModal
        isVisible={isModalVisible}
        onClose={handleCancel}
        message="Do you want to start recording?"
        buttons={[
          {
            label: 'Cancel',
            onPress: handleCancel,
            color: 'gray',
          },
          {
            label: 'OK',
            onPress: handleOK,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  connectionStatus: {
    textAlign: 'center',
    marginTop: 20,
    color: 'black',
    fontSize: width > 400 ? 18 : 16,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  endCallButton: {
    margin: Platform.OS === 'ios' ? 40 : 20,
    // alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  name: {
    fontSize: width > 400 ? 24 : 20,
    fontWeight: '500',
    color: 'gray',
  },
  title: {
    fontSize: width > 400 ? 20 : 18,
    color: 'gray',
  },
  status: {
    fontSize: width > 400 ? 16 : 14,
    color: 'gray',
  },
  counterContainer: {
    backgroundColor: '#997654',
    borderRadius: 15,
    marginTop: 10,
    padding: 10,
  },
  callDuration: {
    fontSize: width > 400 ? 18 : 16,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  button: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: (width * 0.15) / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'slategray',
    borderWidth: 2,
  },
  messageInputContainer: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    fontSize: width > 400 ? 16 : 14,
    color: '#000',
    width: 'auto',
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  InputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 10,
  },
});

export default AudioScreen;
