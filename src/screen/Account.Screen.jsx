import {View, Text, TouchableOpacity, StatusBar} from 'react-native';
import React, {useEffect, useState} from 'react';
import {logoutUser} from '../Api/user.api.js';
import userStoreAction from '../stores/user.store.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SVG_person,
  SVG_phone,
  SVG_edit,
  SVG_email,
  SVG_receipt,
  SVG_logout,
  SVG_go_next,
  SVG_wallet,
} from '../utils/SVGImage.js';
import {SvgXml} from 'react-native-svg';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import Avatar from '../Components/Avatar.jsx';
import LogoutModal from '../Components/account/LogoutModal.jsx';

const AccountScreen = ({navigation}) => {
  const {user, addLoggedInUserAction, addLocalTokens} = userStoreAction(
    state => state,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogoutUser = async () => {
    try {
      const Auth_data = await AsyncStorage.getItem('Authorized_data');
      const response = await logoutUser(Auth_data);
      if (response.data.success) {
        addLocalTokens(null);
        await AsyncStorage.removeItem('Authorized_data');
        addLoggedInUserAction({}, false);
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}],
        });
      }
    } catch (error) {
      console.error('error:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView className="mb-14">
        <View className="flex flex-row justify-between my-5 mx-4">
          <Text className="text-[#862A0D] text-3xl font-bold">Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.push('WalletScreen')}
            className="border border-[#862A0D] bg-slate-100 rounded-md w-30 h-10 items-start justify-center pl-1 pr-3">
            <View className="flex flex-row  items-center gap-2">
              <SvgXml xml={SVG_wallet} height={'30px'} width={'30px'}/>
              <Text className="text-[#862A0D] text-[16px]">
                ₹{user?.wallet === undefined ? '0' : user?.wallet}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-[20px]">
          <Avatar url={user.avatar == undefined ? '' : user.avatar} />
          <View>
            <View className="flex flex-row gap-10 px-8">
              <View className="w-8 h-8">
                <SvgXml xml={SVG_person} height={'100%'} width={'100%'} />
              </View>
              <Text className="text-[#282D2A] text-base">{user.name}</Text>
            </View>
            <View className="border-b border-gray-300 w-[100%] my-5"></View>
            <View className="flex flex-row gap-10 px-8">
              <View className="w-8 h-8">
                <SvgXml xml={SVG_phone} height={'100%'} width={'100%'} />
              </View>
              <Text className="text-[#282D2A] text-base">
                +91 {user.mobile}
              </Text>
              <TouchableOpacity
                className="px-14"
                onPress={() => navigation.push('EditProfile')}>
                <View className="w-7 h-7">
                  <SvgXml xml={SVG_edit} height={'100%'} width={'100%'} />
                </View>
              </TouchableOpacity>
            </View>
            <View className="border-b border-gray-300 w-[100%] my-5"></View>
            <View className="flex flex-row gap-10 px-8">
              <View className="w-8 h-8">
                <SvgXml xml={SVG_email} height={'100%'} width={'100%'} />
              </View>
              {user.email != undefined ? (
                <Text className="text-[#282D2A] text-base">{user.email}</Text>
              ) : (
                <Text
                  className="text-[#282D2A] text-base"
                  onPress={() => navigation.push('EditProfile')}>
                  + Add email
                </Text>
              )}
            </View>
            <View className="border-b border-gray-300 w-[100%] my-5"></View>
            <TouchableOpacity
              className="flex flex-row gap-10 px-8"
              onPress={() => navigation.push('TransactionsScreen')}>
              <View className="w-8 h-8">
                <SvgXml xml={SVG_receipt} height={'100%'} width={'100%'} />
              </View>
              <Text className="text-[#282D2A] text-base">Transactions</Text>
              <View className="px-[90px]">
                <View className="w-8 h-8">
                  <SvgXml xml={SVG_go_next} height={'100%'} width={'100%'} />
                </View>
              </View>
            </TouchableOpacity>
            <View className="border-b border-gray-300 w-[100%] my-5"></View>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="flex flex-row gap-10 px-8">
              <View className="w-8 h-8">
                <SvgXml xml={SVG_logout} height={'100%'} width={'100%'} />
              </View>
              <View>
                <Text className="text-[#282D2A] text-base">Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <LogoutModal
        modalVisible={modalVisible}
        setModalVisible={() => setModalVisible(!modalVisible)}
        onLogout={() => handleLogoutUser()}
      />
    </SafeAreaView>
  );
};

export default AccountScreen;
