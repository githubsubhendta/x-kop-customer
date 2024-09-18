import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import useUserStore from '../../stores/user.store';
import phonepeSDK from "react-native-phonepe-pg";
import Base64 from "react-native-base64";
import sha256 from "sha256"

const AddFundsModal = ({ modalVisible, setModalVisible, addFunds }) => {
  const [amount, setAmount] = useState('');
  const {user} = useUserStore();

  const [environment,setEnvironment] = useState("SANDBOX");
  const [merchantId,setMerchantId] = useState("ESHOPGENPARTUAT");
  const [enableLogging,setEnableLogging] = useState(true);
  const [appId,setAppId] = useState(null);





  const generateTransactionId = ()=>{
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const merchantPrefix = "T";
    return `${merchantPrefix}${timestamp}${random}`;
  }

  const handleAddFunds = () => {
   
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
    } else {

      phonepeSDK.init(environment,merchantId,appId,enableLogging).then(res=>{
       const requestBody = {
        merchantId:merchantId,
        merchantTransactionId:generateTransactionId(),
        merchantUserId:"",
        amount: parseInt(amount)*100,
        mobileNumber:user.mobile,
        callbackUrl:"",
        paymentInstrument:{
          type:"PAY_PAGE"
        }
       }

       const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
       const salt_Index = 1;
       const payload = JSON.stringify(requestBody);
       const payload_main = Base64.encode(payload);
       const string = payload_main+"/pg/v1/pay"+salt_key;
       const checksum = sha256(string)+"###"+salt_Index;

        phonepeSDK.startTransaction(
          payload_main,
          checksum,
          null,
          null
        ).then(res=>{

        }).catch(err=>{
          console.log("transaction start",err)
        })
      }).catch(err=>{
        console.log(err)
      })
      // addFunds(value);
      // setAmount('');
      // setModalVisible(false);
    }
  };

  const handleSelectAmount = (value) => {
    setAmount(value.toString());
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Funds</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#B0B0B0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <ScrollView horizontal={true} style={styles.recommendedAmountsContainer} showsHorizontalScrollIndicator={false}>
            {[50, 100, 200, 500, 1000, 1500].map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.recommendedButton}
                onPress={() => handleSelectAmount(value)}>
                <Text style={styles.recommendedText}>₹{value}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonAdd]}
              onPress={handleAddFunds}>
              <Text style={styles.textStyle}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: 300,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
    color: '#333',
  },
  recommendedAmountsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  recommendedButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  recommendedText: {
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    width: '45%',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#E0E0E0',
  },
  buttonAdd: {
    backgroundColor: '#4CAF50',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AddFundsModal;
