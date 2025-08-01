// import React, {useEffect, useState, useRef} from 'react';
// import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
// import userStoreAction from '../stores/user.store';
// import useHttpRequest from '../hooks/useHttpRequest';
// import {useWebSocket} from '../shared/WebSocketProvider';

// const RequestMeetingScreen = ({route, navigation}) => {
//   const {ConsultationTypeName, officerMobile, scheduleId} = route.params;
//   const {user} = userStoreAction(state => state);
//   const {webSocket, callRedirect} = useWebSocket();
//   const {loading, error, data, fetchData} = useHttpRequest();
//   const tokenData = useRef(null);
//   const [requesting, setRequesting] = useState(true);
//   const emittedRef = useRef(false);

//   useEffect(() => {
//     const now = new Date();
//     const later = new Date(now.getTime() + 10 * 60 * 1000);

//     fetchData('/officer_schedule/find-officer', 'POST', {
//       startTime: now.toISOString(),
//       endTime: later.toISOString(),
//       consultationTypeName: ConsultationTypeName,
//     });
//   }, [ConsultationTypeName, fetchData]);

//   useEffect(() => {
//     if (webSocket && data?.data?.mobile && !emittedRef.current) {
//       emittedRef.current = true;

//       webSocket.emit('call', {
//         calleeId: data.data.mobile,
//         rtcMessage: data.data,
//         consultationTypeName: ConsultationTypeName,
//       });

//       tokenData.current = {data: data.data, mobile: data.data.mobile};
//     }
//   }, [data, ConsultationTypeName, webSocket]);

//   useEffect(() => {
//   if (webSocket) {
//     const handleCallAnswered = dataSet => {
//       console.log('📞 callAnswered received, tokenData is:', tokenData.current);
//       setRequesting(false);
//       callRedirect(dataSet, tokenData.current, {
//         ConsultationTypeName,
//         officerMobile,
//         scheduleId,
//       });
//     };
//     webSocket.on('callAnswered', handleCallAnswered);
//     return () => {
//       webSocket.off('callAnswered', handleCallAnswered);
//     };
//   }
// }, [webSocket, callRedirect, ConsultationTypeName, officerMobile, scheduleId]);

//   useEffect(() => {
//     if (error) {
//       navigation.goBack();
//     }
//   }, [error, navigation]);

//   return (
//     <View style={styles.container}>
//       {requesting ? (
//         <>
//           <ActivityIndicator size="large" color="#36D158" />
//           <Text style={styles.text}>Requesting the meeting...</Text>
//         </>
//       ) : (
//         <Text style={styles.text}>Call connected!</Text>
//       )}
//     </View>
//   );
// };

// export default RequestMeetingScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   text: {marginTop: 20, fontSize: 16, color: '#222'},
// });

// import React, {useEffect, useState, useRef} from 'react';
// import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
// import userStoreAction from '../stores/user.store';
// import useHttpRequest from '../hooks/useHttpRequest';
// import {useWebSocket} from '../shared/WebSocketProvider';

// const RequestMeetingScreen = ({route, navigation}) => {
//   const {ConsultationTypeName, officerMobile, scheduleId} = route.params;
//   const {user} = userStoreAction(state => state);
//   const {webSocket, callRedirect} = useWebSocket();
//   const {loading, error, data, fetchData} = useHttpRequest();

//   const emittedRef = useRef(false);
//   const tokenData = useRef(null);
//   const [requesting, setRequesting] = useState(true);

//   // ✅ Fetch officer based on consultation type and time
//   useEffect(() => {
//     const now = new Date();
//     const later = new Date(now.getTime() + 10 * 60 * 1000);

//     fetchData('/officer_schedule/find-officer', 'POST', {
//       startTime: now.toISOString(),
//       endTime: later.toISOString(),
//       consultationTypeName: ConsultationTypeName,
//     });
//   }, [ConsultationTypeName]);

//   // ✅ Emit call only once when data is received
//   useEffect(() => {
//     const mobile = data?.data?.mobile;

//     // Ensure: 1. WebSocket exists, 2. Data is available, 3. Officer matches, 4. Not already emitted
//     if (
//       webSocket &&
//       mobile &&
//       mobile === officerMobile &&
//       !emittedRef.current
//     ) {
//       emittedRef.current = true;

