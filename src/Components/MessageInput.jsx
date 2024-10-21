import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import { useSnackbar } from '../shared/SnackbarProvider';
import { uploadFileForChatUser } from '../Api/user.api';
import userStoreAction from '../stores/user.store.js';
import { getMessageTypeFromFile } from '../utils/fileChecker.js';

function MessageInput({ sender, receiver, webSocket }) {
  const [message, setMessage] = useState('');
  const { showSnackbar } = useSnackbar();
  const {localTokens,user,handleUpdateUser} = userStoreAction();


  const sendMessage = async (message, type = 'text') => {
    if (message.trim() !== "") {
      webSocket.emit('sendmessage', { sender, receiver, type, content: message });
      setMessage(""); 
    } else {
      Alert.alert("Please enter a message first.");
    }
  };

  const handleChat = (value) => {
    setMessage(value);
  };


  
  


  const selectFiles = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      uploadFiles(res); 
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled the picker');
      } else {
        console.error(err);
      }
    }
  };


  const onUploadProgress = (progess)=>{
console.log("check progress data===>",progess)
  }


  
  const uploadFiles = async (files) => {
    if (files.length === 0) {
      Alert.alert('Please select at least one file!');
      return;
    }
    const formData = new FormData();
    for (const file of files) {
      let fileUri = file.uri;
      const fileData = {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        type: file.type,
        name: file.name,
      };
      formData.append('files', fileData); 
    }
  
    try {

  const response = await uploadFileForChatUser(localTokens.accessToken,formData,onUploadProgress);
 
        if(response?.data?.data?.length){
          response.data.data.forEach(item=>{
            sendMessage(item,getMessageTypeFromFile(item))
          })
        }
    } catch (error) {
      console.log(error);
      showSnackbar('File upload failed!'+error.message, 'error');
    }
  };





  return (
    <View style={styles.InputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Start Typing Here"
        placeholderTextColor="#888"
        value={message} 
        onChangeText={handleChat} 
      />
      <View style={styles.iconsContainer}>
        {/* Attach File Button */}
        <TouchableOpacity style={styles.iconButton} onPress={selectFiles}>
          <Icon name="attach-file" size={24} color="#888" />
        </TouchableOpacity>
        {/* Send Message Button */}
        <TouchableOpacity style={styles.iconButton} onPress={() => sendMessage(message)}>
          <Icon name="send" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  InputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 10,
  },
});

export default MessageInput;
