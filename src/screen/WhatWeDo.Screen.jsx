import {View, Text, Image, TouchableOpacity,StyleSheet,StatusBar} from 'react-native';
import React, {useState,useRef} from 'react';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-swiper';
import { SvgXml } from "react-native-svg";

import {SVG_whatwenotdo, SVG_whatwedo} from '../utils/SVGImage.js';
import userStoreAction from './../stores/user.store.js';
import { SafeAreaView } from 'react-native-safe-area-context';

const WhatWeDoScreen = ({navigation}) => {
  const swiperRef = useRef(null);
  const handlewhatwedoAction = userStoreAction(state=>state.handlewhatwedoAction);
  const [currentPage, setCurrentPage] = useState(0);
  const handlePagination = index => {
    setCurrentPage(index < 0?0:index);
  };
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const handleLetsGo = async ()=>{
    await AsyncStorage.setItem('whatwedo',JSON.stringify({status:true}));
    handlewhatwedoAction(true);
    navigation.reset({
      index: 0,
      routes: [{ name: "LayoutScreen" }],
    });
  }



  return (
    <SafeAreaView style={styles.container}>
      
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
    <Swiper
        ref={swiperRef}
        style={styles.wrapper}
        showsButtons={true}
        loop={false}
        showsPagination={false}
        onIndexChanged={handlePagination}
        prevButton={<Text>Previous</Text>}
        nextButton={<Text>Next</Text>}>
        <View style={styles.slide}>
          <View className="px-10">
            <Text className="text-primary text-[24px] font-medium">What we do</Text>
            <Text className="text-secondary text-base">
            We can empower and provide you with easy solutions to your needs
            </Text>
          </View>
          <View className="w-[200px] h-[400px]">
            <SvgXml xml={SVG_whatwedo} width="100%" height="100%" />
          </View>
        </View>
        <View style={styles.slide}>
          <View className="px-10">
            <Text className="text-primary text-[24px] font-medium">What we do not do</Text>
            <Text className="text-secondary text-base">
            Things that we do no stand by or take accountability for
            </Text>
          </View>
          <View className="w-[200px] h-[400px]">
            <SvgXml xml={SVG_whatwenotdo} width="100%" height="100%" />
          </View>
        </View>
   
      </Swiper>

      <View style={styles.pagination}>
        {[...Array(2).keys()].map(index => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentPage === index ? styles.activeDot : null,
            ]}
          />
        ))}
      </View>
      <View className="px-10 bg-white">
      <View className="flex justify-start gap-2 flex-row items-center">
        <CheckBox
          // disabled={false}
          tintColors={{true: '#862A0D'}}
          onCheckColor={'#RRGGBB'}
          value={toggleCheckBox}
          onValueChange={newValue => setToggleCheckBox(newValue)}
        />
        <Text className="text-[#8B8C9F]">
         I have understood and ready to proceed.
        </Text>
      </View>
      <View className="w-[100%] px-5 my-10">
        <TouchableOpacity className={`${!toggleCheckBox?"bg-slate-200":"bg-orange-900"} m-auto py-4 w-[100%] rounded-xl`} disabled={!toggleCheckBox}  onPress={()=>handleLetsGo()}>
          <Text className="text-white text-center">Let s Go</Text>
        </TouchableOpacity>
        </View>
        </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#fff"
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
  },

  pagination: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 35,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#997654',
    marginHorizontal: 5,
    opacity: 0.2,
  },
  activeDot: {
    backgroundColor: '#997654',
    opacity: 1
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color: 'blue',
    fontSize: 16,
  },
});

export default WhatWeDoScreen;