//       webSocket.emit('call', {
//         calleeId: mobile,
//         rtcMessage: data.data,
//         consultationTypeName: ConsultationTypeName,
//       });

//       tokenData.current = {data: data.data, mobile};
//     }
//   }, [data?.data?.mobile, officerMobile, webSocket, ConsultationTypeName]);

//   // ✅ Handle call answered
//   useEffect(() => {
//     if (!webSocket) return;

//     console.log("🟢 WebSocket is ready, setting up 'callAnswered' handler");

//     const handleCallAnswered = dataSet => {
//       console.log('📞 Call Answered', dataSet);
//       setRequesting(false);

//       if (!tokenData.current) {
//         console.warn('⚠️ tokenData.current is null in callAnswered');
//         return;
//       }

//       callRedirect(dataSet, tokenData.current, {
//         ConsultationTypeName,
//         officerMobile,
//         scheduleId,
//       });
//     };

//     webSocket.on('callAnswered', handleCallAnswered);
//     return () => {
//       webSocket.off('callAnswered', handleCallAnswered);
//     };
//   }, [webSocket, callRedirect]);

//   // ✅ Handle any request error
//   useEffect(() => {
//     if (error) {
//       console.error('Error fetching officer:', error);
//       navigation.goBack();
//     }
//   }, [error, navigation]);

//   return (
//     <View style={styles.container}>
//       {requesting ? (
//         <>
//           <ActivityIndicator size="large" color="#36D158" />
//           <Text style={styles.text}>Requesting the meeting...</Text>
//         </>
//       ) : (
//         <Text style={styles.text}>Call connected!</Text>
//       )}
//     </View>
//   );
// };

// export default RequestMeetingScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   text: {
//     marginTop: 20,
//     fontSize: 16,
//     color: '#222',
//   },
// });

// import React, {useEffect, useState, useRef} from 'react';
// import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
// import userStoreAction from '../stores/user.store';
// import useHttpRequest from '../hooks/useHttpRequest';
// import {useWebSocket} from '../shared/WebSocketProvider';

// const RequestMeetingScreen = ({route, navigation}) => {
//   const {ConsultationTypeName, officerMobile, scheduleId} = route.params;
//   const {user} = userStoreAction(state => state);
//   const {webSocket, callRedirect} = useWebSocket();

//   const {
//     fetchData: fetchOfficer,
//     data: officerData,
//     error: officerError,
//   } = useHttpRequest();
//   const {
//     fetchData: fetchToken,
//     data: tokenResponse,
//     error: tokenError,
//   } = useHttpRequest();

//   const [requesting, setRequesting] = useState(true);
//   const emittedRef = useRef(false);
//   const tokenData = useRef(null);
//   const officerMobileRef = useRef(null);

//   useEffect(() => {
//     const now = new Date();
//     const later = new Date(now.getTime() + 10 * 60 * 1000);

//     fetchOfficer('/officer_schedule/find-officer', 'POST', {
//       startTime: now.toISOString(),
//       endTime: later.toISOString(),
//       consultationTypeName: ConsultationTypeName,
//     });
//   }, [ConsultationTypeName]);

//   useEffect(() => {
//     const mobile = officerData?.data?.mobile;
//     if (mobile && !emittedRef.current) {
//       officerMobileRef.current = mobile;
//       const channelName = `${user.mobile}-${mobile}`;
//       fetchToken('/token/agora_token', 'POST', {channelName, uid: 0});
//     }
//   }, [officerData]);

//   useEffect(() => {
//     const mobile = officerMobileRef.current;
//     const rtcMessage = tokenResponse?.data;
//     if (webSocket && rtcMessage && mobile && !emittedRef.current) {
//       emittedRef.current = true;

//       webSocket.emit('call', {
//         calleeId: mobile,
//         rtcMessage,
//         consultationTypeName: ConsultationTypeName,
//       });

//       tokenData.current = {
//         token: rtcMessage.token,
//         channelName: rtcMessage.channelName,
//         mobile,
//       };
//     }
//   }, [tokenResponse]);

//   useEffect(() => {
//     if (!webSocket) return;

//     const handleAnswered = dataSet => {
//       console.log('📞 Call Answered', dataSet);
//       setRequesting(false);
//       if (!dataSet?.rtcMessage) {
//         console.warn('⚠️ rtcMessage is missing from server response');
//         return;
//       }

