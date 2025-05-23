import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import AddFundsModal from '../../Components/account/AddFundsModal';
import userStoreAction from '../../stores/user.store';
import useHttpRequest from '../../hooks/useHttpRequest';
import {SvgXml} from 'react-native-svg';
import {SVG_arrow_back, SVG_download} from '../../utils/SVGImage';
import {useSnackbar} from '../../shared/SnackbarProvider';
import RNFetchBlob from 'react-native-blob-util';
import {BASE_URI} from '../../Api/ApiManager';
import {useBankPaymentList} from '../../Api/backPaymentService';
import WithdrawModal from './WidthdrawModal';

const WalletScreen = ({navigation}) => {
  const {loading, data} = useHttpRequest();
  // { loading, error, paymentList, loadMore, hasMore }
  const bankHistory = useBankPaymentList();
  const {user, addLoggedInUserAction} = userStoreAction(state => state);
  const [loading1, setLoading1] = React.useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isWithdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const {showSnackbar} = useSnackbar();
  const {dirs} = RNFetchBlob.fs;

  const alertMessage = (message, type) => {
    showSnackbar(message, type);
  };

  useEffect(() => {
    if (data != null) {
      addLoggedInUserAction({...data.data.user}, true);
    }
  }, [data]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-slate-900">Loading...</Text>
      </View>
    );
  }

  const downloadSlip = async transactionId => {
    try {

      console.log('Downloading transaction ID:', transactionId);
      const {dirs} = RNFetchBlob.fs;
      const path = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filePath = `${path}/transaction-${transactionId}.pdf`;

      setLoading1(true);
      const response = await RNFetchBlob.config({
        path: filePath,
        fileCache: true,
      }).fetch('GET', `${BASE_URI}/payment/download/${transactionId}`);

      if (response.respInfo.status === 200) {
        console.log('File saved successfully at:', filePath);
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      } else {
        Alert.alert(
          'Download Failed',
          'Failed to download PDF. Please try again later.',
        );
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download PDF. Please try again later.');
    } finally {
      setLoading1(false);
    }
  };

  const itemRender = ({item}) => (
    <View className="flex flex-row  items-center justify-between py-2 border-b-2 border-slate-200 my-2">
      <View className="flex flex-row space-x-5">
        <View className="w-[50px] h-[50px] rounded-full -mt-[8px]">
          <Image
            source={{uri: user.avatar}}
            className="w-[100%] h-[100%] rounded-full"
          />
        </View>
        <View>
          <Text className="text-slate-600">{user.name}</Text>
          <View className="flex flex-row w-52 justify-between">
            <Text className="text-slate-600">Paid Via: {item.method}</Text>
            <Text className="text-slate-600">Rs: {item.amount}</Text>
          </View>
        </View>
      </View>
      <View className="flex flex-col justify-center">
        <TouchableOpacity
          className="w-7 h-7 flex justify-start"
          onPress={() => downloadSlip(item._id)}>
          <SvgXml xml={SVG_download} height={'100%'} width={'100%'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        className="w-8 h-8 flex justify-start -ml-[15px]"
        onPress={() => navigation.goBack()}>
        <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
      </TouchableOpacity>
      <View style={styles.balanceContainer}>
        <Text className="text-orange-900 font-bold text-3xl">
          Wallet Balance
        </Text>
        <Text style={styles.balanceAmount}>
          ₹
          {user?.wallet === undefined ? '0.00' : Number(user.wallet).toFixed(2)}
        </Text>
      </View>
      <View style={styles.transactionContainer}>
        <Text style={styles.transactionHeader}>Transaction History</Text>
        <View className="border-b-2 border-slate-300">
          <Text className="text-slate-500 text-md px-1 mb-3">
            Previous Receipts
          </Text>
        </View>
    
        {user?.transactions.length > 0 && (
          
          <FlatList
            data={bankHistory.paymentList}
            renderItem={itemRender}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            onEndReached={bankHistory.hasMore ? bankHistory.loadMore : null}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loading && <ActivityIndicator size="large" color="#0000ff" />
            }
            style={{marginBottom: 20}}
          />
         
        )}
      </View>
      <View
        className="flex flex-row justify-between"
       
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Add Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, user?.wallet === 0 && styles.buttonDisabled]}
          onPress={() => setWithdrawModalVisible(true)}
          disabled={user?.wallet === 0}>
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>

        <AddFundsModal
          modalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          alertMessage={alertMessage}
        />

        <WithdrawModal
          modalVisible={isWithdrawModalVisible}
          setModalVisible={setWithdrawModalVisible}
          accountDetails={user?.bankDetails}
          walletBalance={user?.wallet || 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  balanceContainer: {
    alignItems: 'start',
    marginVertical: 20,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#862A0D',
  },
  balanceAmount: {
    fontSize: 32,
    color: '#4CAF50',
    marginTop: 8,
  },
  transactionContainer: {
    flex: 1,
  },
  transactionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#862A0D',
  },
  transactionItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  transactionText: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#862A0D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonDisabled: {
    backgroundColor: 'gray',
    opacity: 0.9,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default WalletScreen;
