import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { ChannelProfileType, ClientRoleType, RtcSurfaceView, createAgoraRtcEngine } from 'react-native-agora';
import requestCameraAndAudioPermission from '../../Components/permissions.js';
import { SvgXml } from 'react-native-svg';
import { SVG_hangout_red, SVG_mute_mic, SVG_speaker, SVG_speakeroff, SVG_stop_camera, SVG_switch_camera, SVG_unmute_mic } from '../../utils/SVGImage.js';
import { useWebSocket } from '../../shared/WebSocketProvider.jsx';

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

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('Permissions requested!');
      });
    }

    if (!config || !config.channelName || !config.token || typeof config.uid !== 'number') {
      console.error('Invalid config parameters');
      navigation.goBack();
      return;
    }

    init();

    return () => {
      endCall();
    };
  }, []);

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
          showMessage('Remote user joined with uid' + Uid);
          setPeerIds(prev => [...prev, Uid]);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setPeerIds(prev => prev.filter(id => id !== Uid));
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
      startCall();
    } catch (error) {
      console.error('Error initializing Agora Engine:', error);
      showMessage('Error initializing Agora Engine: ' + error);
    }
  };

  const startCall = async () => {
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
    if (webSocket) {
      webSocket.on('appyHandsup', data => {
        navigation.navigate("FindAnOfficerScreen");
      });
    }
  }, [webSocket]);

  const endCall = async () => {
    try {
      if (_engine.current) {
        console.log("check stop video call using ===mobile==>", mobile);
        await _engine.current.leaveChannel();
        _engine.current.removeAllListeners();
        _engine.current.release();
        webSocket.emit('handsup', { otherUserId: mobile });
        navigation.navigate('FindAnOfficerScreen');
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
    setMicOn(prev => !prev);
  };

  const switchCamera = () => {
    _engine.current?.switchCamera();
  };

  const toggleCamera = () => {
    _engine.current?.enableLocalVideo(!isCameraOn);
    setCameraOn(prev => !prev);
  };

  const toggleSpeaker = () => {
    _engine.current?.setEnableSpeakerphone(!isSpeakerOn);
    setSpeakerOn(prev => !prev);
  };

  const showMessage = message => {
    console.log(message);
  };

  const _renderRemoteVideos = () => {
    if (peerIds.length > 0) {
      const id = peerIds[0];
      return <RtcSurfaceView style={styles.remote} canvas={{ uid: id }} key={id} />;
    } else {
      return <Text style={styles.text}>No remote video</Text>;
    }
  };

  const _renderVideos = () => (
    <View style={styles.fullView}>
      <View style={styles.remoteContainer}>
        {_renderRemoteVideos()}
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
        <TouchableOpacity onPress={endCall}>
          <SvgXml xml={SVG_hangout_red} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMic}>
          {isMicOn ? <SvgXml xml={SVG_mute_mic} /> : <SvgXml xml={SVG_unmute_mic} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={switchCamera}>
          <SvgXml xml={SVG_switch_camera} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCamera}>
          {isCameraOn ? <SvgXml xml={SVG_stop_camera} /> : <SvgXml xml={SVG_switch_camera} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSpeaker}>
          {isSpeakerOn ? <SvgXml xml={SVG_speaker} /> : <SvgXml xml={SVG_speakeroff} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  max: {
    flex: 1,
  },
  fullView: {
    flex: 1,
    position: 'relative',
  },
  localContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 100,
    height: 150,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  local: {
    width: '100%',
    height: '100%',
  },
  remoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remote: {
    width: width - 20,
    height: height / 2,
    borderRadius: 10,
  },
  buttonHolder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  text: {
    color: 'black',
  },
});

export default VideoCallScreen;
