// import {View, Text, StatusBar, TouchableOpacity, TextInput} from 'react-native';
// import React, {useState, useEffect, useCallback, useRef} from 'react';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {SvgXml} from 'react-native-svg';
// import {
//   SVG_find_person,
//   SVG_hangout_white,
//   SVG_mic_white,
// } from '../utils/SVGImage';
// import userStoreAction from '../stores/user.store';
// import useHttpRequest from '../hooks/useHttpRequest';

// import {useWebSocket} from '../shared/WebSocketProvider';

// const FindAnOfficerScreen = ({route, navigation}) => {
//   const recieve_params = route.params;
//   const {user} = userStoreAction(state => state);
//   const {webSocket, callRedirect} = useWebSocket();
//   const [mobile, setMobile] = useState('');
//   const {loading, error, data, fetchData} = useHttpRequest();
//   const tokenData = useRef(null);
//   const [officerNotAvailable, setOfficerNotAvailable] = useState(false);

//   useEffect(() => {
//     const now = new Date();
//     const later = new Date(now);
//     later.setTime(now.getTime() + 10 * 60 * 1000);
//     if (recieve_params?.ConsultationTypeName) {
//       fetchData('/officer_schedule/find-officer', 'POST', {
//         startTime: now.toISOString(),
//         endTime: later.toISOString(),
//         consultationTypeName: recieve_params.ConsultationTypeName,
//       });
//     }
//   }, [recieve_params]);

//   const handleCallStart = useCallback(() => {
//     if (mobile.trim() && !data.data.mobile != undefined) {
//       fetchData('/token/agora_token', 'POST', {
//         channelName: `${user.mobile}-${mobile}`,
//         uid: 0,
//       });
//     }
//   }, [mobile, data, user.mobile, fetchData]);

//   // useEffect(() => {
//   //   if (data?.data?.mobile != undefined) {
//   //     setMobile(data?.data?.mobile);
//   //   } else {
//   //     if (data) {
//   //       webSocket.emit('call', {
//   //         calleeId: mobile,
//   //         rtcMessage: data.data,
//   //         consultationTypeName: recieve_params.ConsultationTypeName,
//   //       });

//   //       // tokenData.current = {data: data?.data, mobile};

//   //       tokenData.current = {
//   //         token: data.data.token,
//   //         channelName: data.data.channelName,
//   //         uid: data.data.uid ?? 0,
//   //         mobile: mobile,
//   //       };
//   //     }
//   //   }
//   // }, [data, mobile, webSocket]);

//   useEffect(() => {
//     if (!data?.data) return;

//     const hasMobile = data.data.mobile !== undefined;

//     if (hasMobile) {
//       // Just update the mobile number
//       setMobile(data.data.mobile);
//     } else if (data.data.token && mobile) {
//       // Now that token is ready, emit the call
//       const tokenInfo = {
//         token: data.data.token,
//         channelName: data.data.channelName,
//         uid: data.data.uid ?? 0,
//         mobile: mobile,
//       };

//       tokenData.current = tokenInfo;

//       webSocket.emit('call', {
//         calleeId: mobile,
//         rtcMessage: tokenInfo,
//         consultationTypeName: recieve_params.ConsultationTypeName,
//       });
//     }
//   }, [data, mobile]);

//   // useEffect(() => {
//   //   if (mobile) {
//   //     handleCallStart();
//   //   }
//   // }, [mobile]);

//   useEffect(() => {
//     if (mobile) {
//       fetchData('/token/agora_token', 'POST', {
//         channelName: `${user.mobile}-${mobile}`,
//         uid: 0,
//       });
//     }
//   }, [mobile]);

//   useEffect(() => {
//     if (webSocket) {
//       const handleAudioScreen = dataSet => {
//         callRedirect(dataSet, tokenData, recieve_params);
//       };
//       webSocket.on('callAnswered', handleAudioScreen);
//       return () => {
//         webSocket.off('callAnswered', handleAudioScreen);
//       };
//     }
//   }, [webSocket, navigation]);

//   useEffect(() => {
//     if (error) {
//       console.log('error==>', error);
//       navigation.goBack();
//     }
//   }, [error]);

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <View className="flex justify-center h-[50vh]">
//         <View className="m-auto">
//           <View className="relative">
//             <View className="bg-rose-200 w-4 h-4 rounded-full -bottom-32 left-0" />
//           </View>
//           <View className="w-40">
//             <SvgXml xml={SVG_find_person} height={'100%'} width={'100%'} />
//           </View>
//           <View className="relative">
//             <View className="bg-rose-200 w-4 h-4 rounded-full absolute -top-32 right-0" />
//           </View>
//         </View>
//       </View>
//       <View className="flex flex-row justify-center">
//         <Text className="text-primary text-[24px] font-medium">
//           Finding An Officer
//         </Text>
//       </View>
//       <View className="flex flex-row justify-center px-10 pb-4">
//         <Text className="text-[#677294] text-base font-normal text-center">
//           Standby while we connect you to your expert
//         </Text>
//       </View>

