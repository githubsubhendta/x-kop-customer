import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Searchbar, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigate } from '../navigation/NavigationService';
import { useConversationList } from '../Api/conversationService';

const ContactScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const { loading, error, conversationList, getAllConversationList } = useConversationList();

  useEffect(() => {
    if (conversationList.length === 0) {
      getAllConversationList();
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.log("Error:", error);
    }
  }, [error]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const matchedChats = conversationList?.filter(chat => {
    const officerName = chat.participants.find(user => user.officerDetails)?.name || '';
    return officerName[0]?.toUpperCase() === selectedLetter;
  });

  const otherChats = conversationList?.filter(chat => {
    const officerName = chat.participants.find(user => user.officerDetails)?.name || '';
    return officerName[0]?.toUpperCase() !== selectedLetter && officerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayedChats = [...(matchedChats || []), ...(otherChats || [])];

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ width: '100%' }}>
        <Text style={{ fontSize: 24, fontWeight: '500', paddingHorizontal: 16, paddingVertical: 8, color: '#1A202C' }}>
          Consultations
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', margin: 16, marginTop: 0, borderRadius: 8, borderWidth: 1, borderColor: '#F6F6F6', backgroundColor: '#F6F6F6' }}>
          <Searchbar
            style={{ flex: 1, backgroundColor: 'transparent', paddingRight: 4 }}
            placeholder="Search"
            onChangeText={(text) => {
              setSearchQuery(text);
              setSelectedLetter(''); // Clear selected letter on search
            }}
            value={searchQuery}
          />
          <View style={{ position: 'absolute', right: 8 }}>
            <Icon name="filter-variant-plus" size={25} color="black" />
          </View>
        </View>

        <View style={{ flexDirection: 'row', width: '100%' }}>
          <View style={{ flex: 1 }}>
            {loading ? (
              <ActivityIndicator size="large" />
            ) : (
              <ScrollView>
                {displayedChats.length > 0 ? (
                  displayedChats.map((chat, index) => {
                    const officer = chat.participants.find(user => user.officerDetails);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={{ marginHorizontal: 4 }}
                        onPress={() => navigate("ChatScreen", { chatId: chat._id,chats:chat })}
                      >
                        <Card.Title
                          title={officer?.name || 'Unknown Officer'}
                          subtitle={officer?.officerDetails?.ConsultationTypeID?.ConsultationTypeName || 'General Offences'}
                          left={() => (
                            <Image
                              source={{ uri: officer?.avatar || 'https://via.placeholder.com/50' }}
                              style={{ width: 50, height: 50, borderRadius: 25 }}
                            />
                          )}
                          style={{ borderBottomWidth: 1, borderBottomColor: '#F6F6F6' }}
                        />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{ margin: 16 }}>
                    <Text>No chats available</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
          <View style={{ paddingVertical: 8, backgroundColor: '#F6F6F6', marginHorizontal: 8, borderRadius: 50 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {alphabet.map((letter, index) => (
                <TouchableOpacity key={index} onPress={() => setSelectedLetter(letter)}>
                  <Text style={{ paddingHorizontal: 10, paddingVertical: 4, textAlign: 'center', color: selectedLetter === letter ? '#4299E1' : '#A0AEC0' }}>
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
