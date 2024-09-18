import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  StatusBar,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Snackbar from 'react-native-snackbar';
import {userSignup} from '../Api/user.api.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUpScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState(null);

  const handleSignUpSubmit = async () => {
    if (name === '' && mobile) {
      return Snackbar.show({
        text: 'Name and Mobile are required!',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: 'red',
      });
    }
    if (mobile.length !== 10) {
      return Snackbar.show({
        text: 'Please Enter Valid Mobile No.',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: 'red',
      });
    }
    try {
      const result = await userSignup({mobile, name});
      if (result.data.data.isOTP) {
        const jsonValue = JSON.stringify({mobile: result.data.data.mobile});
        await AsyncStorage.setItem('loggedin-mobile', jsonValue);
        navigation.navigate('VerifyCodeScreen');
      }
    } catch (error) {
      console.log(error.response.data);
      if (error.response.data != undefined) {
        Snackbar.show({
          text: error.response?.data?.message,
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'red',
        });
      } else {
        console.log(error.response);
      }
    }
  };

  const handleLoginNav = () => {
    const isLoginScreenPresent = navigation
      .getState()
      .routes.some(route => route.name === 'LoginScreen');
    if (!isLoginScreenPresent) {
      navigation.push('LoginScreen');
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-custom-gradient">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View className="flex justify-center items-center  w-[100%] px-3 bg-custom-gradient">
        <Text className="text-[24px] font-medium text-[#000]">
          Welcome to ExKop
        </Text>
        <Text className="text-secondary text-base font-normal pt-4 text-center">
          Consult expertises in the field and discover the correct ways to your
          problems. Empower today
        </Text>
        <View className="my-10 w-[100%]">
          <TextInput
            className="border-[1px] border-[#677294] px-4 text-[#677294] rounded-xl"
            placeholderTextColor={'#9CA3AF'}
            onChangeText={setName}
            value={name}
            placeholder="Name"
          />

          <View className="flex-row items-center my-4 border-[1px] border-[#677294] px-4 text-[#677294] rounded-xl">
            <View className="px-3">
              <Text className="text-base text-[#677294]">+91</Text>
            </View>
            <View className="flex-1">
              <TextInput
                className="py-3 pl-2 text-[#677294]"
                onChangeText={setMobile}
                value={mobile}
                keyboardType="numeric"
                placeholder="Mobile Number"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <TouchableHighlight
            onPress={handleSignUpSubmit}
            className="rounded-lg">
            <View className="flex justify-center items-center bg-primary py-4 rounded-lg">
              <Text className="text-white text-[18px] font-medium">Sign Up</Text>
            </View>
          </TouchableHighlight>
          <View className="flex justify-center items-center my-5">
            <Text className="text-primary text-base font-medium">
              Have an account?{' '}
              <Text
                className="text-base underline decoration-1"
                onPress={handleLoginNav}>
                Log in
              </Text>
            </Text>
          </View>
          <View className="flex justify-center items-center mt-10 mb-4">
            <Text className="text-[#8B8C9F] text-base">or</Text>
          </View>
          <TouchableHighlight
            onPress={() => navigation.push('VerifyCodeScreen')}
            className="rounded-lg">
            <View className="flex justify-center items-center border-[1px] py-3 rounded-lg border-[#862A0D]">
              <Text className="text-primary text-[18px] font-mediusm">
                Have a Code
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;
