import React, { useState, useRef } from 'react';
import { Modal, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import useUserStore from '../../stores/user.store';
import phonepeSDK from 'react-native-phonepe-pg';
import Base64 from 'react-native-base64';
import sha256 from 'sha256';
import axios from 'axios';
import { getCurrentUser } from '../../Api/user.api';
import { BASE_URI } from '../../Api/ApiManager';

const AddFundsModal = ({ modalVisible, setModalVisible, alertMessage }) => {
  const [amount, setAmount] = useState('');
  const { user,localTokens,handleUpdateUser } = useUserStore();

  const [environment, setEnvironment] = useState('SANDBOX');
  const [merchantId, setMerchantId] = useState('ESHOPGENPARTUAT');
  const [enableLogging, setEnableLogging] = useState(true);
  const [appId, setAppId] = useState(null);


  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const merchantPrefix = 'T';
    return `${merchantPrefix}${timestamp}${random}`;
  };

  const handleAddFunds = debounce(() => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    phonepeSDK.init(environment, merchantId, appId, enableLogging)
      .then(async() => {
        const requestBody = {
          merchantId: merchantId,
          merchantTransactionId: generateTransactionId(),
          merchantUserId: user._id,
          amount: parseInt(amount) * 100,
          mobileNumber: user.mobile,
          callbackUrl: BASE_URI+'/payment/callback',
          paymentInstrument: {
            type: 'PAY_PAGE'
          }
        };

        const salt_key = 'd5c563d6-7470-4983-85a1-63a1d665eac1';
        const salt_Index = 1;
        const payload = JSON.stringify(requestBody);
        const payload_main = Base64.encode(payload);
        const stringData = `${payload_main}/pg/v1/pay${salt_key}`;
        const checksum = `${sha256(stringData)}###${salt_Index}`;
try {
  const res_pay = await axios.post(BASE_URI+'/payment/store-user-info', {
    transactionId: requestBody.merchantTransactionId,
    userId: user._id,
    amount: parseInt(amount)
  },
  {
        headers: {
          'Content-Type': 'application/json',
        },
      }
);
} catch (error) {
  console.log("error==",error)
}

        phonepeSDK.startTransaction(
          payload_main,
          checksum,
          null,
          null
        ).then(async result => {
          if(result.status=="FAILURE"){
            return false;
          }
      try {
        const data = await getCurrentUser(localTokens);
        handleUpdateUser(data.data.data.user);
        
        alertMessage("Payment has been successfully added to your wallet.","success");
        setTimeout(()=>{
        setModalVisible(false)
      },1000)
     
      } catch (error) {
        console.log("refresh user=>",error);
      }

        }).catch(err => {
          console.error('Transaction start error:', err);
          Alert.alert('Transaction Error', 'There was an issue starting the transaction.');
        });
      }).catch(err => {
        console.error('SDK init error:', err);
        Alert.alert('Initialization Error', 'There was an issue initializing the payment SDK.');
      });
  }, 1000); 

  const handleSelectAmount = (value) => {
    setAmount(value.toString());
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
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
                onPress={() => handleSelectAmount(value)}
              >
                <Text style={styles.recommendedText}>₹{value}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonAdd]}
              onPress={handleAddFunds}
            >
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

