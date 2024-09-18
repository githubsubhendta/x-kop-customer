import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, ScrollView  } from 'react-native';

const NameListScreen = ({ datalist }) => {
  const [selectedAlphabet, setSelectedAlphabet] = useState('');

  const filteredData = datalist.filter(item => {
    if (!selectedAlphabet) return true;
    return item.name.charAt(0).toLowerCase() === selectedAlphabet.toLowerCase();
  });

  const sortedData = filteredData.sort((a, b) => a.name.localeCompare(b.name));

  const renderListItem = ({ item }) => (
    <View className="pr-3 pb-2">
      <Text className="text-black text-xl">{item.name}</Text>
      <Text className="text-black">{item.postname}</Text>
    </View>
  );

  const renderAlphabetButton = (alphabet) => (
    <TouchableOpacity onPress={() => setSelectedAlphabet(alphabet)}>
      <Text className="text-black" style={{ padding: 10, fontWeight: selectedAlphabet === alphabet ? 'bold' : 'normal' }}>{alphabet}</Text>
    </TouchableOpacity>
  );

  const alphabetButtons = Array.from(Array(26), (_, i) => String.fromCharCode(65 + i)).map(char =>
    renderAlphabetButton(char)
  );

  return (
    <View className="relative h-full px-6">
      <ScrollView  className="flex absolute right-4 bg-gray-400 text-3xl overflow-y-auto rounded h-screen mx-6 mb-3 z-10">
        <View className="flex flex-col">
          {alphabetButtons}
        </View>
      </ScrollView>
      <View className="pr-6">
        <FlatList
         className="border-b-2 border-b-slate-400"
          data={sortedData}
          renderItem={renderListItem}
          keyExtractor={(item, index) => "ind_" + index.toString()}
        />
      </View>
    </View>
  );
};

export default NameListScreen;


