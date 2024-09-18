import React, {useState, useEffect} from 'react';
import {View, Button, Text,ScrollView, Image, TouchableOpacity} from 'react-native';
import { Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NameListScreen from '../Components/NameListScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import {  Card } from 'react-native-paper'
import useUserStore from '../stores/user.store';
import { navigate } from '../navigation/NavigationService';

const ContactScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const {user} = useUserStore();

  const datalist = [{name:'Abirav Sharma',url:require("./../images/home1.png"),postname:"Genera Offences"},
  {name:'Shivaji Narayan',url:require("./../images/home1.png"),postname:"Genera Offences"},
  {name:'Babil Khan',url:require("./../images/home1.png"),postname:"Genera Offences"},
  {name:'Rahul Sharma',url:require("./../images/home1.png"),postname:"GGenera Offences"}];
  return (
    <SafeAreaView className="flex-1 bg-white">
    <View>
      <Text className="font-medium pl-6 pr-6 pt-6 pb-4 text-primary text-2xl">Consultations</Text>
      <View className="flex flex-row items-center m-6 mt-0 relative rounded-lg border-[1px] border-[#F6F6F6] bg-[#F6F6F6]">
        <Searchbar
          className="rounded-none bg-transparent pr-4"
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}

        />
        <View className="absolute right-1">
          <Icon name="filter-variant-plus" size={25} color="black" />
        </View>
      </View>
      {/* <View>
      <NameListScreen datalist={datalist}  /> 
          </View> */}

<ScrollView>
  {user?.chats?.length > 0 ? (
    user.chats.map((chat, index) => (
      <TouchableOpacity key={index} className="ml-4 mr-4" onPress={()=>navigate("ChatScreen",{chats:chat})}>
        <Card.Title
          title={chat.participants.filter(user=>user.officerDetails)[0].name} 
          subtitle={chat?.participants?.filter(user=>user.officerDetails)[0]?.officerDetails?.ConsultationTypeID?.ConsultationTypeName ||"General Offences22e"} // Assuming subject exists in chat, with fallback
          left={(props) => (
            <View className="pr-4">
              <Image
                source={{
                  uri: chat?.participants?.filter(user=>user.officerDetails)[0]?.avatar,
                }}
                className="w-[50px] h-[50px] rounded-full"
              />
            </View>
          )}
          className="border-b-2 border-[#F6F6F6]"
        />
      </TouchableOpacity>
    ))
  ) : (
    <View className="ml-4 mr-4">
      <Text>No chats available</Text>
    </View>
  )}
</ScrollView>

    </View>            
  </SafeAreaView>
  );
};

export default ContactScreen;
