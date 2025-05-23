import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {Searchbar, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {navigate} from '../navigation/NavigationService';
import {useConversationList} from '../Api/conversationService';

const ContactScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const {loading, error, conversationList, getAllConversationList} =
    useConversationList();

  useEffect(() => {
    if (conversationList.length === 0) {
      getAllConversationList();
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.log('Error:', error);
    }
  }, [error]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const matchedChats = conversationList?.filter(chat => {
    const officerName =
      chat.participants.find(user => user.officerDetails)?.name || '';
    return officerName[0]?.toUpperCase() === selectedLetter;
  });

  const otherChats = conversationList?.filter(chat => {
    const officerName =
      chat.participants.find(user => user.officerDetails)?.name || '';
    return (
      officerName[0]?.toUpperCase() !== selectedLetter &&
      officerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const displayedChats = [...(matchedChats || []), ...(otherChats || [])];

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'transparent'}}>
      <View>
        <Text
          style={{
            fontWeight: '500',
            paddingHorizontal: 24,
            paddingVertical: 16,
            fontSize: 24,
            color: '#862A0D',
          }}>
          Consultations
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            margin: 24,
            marginTop: 0,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#F6F6F6',
            backgroundColor: '#F6F6F6',
          }}>
          <Searchbar
            style={{flex: 1, backgroundColor: 'transparent'}}
            placeholder="Search"
            onChangeText={text => {
              setSearchQuery(text);
              setSelectedLetter('');
            }}
            value={searchQuery}
          />

          <Icon
            name="filter-variant-plus"
            size={25}
            color="black"
            style={{marginRight: 14}}
          />
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flex: 1}}>
            {loading ? (
              <ActivityIndicator size="large" style={{marginTop: 20}} />
            ) : (
              <ScrollView>
                {displayedChats.length > 0 ? (
                  displayedChats.map((chat, index) => {
                    const officer = chat.participants.find(
                      user => user.officerDetails,
                    );
                    return (
                      <TouchableOpacity
                        key={index}
                        style={{marginLeft: 6}}
                        onPress={() =>
                          navigate('ChatScreen', {
                            chatId: chat._id,
                            chats: chat,
                          })
                        }>
                        <Card.Title
                          title={officer?.name || 'Unknown Officer'}
                          subtitle={
                            officer?.officerDetails?.ConsultationTypeID
                              ?.ConsultationTypeName || 'General Offences'
                          }
                          left={() => (
                            <Image
                              source={{
                                uri:
                                  officer?.avatar ||
                                  'https://via.placeholder.com/50',
                              }}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                borderWidth: 1,
                                borderColor: '#F7F7F7',
                              }}
                            />
                          )}
                          titleStyle={{
                            fontWeight: 'bold',
                            paddingTop: 3,
                          }}
                          style={{
                            fontWeight: 600,
                            borderBottomWidth: 1,
                            borderBottomColor: '#D3D3D3',
                            marginLeft: 4,
                          }}
                        />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{marginHorizontal: 16, marginTop: 20}}>
                    <Text className="text-center text-[#997654] font-medium text-md">Contact Not Found</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
          <View className="py-2 bg-gray-100 mx-1 rounded-xl">
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="h-[550px] overflow-y-auto scrollbar-hidden mb-16">
              {alphabet.map((letter, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedLetter(letter)}>
                  <Text
                    className={`px-2 py-1 text-center ${
                      selectedLetter === letter
                        ? 'text-[#862A0D]'
                        : 'text-gray-400'
                    }`}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ContactScreen;
