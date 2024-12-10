import {View, Text, SafeAreaView, TouchableOpacity, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-gesture-handler';
import {SVG_Vector, SVG_Check} from '../utils/SVGImage.js';
import {SvgXml} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import useHttpRequest from '../hooks/useHttpRequest.jsx';
import {currencySymbol} from '../Constant/theme.js';
import useUserStore from '../stores/user.store.js';
import {useSnackbar} from '../shared/SnackbarProvider.js';

const SelectConsultantsScreen = ({route, navigation}) => {
  const {showSnackbar} = useSnackbar();
  const {data, fetchData, error, loading} = useHttpRequest();
  const recieve_params = route.params;
  const {user} = useUserStore();

  const [selected, setSelected] = useState(null);

  const [arr_type, setArr_type] = useState(null);

  // const arr = [
  //     {name:"General offences",fee:"500",session_time:"30"},
  //     {name:"Economic offences",fee:"1000",session_time:"60"},

  // ]

  useEffect(() => {
    fetchData('/consultationType/getConsultationType', 'GET');
  }, []);

  useEffect(() => {
    if (data?.statusCode == 201) {
      showSnackbar('Your call is successfully Scheduled!', 'success');
      navigation.reset({index: 0, routes: [{name: 'Schedule'}]});
    }
    if (data?.data?.length && data.data[0].ConsultationTypeName !== undefined) {
      setArr_type(data.data);
    }
  }, [data]);

  const handleScheduleSubmit = async () => {
    if (selected != null) {
      fetchData('/officer_schedule/schedules', 'POST', {
        consultationTypeName: arr_type[selected].ConsultationTypeName,
        startTime: recieve_params.startDateTime.replace(/\"/g, ''),
        endTime: recieve_params.endDateTime.replace(/\"/g, ''),
      });
    }
  };

  useEffect(() => {
    if (error) {
      if (error?.data?.statusCode == 400) {
        return showSnackbar(error?.data?.message, 'error');
      }
      showSnackbar('internal Server Problem', 'error');
      console.log('error===>', error?.data);
    }
  }, [error]);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text className="text-black">Laoding...</Text>
      </View>
    );
  }

  const handleSelection = indx => {
    if (parseInt(user.wallet) <= parseInt(arr_type[indx].FeePerMinute) * 2) {
      Alert.alert('Your balance is not sufficient for this call.');
      return false;
    }
    setSelected(indx);
  };
  return (
    <SafeAreaView className="mx-3 py-2 flex-1">
      <View>
        <TouchableOpacity
          className=" w-10 rounded-full my-5"
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View className="flex flex-col justify-between items-center">
          <View>
            <Text className="text-primary text-2xl font-bold">
              Select Consultant Type
            </Text>
            <Text className="text-blue-500 text-[14px] py-2">
              Select the consultant best suited for your matter
            </Text>
          </View>
          <ScrollView horizontal={true} className="my-20">
            {arr_type &&
              arr_type.map((item, index) => (
                <TouchableOpacity
                  key={'key_' + index}
                  className={`relative bg-white w-40 h-52 mx-1 
                shadow-2xl shadow-slate-500 rounded-md py-3 px-5 flex 
                 justify-center items-center ${
                   selected == index && 'border-2 border-red-600'
                 }
                 `}
                  onPress={() => handleSelection(index)}>
                  {selected == index && (
                    <View className="absolute right-4 top-2 z-50">
                      <AntDesign
                        name="checkcircleo"
                        size={22}
                        color="#b45309"
                        className="absolute right-0"
                      />
                      {/* <View className="absolute right-0 w-6 leading-10">
                    <SvgXml xml={SVG_Check} width="100%" height="100%" />
                    </View> */}
                    </View>
                  )}
                  <View className="w-20 h-28">
                    <SvgXml xml={SVG_Vector} width="100%" height="100%" />
                  </View>
                  <Text className="text-red-950 text-[16px]">
                    {item.ConsultationTypeName}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {selected != null && (
          <View className="flex gap-2">
            <Text className="text-slate-800">Consultation Fee</Text>
            <Text className="text-black text-[22px] font-bold">
              {currencySymbol}
              {arr_type[selected].FeePerMinute}
            </Text>
            <View className="bg-stone-500 w-48 py-2 rounded-2xl">
              <Text className="text-center text-md">1 min per session</Text>
            </View>
          </View>
        )}

        <View className="flex flex-col justify-between items-center">
          <View className="flex justify-center items-center mt-10">
            <View className="flex flex-row gap-3 my-10 px-3">
              <MaterialIcons name="error-outline" size={22} color="#600BEA" />
              <Text className="text-blue-700">
                Not sure what you need? Read Our Guidelines to make a better
                suited choice
              </Text>
            </View>
            {recieve_params != undefined ? (
              <TouchableOpacity
                className="bg-orange-900 py-5 px-20 rounded-2xl"
                onPress={handleScheduleSubmit}>
                {/* Proceed To Payment */}
                <Text className="text-[16px] font-semibold text-white">
                  Book Schedule
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className={`${
                  selected == null ? 'bg-[#D3D3D3]' : 'bg-orange-900'
                } py-4 px-24 rounded-md`}
                disabled={selected == null}
                onPress={() => {
                  selected != null &&
                    navigation.navigate(
                      'FindAnOfficerScreen',
                      arr_type[selected],
                    );
                }}>
                <Text className="text-[16px] font-semibold text-white">
                  Call To Officer
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectConsultantsScreen;