//       const rtcData = {
//         token: dataSet.rtcMessage.token,
//         channelName: dataSet.rtcMessage.channelName,
//         uid: dataSet.rtcMessage.uid ?? 0,
//         mobile: dataSet?.callee || officerMobile,
//       };
//       callRedirect(dataSet, rtcData, {
//         ConsultationTypeName,
//         officerMobile,
//         scheduleId,
//       });
//     };

//     webSocket.on('callAnswered', handleAnswered);
//     return () => webSocket.off('callAnswered', handleAnswered);
//   }, [webSocket, callRedirect]);

//   useEffect(() => {
//     if (officerError || tokenError) {
//       console.error(
//         'Error fetching officer/token:',
//         officerError || tokenError,
//       );
//       navigation.goBack();
//     }
//   }, [officerError, tokenError, navigation]);

//   return (
//     <View style={styles.container}>
//       {requesting ? (
//         <>
//           <ActivityIndicator size="large" color="#36D158" />
//           <Text style={styles.text}>Requesting the meeting...</Text>
//         </>
//       ) : (
//         <Text style={styles.text}>Call connected!</Text>
//       )}
//     </View>
//   );
// };

// export default RequestMeetingScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   text: {marginTop: 20, fontSize: 16, color: '#222'},
// });
 



import React, {useEffect, useState, useRef} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import userStoreAction from '../stores/user.store';
import useHttpRequest from '../hooks/useHttpRequest';
import {useWebSocket} from '../shared/WebSocketProvider';

const RequestMeetingScreen = ({route, navigation}) => {
  const {ConsultationTypeName, officerMobile, scheduleId} = route.params;
  const {user} = userStoreAction(state => state);
  const {webSocket, callRedirect} = useWebSocket();

  const {fetchData: fetchToken, data: tokenResponse, error: tokenError} = useHttpRequest();

  const [requesting, setRequesting] = useState(true);
  const emittedRef = useRef(false);
  const tokenData = useRef(null);

  useEffect(() => {
    if (!officerMobile || !ConsultationTypeName) return;

    const channelName = `${user.mobile}-${officerMobile}`;
    fetchToken('/token/agora_token', 'POST', {
      channelName,
      uid: 0,
    });

    tokenData.current = {channelName, mobile: officerMobile};
  }, [ConsultationTypeName, officerMobile]);

  useEffect(() => {
    const rtcMessage = tokenResponse?.data;
    if (webSocket && rtcMessage && officerMobile && !emittedRef.current) {
      emittedRef.current = true;

      const tokenInfo = {
        token: rtcMessage.token,
        channelName: rtcMessage.channelName,
        uid: rtcMessage.uid ?? 0,
        mobile: officerMobile,
        current: new Date().toISOString(),
      };

      tokenData.current = tokenInfo;

      webSocket.emit('call', {
        calleeId: officerMobile,
        rtcMessage: tokenInfo,
        consultationTypeName: ConsultationTypeName,
      });
    }
  }, [tokenResponse]);

  useEffect(() => {
    const handleAnswered = dataSet => {
      if (!dataSet?.rtcMessage) {
        console.warn('⚠️ rtcMessage missing in server response');
        return;
      }

      const rtcData = {
        token: dataSet.rtcMessage.token,
        channelName: dataSet.rtcMessage.channelName,
        uid: dataSet.rtcMessage.uid ?? 0,
        mobile: officerMobile,
        current: new Date().toISOString(),
      };

      setRequesting(false);
      callRedirect(dataSet, rtcData, {
        ConsultationTypeName,
        officerMobile,
        scheduleId,
      });
    };

    webSocket?.on('callAnswered', handleAnswered);
    return () => webSocket?.off('callAnswered', handleAnswered);
  }, [webSocket, callRedirect]);

  useEffect(() => {
    if (tokenError) {
      console.error('Token error:', tokenError);
      navigation.goBack();
    }
  }, [tokenError, navigation]);

  return (
    <View style={styles.container}>
      {requesting ? (
        <>
          <ActivityIndicator size="large" color="#36D158" />
          <Text style={styles.text}>Requesting the meeting...</Text>
        </>
      ) : (
        <Text style={styles.text}>Call connected!</Text>
      )}
    </View>
  );
};

export default RequestMeetingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#222',
  },
});
