import { useState, useEffect, useRef } from 'react';
import { ChannelProfileType, ClientRoleType, createAgoraRtcEngine } from 'react-native-agora';

const APP_ID = '1be639d040da4a42be10d134055a2abd';

const useAgoraEngine = (config, onJoinSuccess, onUserJoined, onUserOffline, onError) => {
  const engine = useRef(null);
  const [peerIds, setPeerIds] = useState([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!config || !config.channelName || !config.token || typeof config.uid !== 'number') {
      onError(new Error('Invalid config parameters'));
      return;
    }

    const init = async () => {
      try {
        engine.current = createAgoraRtcEngine();
        engine.current.registerEventHandler({
          onJoinChannelSuccess: () => {
            onJoinSuccess(config.channelName);
            setIsJoined(true);
          },
          onUserJoined: (_connection, Uid) => {
            onUserJoined(Uid);
            setPeerIds(prev => [...prev, Uid]);
          },
          onUserOffline: (_connection, Uid) => {
            onUserOffline(Uid);
            setPeerIds(prev => prev.filter(id => id !== Uid));
          },
          onError: err => {
            onError(err);
          },
        });

        engine.current.initialize({
          appId: APP_ID,
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
        });

        if (config.video) {
          engine.current.enableVideo();
          engine.current.startPreview();
        } else {
          engine.current.enableAudio();
          engine.current.disableVideo();
        }

        await engine.current.joinChannel(
          config.token,
          config.channelName,
          config.uid,
          { clientRoleType: ClientRoleType.ClientRoleBroadcaster },
        );
      } catch (error) {
        onError(error);
      }
    };

    init();

    return () => {
      if (engine.current) {
        engine.current.leaveChannel();
        engine.current.release();
        engine.current = null;
      }
    };
  }, [config]);

  return { engine, peerIds, isJoined };
};

export default useAgoraEngine;
