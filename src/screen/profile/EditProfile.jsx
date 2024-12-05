import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {TextInput} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import userStoreAction from '../../stores/user.store.js';
import Avatar from '../../Components/Avatar.jsx';
import {SVG_arrow_back} from '../../utils/SVGImage.js';
import {SvgXml} from 'react-native-svg';
import useHttpRequest from '../../hooks/useHttpRequest.jsx';
import Snackbar from 'react-native-snackbar';

const EditProfile = ({navigation}) => {
  const windowWidth = Dimensions.get('window').width;
  let windowHeight = Dimensions.get('window').height;
  const User = userStoreAction(state => state.user);
  const addLoggedInUserAction = userStoreAction(
    state => state.addLoggedInUserAction,
  );
  const [userData, setUserData] = useState({});
  const {loading, error, data, fetchData} = useHttpRequest();

  useEffect(() => {
    setUserData({
      name: User.name != undefined ? User.name : '',
      mobile: User.mobile != undefined ? User.mobile : '',
      email: User.email != undefined ? User.email : '',
      avatar: User.avatar != undefined ? User.avatar : null,
    });
  }, [User]);

  const handleUpdate = async () => {
    await fetchData('/users/update-account', 'PATCH', {
      userData: {
        name: userData.name,
        mobile: userData.mobile,
        email: userData.email,
      },
    });
  };
  useEffect(() => {
    if (data?.success) {
      if (data.data.length > 0) {
        addLoggedInUserAction(data.data[0], true);
      }
      Snackbar.show({
        text: data.message,
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: 'green',
      });
    }
  }, [data]);

  useEffect(() => {
    if (error?.message != undefined) {
      Snackbar.show({
        text: error.message,
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: 'red',
      });
    }
  }, [error]);

  return (
    <ScrollView
      className={`w-[${windowWidth}px] h-[${windowHeight}px] bg-white`}>
      <TouchableOpacity
        className="w-8 h-8 flex justify-start mx-3 mt-5"
        onPress={() => navigation.goBack()}>
        <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
      </TouchableOpacity>
      <View className="bg-white px-10 py-5">
        <Text className="text-[#862A0D] text-[24px] font-medium">
          Edit Profile
        </Text>
      </View>
      {userData.avatar != undefined ? (
        <Avatar url={userData.avatar} />
      ) : (
        <Avatar url={''} />
      )}

      <View>
        <View className="px-5 mt-10">
          <TextInput
            mode="outlined"
            label="Name"
            value={userData.name}
            placeholder="Enter your name"
            onChangeText={value => setUserData({...userData, name: value})}
          />
        </View>
        <View className="px-5 mt-5">
          <TextInput
            number
            mode="outlined"
            label="Mobile Number"
            value={userData.mobile}
            placeholder="Enter your mobile"
            left={<TextInput.Affix text="+91" />}
            keyboardType="phone-pad"
            onChangeText={value => setUserData({...userData, mobile: value})}
          />
        </View>
        <View className="px-5 mt-5">
          <TextInput
            mode="outlined"
            label="Email ID"
            value={userData.email}
            onChangeText={value => setUserData({...userData, email: value})}
            placeholder="Enter your email"
          />
        </View>
      </View>
      <View className=" my-5" />
      <View className="flex px-5">
        <TouchableOpacity
          className="bg-orange-900 py-4 rounded-md"
          onPress={handleUpdate}>
          {loading ? (
            <ActivityIndicator color={'#fff'} size="small" />
          ) : (
            <Text className="text-white text-center text-[18px] font-bold">
              Update Profile
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfile;
