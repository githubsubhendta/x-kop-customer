import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity,Image } from 'react-native';
import AddFundsModal from '../../Components/account/AddFundsModal';
import userStoreAction from '../../stores/user.store';
import useHttpRequest from '../../hooks/useHttpRequest';
import { SvgXml } from 'react-native-svg';
import { SVG_arrow_back, SVG_download } from '../../utils/SVGImage';
import { useSnackbar } from '../../shared/SnackbarProvider';


const WalletScreen = ({navigation}) => {
  const {loading, error, data, fetchData} = useHttpRequest();
    const {user,addLoggedInUserAction} = userStoreAction(
        state => state,
      );

  const [isModalVisible, setModalVisible] = useState(false);
  const { showSnackbar } = useSnackbar();


  const [transactions, setTransactions] = useState([
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      officer_name: 'Shivaji Narayan',
      payment_type:"G Pay",
      pay_fee:"1000",
      officer_avatar:"https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg"
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      officer_name: 'Shivaji Narayan',
      payment_type:"G Pay",
      pay_fee:"500",
      officer_avatar:"https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg"
    },
  ]);


  const alertMessage = (message,type) => {
    showSnackbar(message,type)
  };

  useEffect(()=>{
    
  if(data != null){
    addLoggedInUserAction({...data.data.user}, true);
  }
  },[data])


  if(loading){
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-slate-900">Loading...</Text>
      </View>
    )
  }


  const itemRender = ({item})=>{
    return (
    <View className="flex  flex-row justify-between p-2 border-b-2 border-slate-200">
      <View className="flex flex-row gap-10">
         <View className="w-[50px] h-[50px] rounded-full">
          <Image source={{uri:item.officer_avatar}} className="w-[100%] h-[100%] rounded-full"  />
         </View>
      <View>
        <Text className="text-slate-600">{item.officer_name}</Text>
        <View className="flex flex-row gap-5">
          <Text className="text-slate-600">Paid Via: {item.payment_type}</Text>
          <Text className="text-slate-600">Fee: {item.pay_fee}</Text>
        </View>
      </View>
         </View>
        <View className="flex flex-col justify-center">
        <TouchableOpacity className="w-8 h-8 flex justify-start" onPress={()=>{}}>
           <SvgXml xml={SVG_download} height={"100%"} width={"100%"} />
       </TouchableOpacity>
        </View>
    </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity className="w-8 h-8 flex justify-start" onPress={()=>navigation.goBack()}>
       <SvgXml xml={SVG_arrow_back} height={"100%"} width={"100%"} />
       </TouchableOpacity>
      <View style={styles.balanceContainer}>
        <Text className="text-orange-900 font-bold text-3xl">Wallet Balance</Text>
        <Text style={styles.balanceAmount}>₹{user?.wallet == undefined ? "0" : user?.wallet}</Text>
      </View>
      <View style={styles.transactionContainer}>
        <Text style={styles.transactionHeader} >Transaction History</Text>
        <View className="px-7">
        <Text className="text-slate-500 text-md">Previous Receipts</Text>
      </View>
      <View className="bg-slate-300 h-[1px] my-3"  />
        <FlatList
        data={transactions}
        renderItem={itemRender}
        keyExtractor={item => item.id}
      />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Add Money</Text>
        </TouchableOpacity>
        {/* onPress={()=>navigation.push("PaymentScreen")} */}
        <TouchableOpacity style={styles.button}  >
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>

        <AddFundsModal
        modalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        alertMessage={alertMessage}
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
    alignItems: 'center',
    marginVertical: 20,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color:"#862A0D",
  },
  balanceAmount: {
    fontSize: 32,
    color: '#4CAF50',
    marginTop: 10,
  },
  transactionContainer: {
    flex: 1,
  },
  transactionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color:"#862A0D"
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
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#862A0D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default WalletScreen;
