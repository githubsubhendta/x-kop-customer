import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Searchbar, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useUserStore from '../stores/user.store';
import { navigate } from '../navigation/NavigationService';

const ContactScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const { user } = useUserStore();

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const matchedChats = user?.chats?.filter(chat => {
    const officerName = chat.participants.find(user => user.officerDetails)?.name || '';
    return officerName[0]?.toUpperCase() === selectedLetter;
  });

  const otherChats = user?.chats?.filter(chat => {
    const officerName = chat.participants.find(user => user.officerDetails)?.name || '';
    return officerName[0]?.toUpperCase() !== selectedLetter && officerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayedChats = [...(matchedChats || []), ...(otherChats || [])];

  return (
    <View className="flex-1 bg-white">
      <View className="w-full">
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

        <View className="flex-row justify-end w-full">
          <View className="flex-1">
            <ScrollView>
              {displayedChats?.length > 0 ? (
                displayedChats.map((chat, index) => {
                  const officer = chat.participants.find(user => user.officerDetails);
                  return (
                    <TouchableOpacity
                      key={index}
                      className="ml-4 mr-1"
                      onPress={() => navigate("ChatScreen", { chatId: chat._id })}
                    >
                      <Card.Title
                        title={officer?.name || 'Unknown Officer'}
                        subtitle={
                          officer?.officerDetails?.ConsultationTypeID?.ConsultationTypeName || 'General Offences'
                        }
                        left={() => (
                          <View className="pr-4">
                            <Image
                              source={{
                                uri: officer?.avatar || 'https://via.placeholder.com/50',
                              }}
                              className="w-[50px] h-[50px] rounded-full"
                            />
                          </View>
                        )}
                        className="border-b-2 border-[#F6F6F6]"
                      />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="ml-4 mr-4">
                  <Text>No chats available</Text>
                </View>
              )}
            </ScrollView>
          </View>
         <View className="py-2 bg-[#F6F6F6] mx-3 rounded-full">
         <ScrollView showsVerticalScrollIndicator={false} >
            {alphabet.map((letter, index) => (
              <TouchableOpacity key={index} onPress={() => setSelectedLetter(letter)}>
                <Text className={`px-[10px] py-[2px] ${selectedLetter === letter ? 'text-blue-500' : 'text-gray-500'} text-center`}>
                  {letter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
         </View>
        </View>
      </View>
    </View>
  );
};

export default ContactScreen;
