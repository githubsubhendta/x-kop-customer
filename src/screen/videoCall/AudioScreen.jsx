
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
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {SvgXml} from 'react-native-svg';
import useAgoraEngine from '../../hooks/useAgoraEngine';
import RNFS from 'react-native-fs';
import {
  SVG_hangout_red,
  SVG_mute_mic,
  SVG_request_video,
  SVG_speaker,
  SVG_speakeroff,
  SVG_unmute_mic,
} from '../../utils/SVGImage.js';
import {useWebSocket} from '../../shared/WebSocketProvider.jsx';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatModal from '../../Components/chat/ChatModal.jsx';
import {useCallDuration} from '../../shared/CallDurationContext.js';
import useChatStore from '../../stores/chat.store.js';
import CustomModal from '../../Components/CustomModal.jsx';

const AudioScreen = ({route, navigation}) => {
  const {config, mobile, reciever_data, consultType} = route.params || {};
  const [showModal, setShowModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {webSocket, leave} = useWebSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [peerIds, setPeerIds] = useState([]);

  let callDurationInterval;
  let callMinUpdate;
  const [modelChat, setModelChat] = useState(false);
  const [callStatus, setCallStatus] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const {callDuration, startCall, stopCall, isBalanceEnough, isBalanceZero} =
    useCallDuration();
  const startTime = new Date(reciever_data.consultationData.startCallTime);
  const {conversations} = useChatStore();

  const {engine, isJoined} = useAgoraEngine(
    config,
    useCallback(() => setConnectionStatus('Connected'), []),
    useCallback(Uid => {
      setPeerIds(prev => [...prev, Uid]);
    }, []),
    useCallback(Uid => {
      setPeerIds(prev => prev.filter(id => id !== Uid));
    }, []),
    useCallback(() => setConnectionStatus('Not Connected'), []),
  );

  

  useEffect(() => {
    if (startTime && reciever_data?.userInfo?.mobile) {
      startCall(
        startTime,
        consultType,
        reciever_data.userInfo.mobile,
        webSocket,
      );
    }
    return () => {
      stopCall();
    };
  }, [consultType, reciever_data?.userInfo?.mobile, webSocket]);

  //////////////////////// Call Recording ////////////////////////////////
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
  }, []);

  const getRecordingFilePath = () => {
    const directoryPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/MyRecordings`
        : `${RNFS.DocumentDirectoryPath}/Recordings`;

    RNFS.mkdir(directoryPath)
      .then(() => console.log('Directory created or already exists'))
      .catch(err => console.error('Error creating directory:', err));

    return `${directoryPath}/call_recording_${Date.now()}.aac`;
  };

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

  const stopRecording = async () => {
    if (!engine.current) {
      console.error('Engine is not initialized.');
      return;
    }

    try {
      await engine.current.stopAudioRecording();
      setIsRecording(false);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const toggleMute = useCallback(async () => {
    if (engine.current) {
      await engine.current.muteLocalAudioStream(!isMuted);
      setIsMuted(prev => !prev);
    }
  }, [engine]);

  const toggleSpeaker = useCallback(async () => {
    if (engine.current) {
      await engine.current.setEnableSpeakerphone(!isSpeakerEnabled);
      setIsSpeakerEnabled(prev => !prev);
      console.log(`Speakerphone ${!isSpeakerEnabled ? 'enabled' : 'disabled'}`);
    }
  }, [isSpeakerEnabled, engine]);

  const endCall = useCallback(async () => {
    if (engine.current) {
      await engine.current.leaveChannel();
      webSocket.emit('handsup', {otherUserId: mobile});
      clearInterval(callDurationInterval);
      setCallStatus(false);
      stopCall();
    }
  }, [engine, webSocket, mobile, stopCall]);

  const switchToVideoCall = useCallback(async () => {
    if (engine.current) {
      webSocket.emit('videocall', {calleeId: mobile});
    }
  }, [engine, webSocket, mobile]);

  useEffect(() => {
    const handleHandsup = async () => {
      clearInterval(callDurationInterval);
      setCallStatus(false);
      stopCall();
      navigation.reset({
        index: 0,
        routes: [{name: 'LayoutScreen'}],
      });
    };
    webSocket.on('appyHandsup', handleHandsup);
    return () => webSocket.off('appyHandsup', handleHandsup);
  }, [webSocket, navigation]);

  const createTwoButtonAlert = () => {
    setShowVideoCallModal(true);
  };

  const handleVideoCallModalClose = () => {
    setShowVideoCallModal(false);
  };

  const handleVideoCallConfirm = async () => {
    setShowVideoCallModal(false);
    
    try {
        if (engine.current) {
            await engine.current.leaveChannel();
        }
        
        webSocket.emit('VideoCallanswerCall', { callerId: mobile });
        
        navigation.navigate('VideoCallScreen', {
            config,
            mobile,
            reciever_data,
        });
    } catch (error) {
        console.error("Error handling video call confirmation:", error);
    }
};

  useEffect(() => {
    webSocket.on('newVideoCall', createTwoButtonAlert);
    webSocket.on('VideoCallAnswered', async () => {
      await engine.current?.leaveChannel();
      navigation.navigate('VideoCallScreen', {config, mobile,reciever_data});
    });
    return () => {
      webSocket.off('newVideoCall', createTwoButtonAlert);
      webSocket.off('VideoCallAnswered', async () => {
        await engine.current?.leaveChannel();
        navigation.navigate('VideoCallScreen', {config, mobile});
      });
    };
  }, [webSocket, engine, createTwoButtonAlert, navigation, config, mobile,reciever_data]);

  useEffect(() => {
    if (isBalanceZero) {
      endCall();
    }
  }, [isBalanceZero, endCall]);

  useEffect(() => {
    if (isBalanceEnough) {
      setShowModal(true);

      const timeout = setTimeout(() => {
        setShowModal(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isBalanceEnough]);

  const handleClose = useCallback(() => setModelChat(false), []);

  const chatModal = useMemo(
    () => (
      <ChatModal
        chatId={reciever_data?.chatId}
        isVisible={modelChat}
        onClose={handleClose}
      />
    ),
    [reciever_data, modelChat, handleClose, conversations],
  );

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleNavigateToWallet = () => {
    setShowModal(false);
    navigation.navigate('WalletScreen');
  };

  return (
    <View style={styles.container}>
      {connectionStatus !== 'Connected' ? (
        <Text style={styles.connectionStatus}>{connectionStatus}</Text>
      ) : (
        <View style={styles.mainContent}>
          <View style={styles.endCallButton}>
            <TouchableOpacity onPress={endCall}>
              <SvgXml xml={SVG_hangout_red} width={80} height={80} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoContainer}>
            <Image
              source={{uri: reciever_data?.userInfo?.avatar}}
              style={styles.profileImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.name} className="text-black">
                {reciever_data?.userInfo?.name}
              </Text>
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
                <SvgXml xml={SVG_speaker} size="32" />
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
        </View>
      )}
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

      <CustomModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        message="Your balance is not enough. Please add more funds."
        buttons={[
          {label: 'Cancel', onPress: handleModalClose, color: 'gray'},
          {
            label: 'Go to Wallet',
            onPress: handleNavigateToWallet,
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
            color: 'gray'
          },
          {
            label: 'OK',
            onPress: handleOK,
            
          },
        ]}
      />

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
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  endCallButton: {
    margin: 20,
    alignItems: 'flex-end',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: '500',
    color: 'gray',
  },
  title: {
    fontSize: 20,
    color: 'gray',
  },
  status: {
    fontSize: 16,
    color: 'gray',
  },
  counterContainer: {
    backgroundColor: '#997654',
    borderRadius: 15,
    marginTop: 10,
    padding: 10,
  },
  callDuration: {
    fontSize: 18,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'slategray',
    borderWidth: 2,
  },
  messageInputContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'black',
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#D22B2B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    gap: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default AudioScreen;