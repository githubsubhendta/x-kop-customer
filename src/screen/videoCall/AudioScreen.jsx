import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Svg, {Path} from 'react-native-svg';

import {
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  createAgoraRtcEngine,
} from 'react-native-agora';
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
  SVG_stop_camera,
  SVG_switch_camera,
  SVG_unmute_mic,
} from '../../utils/SVGImage.js';
import {useWebSocket} from '../../shared/WebSocketProvider.jsx';
import ChatModal from '../../Components/chat/ChatModal.jsx';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/CustomModal.jsx';
import {navigate} from '../../navigation/NavigationService.js';
import {useCall} from '../../context/callContext.js';
import {useCallDuration} from '../../shared/CallDurationContext.js';

const {width, height} = Dimensions.get('window');

const AudioScreen = ({route, navigation}) => {
  const configuration = route.params || {};
  const {webSocket, leave} = useWebSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  // const [peerIds, setPeerIds] = useState([]);
  const [modelChat, setModelChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // const [callDuration, setCallDuration] = useState('00:00:00');
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCameraOn, setCameraOn] = useState(true);

  const {callDuration, isBalanceEnough} = useCallDuration();

  const {
    startCall,
    endCall: contextEndCall,
    engine,
    isJoined,
    peerIds,
    switchToVideoCall: swichVideo,
    switchToAudioCall,
    isVideoEnabled,
  } = useCall();

  useEffect(() => {
    if (isJoined) {
      setConnectionStatus('Connected');

      console.log('connected', isJoined);
    }
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
      console.log(configuration, 'Calling startCall...');
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

    swichVideo();
  };

  useEffect(() => {
    webSocket.on('newVideoCall', createTwoButtonAlert);
    webSocket.on('VideoCallAnswered', async () => {
      swichVideo();
    });
    return () => {
      webSocket.off('newVideoCall', createTwoButtonAlert);
      webSocket.off('VideoCallAnswered');
    };
  }, [webSocket, engine, createTwoButtonAlert, navigation, configuration]);

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
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (isBalanceEnough) {
      setShowModal(true);

      const timeout = setTimeout(() => {
        setShowModal(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isBalanceEnough]);

  const handleNavigateToWallet = () => {
    setShowModal(false);
    navigation.navigate('WalletScreen');
  };

  const handleModalClose = () => {
    setShowModal(false);
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

  const toggleCamera = () => {
    if (isCameraOn) {
      engine.current?.enableLocalVideo(false);
      engine.current?.muteLocalVideoStream(true);
    } else {
      engine.current?.enableLocalVideo(true);
      engine.current?.muteLocalVideoStream(false);
    }
    setCameraOn(prev => !prev);
  };

  const switchCamera = () => {
    +engine.current?.switchCamera();
  };

  const _renderVideos = () => (
    <View style={styles.fullView}>
      <View style={styles.splitContainer}>
        <View style={styles.remoteContainer}>
          <View style={styles.counterContainerVideo}>
            <Text style={styles.callDurationVideo}>
              {callDuration} mins left
            </Text>
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
              <Path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-86.4-67.7 13.8 9.2c9.8 6.5 22.4 7.2 32.9 1.6s16.9-16.4 16.9-28.2v-256c0-11.8-6.5-22.6-16.9-28.2s-23-5-32.9 1.6l-96 64L448 174.9v17.1v128v5.8l-32-25.1L416 128c0-35.3-28.7-64-64-64H113.9L38.8 5.1zM407 416.7L32.3 121.5c-.2 2.1-.3 4.3-.3 6.5v256c0 35.3 28.7 64 64 64h256c23.4 0 43.9-12.6 55-31.3z" />
            </Svg>
            <Text style={styles.cameraOffText}>Camera is off</Text>
          </View>
        )}
      </View>
      {/* Add Cross Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigate('LayoutScreen')}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="#fff">
          <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </Svg>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      {/* {console.log('hello', isVideoEnabled.current)} */}
      {console.log('Call Mode (isVideoEnabled):', isVideoEnabled?.current)}

      {isVideoEnabled.current === 'AUDIO' ? (
        <View style={styles.container}>
          {connectionStatus !== 'Connected' ? (
            <Text style={styles.connectionStatus}>{connectionStatus}</Text>
          ) : (
            <View style={styles.mainContent}>
              <View style={styles.endCallButton}>
                <TouchableOpacity onPress={() => navigate('LayoutScreen')}>
                  <SvgXml xml={SVG_arrow_back} width={30} height={30} />
                </TouchableOpacity>
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
                  <Text style={styles.name}>
                    {configuration?.reciever_data?.userInfo?.name}
                  </Text>
                  <Text style={styles.title}>General Offences</Text>
                  <Text style={styles.status}>Call in Progress</Text>
                  <View style={styles.counterContainerAudio}>
                    <Text style={styles.callDuration}>
                      {callDuration} mins left
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={switchToVideoCall}>
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
                  onPress={
                    isRecording ? stopRecording : confirmAndStartRecording
                  }>
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
            isVisible={showVideoCallModal}
            onClose={handleVideoCallModalClose}
            message="Requesting for Video Call"
            buttons={[
              {
                label: 'Cancel',
                onPress: handleVideoCallModalClose,
                color: 'gray',
              },
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
      ) : (
        <View style={styles.max}>
          {isJoined && _renderVideos()}
          <View style={styles.buttonHolder}>
            <TouchableOpacity onPress={toggleMute} style={styles.Videobutton}>
              {isMuted ? (
                <SvgXml xml={SVG_mute_mic} />
              ) : (
                <SvgXml xml={SVG_unmute_mic} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={switchCamera} style={styles.Videobutton}>
              <SvgXml xml={SVG_switch_camera} />
            </TouchableOpacity>
            <TouchableOpacity onPress={endCall} style={styles.Videobutton}>
              <SvgXml xml={SVG_hangout_red} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCamera} style={styles.Videobutton}>
              <SvgXml xml={SVG_stop_camera} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Videobutton}
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
            <TouchableOpacity
              onPress={toggleSpeaker}
              style={styles.Videobutton}>
              {isSpeakerEnabled ? (
                <SvgXml xml={SVG_speaker} />
              ) : (
                <SvgXml xml={SVG_speakeroff} />
              )}
            </TouchableOpacity>
          </View>
          {chatModal}
        </View>
      )}
    </>
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
  splitContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  localContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  local: {
    width: '100%',
    height: '100%',
  },
  remoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  remote: {
    width: '100%',
    height: '100%',
  },
  counterContainerVideo: {
    position: 'absolute',
    top: 10,
    left: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 10,
  },
  callDurationVideo: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'medium',
  },
  buttonHolder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'gray',
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

  Videobutton: {
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
    color: 'black',
  },
  localContainer2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraOffText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
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
  counterContainerAudio: {
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
