import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, PermissionsAndroid, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import RNFetchBlob from 'react-native-blob-util';
import useUserStore from '../../stores/user.store.js';
import { SVG_arrow_back, SVG_download } from '../../utils/SVGImage.js';

const TransactionsScreen = ({ navigation }) => {
  const { user } = useUserStore();
  const [loading, setLoading] = React.useState(false); 

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
 
        const permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (permission) {
          return true;
        }

    
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; 
    }
  };

  const downloadSlip = async (transactionId) => {
    try {
      // const hasPermission = await requestStoragePermission();
      // if (!hasPermission) {
      //   Alert.alert('Permission Denied', 'You need to give permission to download the file.');
      //   return;
      // }

      console.log("Downloading transaction ID:", transactionId);
      const { dirs } = RNFetchBlob.fs;
      const path = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir; 
      const filePath = `${path}/transaction-${transactionId}.pdf`;

      setLoading(true); 
      const response = await RNFetchBlob.config({
        path: filePath, 
        fileCache: true, 
      }).fetch('GET', `https://b67d-49-36-169-227.ngrok-free.app/api/v1/payment/download/${transactionId}`);

      if (response.respInfo.status === 200) {
        console.log('File saved successfully at:', filePath);
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf'); 
      } else {
        Alert.alert('Download Failed', 'Failed to download PDF. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download PDF. Please try again later.');
    } finally {
      setLoading(false); 
    }
  };

  const itemRender = ({ item }) => (
    <View className="flex flex-row justify-between p-2 border-b-2 border-slate-200 my-2">
      <View className="flex flex-row gap-10">
        <View className="w-[50px] h-[50px] rounded-full">
          <Image source={{ uri: user.avatar }} className="w-[100%] h-[100%] rounded-full" />
        </View>
        <View>
          <Text className="text-slate-600">{user.name}</Text>
          <View className="flex flex-row gap-5">
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
    <SafeAreaView className="flex-1">
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
        {user?.transactions.length > 0 && (
          <FlatList
            data={user?.transactions}
            renderItem={itemRender}
            keyExtractor={item => item._id}
          />
        )}
      </View>
      {loading && (
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }] }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default TransactionsScreen;
