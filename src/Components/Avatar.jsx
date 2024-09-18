import React, {useEffect, useState} from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import {SVG_camera, SVG_gallery, SVG_edit_white,SVG_person} from './../utils/SVGImage.js';
import { updateAvatar } from "../Api/user.api.js";
import userStoreAction from '../stores/user.store.js';


function Avatar({url}) {
  const [uri, setUri] = useState(undefined);
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  const open = () => setVisible(true);

  const {
    localTokens,
    addLoggedInUserAction
} = userStoreAction(state => state);

useEffect(()=>{
if(url != ""){
  setUri(url);
}
},[url])

  const chooseImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(async image => {
        try {
          const newData = new FormData()
          newData.append("file",
           {
            name: image.filename || image.path.split('/').pop(),
            type: image.mime,
            uri: Platform.OS === 'ios' ? image.path.replace('file://', '') : image.path,
           }
        );
       const res_upload = await updateAvatar(localTokens.accessToken,newData);
       addLoggedInUserAction(res_upload.data.data[0],true);
        } catch (error) {
          console.log(error);
        }
        
        setUri(image.path);
      })
      .finally(close);
  };

  const openCamera = () => {
  ImagePicker.openCamera({
    width: 300,
    height: 400,
    cropping: true,
  })
    .then(async image => {
      try {
        const newData = new FormData()
        newData.append("file",
         {
          name: image.filename || image.path.split('/').pop(),
          type: image.mime,
          uri: Platform.OS === 'ios' ? image.path.replace('file://', '') : image.path,
         }
      );
     const res_upload = await updateAvatar(localTokens.accessToken,newData);
     addLoggedInUserAction(res_upload.data.data[0],true);
      } catch (error) {
        console.log(error);
      }
      setUri(image.path);
    })
    .finally(close);
  };

  return (
    <>
  <View className="flex justify-center items-center pb-10">
      <View className="w-[100px] h-[100px] bg-slate-200 rounded-full flex flex-row justify-center items-center relative">
          {uri != undefined ? (
            <Image source={{uri}} className="w-[100%] h-[100%] rounded-full " />
          ) : (
            <View className="w-[100px] h-[100px] bg-slate-200 rounded-full flex flex-row justify-center items-center relative">
           <SvgXml xml={SVG_person} height={'100px'} width={'100px'} /> 
            </View>
          )}
            <TouchableOpacity className="w-10 h-10 absolute bottom-0 right-0 rounded-full bg-[#997654]" onPress={open}>
            <View className="z-50 h-8 w-8 m-auto">
            <SvgXml xml={SVG_edit_white} height={'100%'} width={'100%'} />
            </View>
            </TouchableOpacity>
        </View>
      </View>
      <Modal
        isVisible={visible}
        onBackButtonPress={close}
        onBackdropPress={close}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <SafeAreaView className="bg-white flex-row rounded-tl-3xl rounded-tr-3xl p-10">
          <Pressable
            className="flex-1 justify-center items-center"
            onPress={chooseImage}>
            <SvgXml xml={SVG_gallery} height={'30px'} width={'30px'} />
            <Text className="text-orange-900">Library </Text>
          </Pressable>
          <Pressable
            className="flex-1 justify-center items-center"
            onPress={openCamera}>
            <SvgXml xml={SVG_camera} height={'30px'} width={'30px'} />
            <Text className="text-orange-900">Camera</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </>
  );
}

export default Avatar;
