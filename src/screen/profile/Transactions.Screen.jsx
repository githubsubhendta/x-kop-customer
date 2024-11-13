// import React, { useEffect } from 'react';
// import { View, Text, SafeAreaView, TouchableOpacity, FlatList, PermissionsAndroid, Alert, ActivityIndicator, Image, Platform } from 'react-native';
// import { SvgXml } from 'react-native-svg';
// import RNFetchBlob from 'react-native-blob-util';
// import useUserStore from '../../stores/user.store.js';
// import { SVG_arrow_back, SVG_download } from '../../utils/SVGImage.js';
// import { BASE_URI } from '../../Api/ApiManager.js';

// const TransactionsScreen = ({ navigation }) => {
//   const { user } = useUserStore();
//   const [loading, setLoading] = React.useState(false); 

//   const requestCameraPermission = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//         {
//           title: 'Cool Photo App Camera Permission',
//           message:
//             'Cool Photo App needs access to your camera ' +
//             'so you can take awesome pictures.',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('You can use the camera');
//       } else {
//         console.log('Camera permission denied');
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   // useEffect(()=>{
//   //   requestCameraPermission();
//   // },[])

//   const downloadSlip = async (transactionId) => {
//     try {
//       // const hasPermission = await requestStoragePermission();
//       // if (!hasPermission) {
//       //   Alert.alert('Permission Denied', 'You need to give permission to download the file.');
//       //   return;
//       // }

//       console.log("Downloading transaction ID:", transactionId);
//       const { dirs } = RNFetchBlob.fs;
//       const path = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir; 
//       const filePath = `${path}/transaction-${transactionId}.pdf`;

//       setLoading(true); 
//       const response = await RNFetchBlob.config({
//         path: filePath, 
//         fileCache: true, 
//       }).fetch('GET', `${BASE_URI}/payment/download/${transactionId}`);

//       if (response.respInfo.status === 200) {
//         console.log('File saved successfully at:', filePath);
//         RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf'); 
//       } else {
//         Alert.alert('Download Failed', 'Failed to download PDF. Please try again later.');
//       }
//     } catch (error) {
//       console.error('Error downloading PDF:', error);
//       Alert.alert('Error', 'Failed to download PDF. Please try again later.');
//     } finally {
//       setLoading(false); 
//     }
//   };

//   const itemRender = ({ item }) => (
//     <View className="flex flex-row justify-between p-2 border-b-2 border-slate-200 my-2">
//       <View className="flex flex-row gap-10">
//         <View className="w-[50px] h-[50px] rounded-full">
//           <Image source={{ uri: user.avatar }} className="w-[100%] h-[100%] rounded-full" />
//         </View>
//         <View>
//           <Text className="text-slate-600">{user.name}</Text>
//           <View className="flex flex-row w-52 justify-between">
//             <Text className="text-slate-600">Paid Via: {item.method}</Text>
//             <Text className="text-slate-600">Rs: {item.amount}</Text>
//           </View>
//         </View>
//       </View>
//       <View className="flex flex-col justify-center">
//         <TouchableOpacity className="w-8 h-8 flex justify-start" onPress={() => downloadSlip(item._id)}>
//           <SvgXml xml={SVG_download} height={"100%"} width={"100%"} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View className="flex-1">
//       <View className="p-5">
//         <TouchableOpacity className="w-10 h-10 flex justify-start mb-5" onPress={() => navigation.goBack()}>
//           <SvgXml xml={SVG_arrow_back} height={"100%"} width={"100%"} />
//         </TouchableOpacity>

//         <View className="p-2">
//           <Text className="text-orange-900 font-bold text-3xl">Transactions</Text>
//         </View>
//       </View>
//       <View className="px-7">
//         <Text className="text-slate-500 text-xl">Previous Receipts</Text>
//       </View>
//       <View className="bg-slate-300 h-[1px] my-3" />
//       <View className="py-10 px-5">
//         {user?.transactions.length > 0 && (
//           <FlatList
//             data={user?.transactions}
//             renderItem={itemRender}
//             keyExtractor={item => item._id}
//             style={{marginBottom:200}}
//           />
//         )}
//       </View>
//       {loading && (
//         <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }] }}>
//           <ActivityIndicator size="large" color="#0000ff" />
//         </View>
//       )}
//     </View>
//   );
// };

// export default TransactionsScreen;


import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, PermissionsAndroid, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import RNFetchBlob from 'react-native-blob-util';
import { SVG_arrow_back, SVG_download } from '../../utils/SVGImage.js';
import { BASE_URI } from '../../Api/ApiManager.js';
import { useBankPaymentList } from '../../Api/backPaymentService.js';

const TransactionsScreen = ({ navigation }) => {
  const { loading, error, paymentList, loadMore, hasMore } = useBankPaymentList();

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permission Required',
          message: 'This app needs storage permission to download receipts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const downloadSlip = async (transactionId) => {
    try {
      const { dirs } = RNFetchBlob.fs;
      const path = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir; 
      const filePath = `${path}/transaction-${transactionId}.pdf`;

      const response = await RNFetchBlob.config({
        path: filePath,
        fileCache: true,
      }).fetch('GET', `${BASE_URI}/payment/download/${transactionId}`);

      if (response.respInfo.status === 200) {
        console.log('File saved at:', filePath);
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf'); 
      } else {
        Alert.alert('Download Failed', 'Unable to download PDF.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Unable to download PDF.');
    }
  };

  const renderItem = ({ item }) => (
    <View className="flex flex-row justify-between p-2 border-b-2 border-slate-200 my-2">
      <View className="flex flex-row gap-10">
        <View className="w-[50px] h-[50px] rounded-full">
          <Image source={{ uri: item.userId.avatar }} className="w-[100%] h-[100%] rounded-full" />
        </View>
        <View>
          <Text className="text-slate-600">{item.userId.name}</Text>
          <View className="flex flex-row w-52 justify-between">
            <Text className="text-slate-600">Paid Via: {item.method}</Text>
            <Text className="text-slate-600">Rs: {item.amount}</Text>
          </View>
        </View>
      </View>
      <View className="flex flex-col justify-center">
        <TouchableOpacity className="w-8 h-8 flex justify-start" onPress={() => downloadSlip(item._id)}>
          <SvgXml xml={SVG_download} height={"100%"} width={"100%"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <View className="p-5">
        <TouchableOpacity className="w-10 h-10 flex justify-start mb-5" onPress={() => navigation.goBack()}>
          <SvgXml xml={SVG_arrow_back} height={"100%"} width={"100%"} />
        </TouchableOpacity>
        <View className="p-2">
          <Text className="text-orange-900 font-bold text-3xl">Transactions</Text>
        </View>
      </View>
      <View className="px-7">
        <Text className="text-slate-500 text-xl">Previous Receipts</Text>
      </View>
      <View className="bg-slate-300 h-[1px] my-3" />
  
      <View className="py-10 px-5">
      <FlatList
  data={paymentList}
  renderItem={renderItem}
  keyExtractor={(item, index) => `${item._id}-${index}`}  // Combine _id and index
  onEndReached={hasMore ? loadMore : null}
  onEndReachedThreshold={0.5}
  // ListFooterComponent={loading && <ActivityIndicator size="large" color="#0000ff" />}
  style={{ marginBottom: 200 }}
/>
      </View>
      {loading && (
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }] }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

export default TransactionsScreen;