//       {/* <View className="flex flex-row justify-center">
//         <TextInput
//           className="py-3 pl-2 text-[#677294] border w-[80%] rounded-lg"
//           onChangeText={setMobile}
//           value={mobile}
//           keyboardType="numeric"
//           placeholder="Mobile Number"
//           placeholderTextColor="#9CA3AF"
//           onFocus={() => error && alert('Error: ' + error.message)}
//         />
//       </View> */}

//       <View className="flex flex-row justify-center mt-[40%]">
//         <View className="bg-[#8E8284] p-4 rounded-full mx-2">
//           <SvgXml
//             xml={SVG_hangout_white}
//             height={'40px'}
//             width={'40px'}
//             className="m-auto"
//           />
//         </View>
//         <View
//           // onPress={handleCallStart}
//           className="p-4 rounded-full mx-2 bg-[#8E8284]"
//           // disabled={loading}
//         >
//           <SvgXml
//             xml={SVG_mic_white}
//             height={'40px'}
//             width={'40px'}
//             className="m-auto"
//           />
//         </View>
//       </View>
//       <View className="flex flex-row justify-center mt-4">
//         <Text className="text-black text-sm font-medium">
//           Your microphone is connected
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default FindAnOfficerScreen;

import {View, Text, StatusBar} from 'react-native';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import {
  SVG_find_person,
  SVG_hangout_white,
  SVG_mic_white,
} from '../utils/SVGImage';
import userStoreAction from '../stores/user.store';
import useHttpRequest from '../hooks/useHttpRequest';
import {useWebSocket} from '../shared/WebSocketProvider';

const FindAnOfficerScreen = ({route, navigation}) => {
  const {user} = userStoreAction(state => state);
  const {webSocket, callRedirect} = useWebSocket();
  const recieve_params = route.params;

  const [mobile, setMobile] = useState('');
  const {loading, error, data, fetchData} = useHttpRequest();
  const tokenData = useRef(null);

  useEffect(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 10 * 60 * 1000);

    if (recieve_params?.ConsultationTypeName) {
      fetchData('/officer_schedule/find-officer', 'POST', {
        startTime: now.toISOString(),
        endTime: later.toISOString(),
        consultationTypeName: recieve_params.ConsultationTypeName,
      });
    }
  }, [recieve_params]);

  useEffect(() => {
    if (data?.data?.mobile) {
      setMobile(data.data.mobile);
    }
  }, [data]);

  useEffect(() => {
    if (mobile) {
      const channelName = `${user.mobile}-${mobile}`;
      fetchData('/token/agora_token', 'POST', {
        channelName,
        uid: 0,
      });
    }
  }, [mobile]);

  useEffect(() => {
    const rtcMessage = data?.data;
    if (webSocket && rtcMessage?.token && mobile) {
      const tokenInfo = {
        token: rtcMessage.token,
        channelName: rtcMessage.channelName,
        uid: rtcMessage.uid ?? 0,
        mobile,
        current: new Date().toISOString(),
      };

      tokenData.current = tokenInfo;

      webSocket.emit('call', {
        calleeId: mobile,
        rtcMessage: tokenInfo,
        consultationTypeName: recieve_params.ConsultationTypeName,
      });
    }
  }, [data, mobile, webSocket]);

  useEffect(() => {
    const handleAudioScreen = dataSet => {
      callRedirect(dataSet, tokenData.current, recieve_params);
    };

    webSocket?.on('callAnswered', handleAudioScreen);
    return () => webSocket?.off('callAnswered', handleAudioScreen);
  }, [webSocket]);

  useEffect(() => {
    if (error) {
      console.log('Error finding officer:', error);
      navigation.goBack();
    }
  }, [error]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View className="flex justify-center h-[50vh]">
        <View className="m-auto">
          <View className="relative">
            <View className="bg-rose-200 w-4 h-4 rounded-full -bottom-32 left-0" />
          </View>
          <View className="w-40">
            <SvgXml xml={SVG_find_person} height={'100%'} width={'100%'} />
          </View>
          <View className="relative">
            <View className="bg-rose-200 w-4 h-4 rounded-full absolute -top-32 right-0" />
          </View>
        </View>
      </View>
      <View className="flex flex-row justify-center">
        <Text className="text-primary text-[24px] font-medium">
          Finding An Officer
        </Text>
      </View>
      <View className="flex flex-row justify-center px-10 pb-4">
        <Text className="text-[#677294] text-base font-normal text-center">
          Standby while we connect you to your expert
        </Text>
      </View>

      <View className="flex flex-row justify-center mt-[40%]">
        <View className="bg-[#8E8284] p-4 rounded-full mx-2">
          <SvgXml xml={SVG_hangout_white} height={'40px'} width={'40px'} />
        </View>
        <View className="p-4 rounded-full mx-2 bg-[#8E8284]">
          <SvgXml xml={SVG_mic_white} height={'40px'} width={'40px'} />
        </View>
      </View>
      <View className="flex flex-row justify-center mt-4">
        <Text className="text-black text-sm font-medium">
          Your microphone is connected
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default FindAnOfficerScreen;
