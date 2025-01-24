import React, {useEffect, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import useUserStore from '../../stores/user.store';
import BankAccountModal from '../../Components/account/BankAccountModal';
import useBankDetailsStore from '../../stores/bankDetails';
import useHttpRequest from '../../hooks/useHttpRequest';


const WithdrawModal = ({modalVisible, setModalVisible}) => {
  const [visibleBankModal, setVisibleBankModal] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const {user} = useUserStore();
  const {bankDetails,handleUpdateBankDetails} = useBankDetailsStore() 
  const {data, loading, fetchData} = useHttpRequest();


  useEffect(() => {
    if (user && Object.keys(bankDetails).length) {
      setAccountDetails(bankDetails); 
    } else { 
      fetchData(`/bank/getBankDetails?userId=${user._id}`,"GET"); 
    }
    // console.log("==================>", user);
  }, [bankDetails, user]);
  useEffect(() => {
    if (data?.success) {
      handleUpdateBankDetails({
        bankName: data.data?.bankName,
        accountNumber: data.data?.accountNumber,
        accountHolder: data.data?.accountHolder,
        ifscCode: data.data?.ifscCode,
      });
    }
  }, [data]);
  
  const handleSelectAmount = value => {
    setAmount(value.toString());
  };

  const handleWithdrawMoney = async () => {
    if (Number(amount) > Number(user?.wallet)) {
      return setError(
        'Insufficient funds in your account. Please fund your account and try again.',
      );
    } else {
      setVisibleBankModal(true);
      setError(null);
    }

    // Proceed with withdrawal logic here (e.g., API call)
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Cashout Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#B0B0B0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <ScrollView
            horizontal={true}
            style={styles.recommendedAmountsContainer}
            showsHorizontalScrollIndicator={false}>
            {[50, 100, 200, 500, 1000, 1500].map(value => (
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
              onPress={() => setModalVisible(false)} >
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonAdd ,{ backgroundColor: amount ? '#4CAF50' : '#B0B0B0' },]}
              onPress={handleWithdrawMoney} disabled={!amount}>
              <Text style={styles.textStyle}>Request</Text>
            </TouchableOpacity>

            <BankAccountModal
              visible={visibleBankModal}
              onClose={() => setVisibleBankModal(false)}
              accountDetails={accountDetails}
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
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
  errorText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default WithdrawModal;
