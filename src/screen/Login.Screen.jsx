import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Snackbar from 'react-native-snackbar';
import {userLogin} from '../Api/user.api.js'; 
const LoginScreen = ({navigation}) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLoginSubmit = async () => {
    if (mobile === '') {
      return Snackbar.show({
        text: 'Please Enter Mobile No.',
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
    setLoading(true); 
    try {
      const result = await userLogin({mobile, role: 'user'});
      if (result.data.data.isOTP) {
        // Save the mobile number in AsyncStorage
        const jsonValue = JSON.stringify({mobile: result.data.data.mobile});
        await AsyncStorage.setItem('loggedin-mobile', jsonValue);
        // Navigate to the OTP verification screen
        navigation.navigate('VerifyCodeScreen');
      }
    } catch (error) {
      Snackbar.show({
        text:
          error.response?.data?.message ||
          'An error occurred. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpNav = () => {
    const isSignUpScreenPresent = navigation
      .getState()
      .routes.some(route => route.name === 'SignUpScreen');

    if (!isSignUpScreenPresent) {
      navigation.push('SignUpScreen');
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: 'SignUpScreen'}],
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-custom_gradient">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View className="flex-1 justify-center items-center px-5 w-[100%]">
        <Text className="text-[#000] text-[24px] font-medium">
          Welcome to ExKop
        </Text>
        <Text className="text-secondary text-base font-medium text-center px-2">
          Consult expertises in the field and discover the correct ways to your
          problems. Empower today
        </Text>
        <View className="my-10 w-[100%]">
          {/* Mobile Number Input */}
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
                maxLength={10}
              />
            </View>
          </View>
          {/* Login Button */}
          <TouchableHighlight
            onPress={handleLoginSubmit}
            disabled={loading}
            className="rounded-lg">
            <View className="flex justify-center items-center bg-primary py-4 rounded-lg">
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[18px] font-medium">
                  Login
                </Text>
              )}
            </View>
          </TouchableHighlight>
          {/* Sign Up Navigation */}
          <View className="flex justify-center items-center my-5">
            <Text className="text-primary text-base font-medium">
              If you don't have an account,{' '}
              <Text
                onPress={handleSignUpNav}
                className="text-base underline decoration-1">
                sign up
              </Text>
            </Text>
          </View>
          {/* Divider */}
          <View className="flex justify-center items-center mt-10 mb-4">
            <Text className="text-[#8B8C9F] text-base">or</Text>
          </View>
          {/* Have a Code Button */}
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

export default LoginScreen;
