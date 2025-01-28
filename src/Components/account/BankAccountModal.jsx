import React, { memo, useState, useCallback, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import useBankDetailsStore from '../../stores/bankDetails';
import useHttpRequest from '../../hooks/useHttpRequest';
import { useSnackbar } from '../../shared/SnackbarProvider';
import AlertModal from '../AlertModal';

const BankAccountModal = memo(({ visible, onClose,accountDetails }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [reenterAccountNumber, setReenterAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const {handleUpdateBankDetails} = useBankDetailsStore();
  const {data,error,loading,fetchData} = useHttpRequest();
  const { showSnackbar } = useSnackbar();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const closeModal = useCallback(() => {
    // setAccountNumber('');
    // setReenterAccountNumber('');
    // setAccountHolder(''); 
    // setBankName(''); 
    // setIfscCode('');
    onClose();
  }, [onClose]);
  const handleSave = useCallback(() => {
    const accountNumberLength = accountNumber?.length || 0;
    const ifscCodeLength = ifscCode?.length || 0;
    if (!accountNumber || !accountHolder || !bankName || !ifscCode) {
      setAlertMessage('Please fill all fields.');
      setShowAlert(true);
    } else if (accountNumber !== reenterAccountNumber) {
      setAlertMessage('Account numbers do not match. Please re-enter.');
      setShowAlert(true);
    } else if (accountNumberLength < 9 || accountNumberLength > 18) {
      setAlertMessage('Account number must be between 9 and 18 digits.');
      setShowAlert(true);
    } else if (ifscCodeLength !== 11) {
      setAlertMessage('IFSC code must be exactly 11 characters long.');
      setShowAlert(true);
    } else {
      fetchData("/bank/createUpdateBankDetails","POST",
        {
          bankName,
          accountNumber,
          accountHolder,
          ifscCode,
      });
    }
   
  }, [accountNumber, reenterAccountNumber, accountHolder, bankName, ifscCode, closeModal]);
  useEffect(()=>{
    setAccountNumber(accountDetails?.accountNumber);
    setAccountHolder(accountDetails?.accountHolder);
    setBankName(accountDetails?.bankName);
    setIfscCode(accountDetails?.ifscCode)
  },[accountDetails]);
  useEffect(()=>{
  if(data?.success){
    handleUpdateBankDetails({
          bankName:data.data?.bankName,
          accountNumber:data.data?.accountNumber,
          accountHolder:data.data?.accountHolder,
          ifscCode:data.data?.ifscCode,
    });
    showSnackbar("Bank details save successfully.","success");
    setTimeout(()=>{
      closeModal();
    },1000)
  }
  },[data])

useEffect(()=>{
  if(error?.message){
    showSnackbar("Something went wrong!","error");
  }
},[error])
  return (
    <>
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className="flex-1 justify-center items-center bg-gray-600 bg-opacity-50">
        <View className="bg-white w-11/12 p-5 rounded-md">
          <Text className="text-xl font-bold mb-4 text-black">
            {accountDetails && accountNumber ? 'Edit Bank Account' : 'Add Bank Account'}
          </Text>
          <TextInput
            className="mb-4"
            label="Account Holder Name"
            mode="outlined"
            placeholderTextColor="black"
            value={accountHolder}
            onChangeText={setAccountHolder}
          />
          <TextInput
            className="mb-4"
            label="Account Number"
            mode="outlined"
            keyboardType="numeric"
            placeholderTextColor="black" 
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
          <TextInput
            className="mb-4"
            label="Re-enter Account Number"
            mode="outlined"
            keyboardType="numeric"
            placeholderTextColor="black" 
            value={reenterAccountNumber}
            onChangeText={setReenterAccountNumber}
          />
          <TextInput
            className="mb-4"
            label="Bank Name"
            mode="outlined"
            placeholderTextColor="black"
            value={bankName}
            onChangeText={setBankName}
          />
          <TextInput
            className="mb-4"
            label="IFSC Code"
            mode="outlined"
            placeholderTextColor="black"
            value={ifscCode}
            onChangeText={setIfscCode}
          />
          <View className="flex-row justify-end">
            <TouchableOpacity onPress={closeModal} className="mr-4">
              <Text className="text-blue-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-blue-500">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    <AlertModal
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </>
  );
});

export default BankAccountModal;
