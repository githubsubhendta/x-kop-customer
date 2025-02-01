import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {RtcSurfaceView} from 'react-native-agora';
import useAgoraEngine from '../../hooks/useAgoraEngine';
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

const AudioScreen = ({route, navigation}) => {
  const {config, mobile, reciever_data, consultType} = route.params || {};
  const [showModal, setShowModal] = useState(false);

  const {webSocket, leave} = useWebSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [peerIds, setPeerIds] = useState([]);

  let callDurationInterval;
  let callMinUpdate;
  const [modelChat, setModelChat] = useState(false);
  const [callStatus, setCallStatus] = useState(true);
  const {callDuration, startCall, stopCall, isBalanceEnough, isBalanceZero} =
    useCallDuration();

  const startTime = new Date(reciever_data.consultationData.startCallTime);

  const {conversations} = useChatStore();

  useEffect(() => {
    startCall(startTime, consultType, reciever_data.userInfo.mobile, webSocket);
    return () => {
      stopCall();
    };
  }, [webSocket]);

  const {engine, isJoined} = useAgoraEngine(
    config,
    () => setConnectionStatus('Connected'),
    Uid => {
      if (!peerIds.includes(Uid)) {
        setPeerIds(prev => [...prev, Uid]);
      }
    },
    Uid => {
      setPeerIds(prev => prev.filter(id => id !== Uid));
    },
    () => setConnectionStatus('Not Connected'),
  );

  const toggleMute = useCallback(async () => {
    if (engine.current) {
      await engine.current.muteLocalAudioStream(!isMuted);
      setIsMuted(prev => !prev);
    }
  }, [isMuted, engine]);

  const toggleSpeaker = useCallback(async () => {
    if (engine.current) {
      await engine.current.setEnableSpeakerphone(!isSpeakerEnabled);
      setIsSpeakerEnabled(prev => !prev);
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
  }, [engine, webSocket, mobile, navigation]);

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
    Alert.alert('Call', 'Requesting for Video Call', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          webSocket.emit('VideoCallanswerCall', {callerId: mobile});
          await engine.current?.leaveChannel();
          setTimeout(() => {
            navigation.navigate('VideoCallScreen', {config, mobile});
          }, 300);
        },
      },
    ]);
  };

  useEffect(() => {
    webSocket.on('newVideoCall', createTwoButtonAlert);
    webSocket.on('VideoCallAnswered', async () => {
      await engine.current?.leaveChannel();
      navigation.navigate('VideoCallScreen', {config, mobile});
    });
    return () => {
      webSocket.off('newVideoCall', createTwoButtonAlert);
      webSocket.off('VideoCallAnswered', async () => {
        await engine.current?.leaveChannel();
        navigation.navigate('VideoCallScreen', {config, mobile});
      });
    };
  }, [webSocket, engine, createTwoButtonAlert, navigation, config, mobile]);

  // useEffect(() => {
  //   const handleCallDurationUpdate = (data) => {
  //     console.log("check callDuration==>",data.callDuration)
  //   };

  //   webSocket.on('updateCallDuration', handleCallDurationUpdate);
  //   return () => {
  //     webSocket.off('updateCallDuration', handleCallDurationUpdate);
  //   };
  // }, [webSocket, endCall]);

  useEffect(() => {
    if (isBalanceZero) {
      endCall();
    }
  }, [isBalanceZero]);

  useEffect(() => {
    if (isBalanceEnough) {
      setShowModal(true); 

      const timeout = setTimeout(() => {
        setShowModal(false); 
      }, 5000);
  
      return () => clearTimeout(timeout);
      // Alert.alert('Your balance is not enough', '', [
      //   {
      //     text: 'Cancel',
      //     onPress: () => console.log('Balance alert dismissed'),
      //   },
      //   {
      //     text: 'Go to Wallet',
      //     onPress: () => , // Open modal to navigate to wallet
      //   },
      // ]);
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
    setShowModal(false); // Close modal before navigating
    navigation.navigate('WalletScreen'); // Navigate to wallet screen
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
                <SvgXml xml={SVG_speaker} />
              ) : (
                <SvgXml xml={SVG_speakeroff} />
              )}
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
            {/* Attach File Button */}
            <View style={styles.iconButton}>
              <Icon name="attach-file" size={24} color="#888" />
            </View>
            <View style={styles.iconButton}>
              <Icon name="send" size={24} color="#888" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {/* <ChatModal chatId={reciever_data?.chatId} isVisible={modelChat} onClose={()=>setModelChat(false)} /> */}
      {chatModal}

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Your balance is not enough. Please add more funds.
            </Text>
            <View className="flex flex-row justify-center space-x-4">
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
    // flex: 1,
    fontSize: 16,
    color: '#000',
    width: 'auto',
  },
  iconsContainer: {
    flexDirection: 'row',
    // width:"100%",
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
