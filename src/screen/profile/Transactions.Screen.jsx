import { View, Text, SafeAreaView,TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { Image } from 'react-native';
import { SVG_arrow_back, SVG_download } from '../../utils/SVGImage.js';
import { SvgXml } from 'react-native-svg';

const TransactionsScreen = ({navigation}) => { 
  const DATA = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      officer_name: 'Shivaji Narayan',
      payment_type:"G Pay",
      pay_fee:"1000",
      officer_avatar:"https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg"
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      officer_name: 'Shivaji Narayan',
      payment_type:"G Pay",
      pay_fee:"500",
      officer_avatar:"https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg"
    },
  ];



  const itemRender = ({item})=>{
    return (
    <View className="flex  flex-row justify-between p-2 border-b-2 border-slate-200">
      <View className="flex flex-row gap-10">
         <View className="w-[50px] h-[50px] rounded-full">
          <Image source={{uri:item.officer_avatar}} className="w-[100%] h-[100%] rounded-full"  />
         </View>
      <View>
        <Text className="text-slate-600">{item.officer_name}</Text>
        <View className="flex flex-row gap-5">
          <Text className="text-slate-600">Paid Via: {item.payment_type}</Text>
          <Text className="text-slate-600">Fee: {item.pay_fee}</Text>
        </View>
      </View>
         </View>
        <View className="flex flex-col justify-center">
        <TouchableOpacity className="w-8 h-8 flex justify-start" onPress={()=>{}}>
           <SvgXml xml={SVG_download} height={"100%"} width={"100%"} />
       </TouchableOpacity>
        </View>
    </View>
    )
  }
  

  return (
    <SafeAreaView className="flex-1">
      <View className="p-5">
       <TouchableOpacity className="w-10 h-10 flex justify-start mb-5" onPress={()=>navigation.goBack()}>
       <SvgXml xml={SVG_arrow_back} height={"100%"} width={"100%"} />
       </TouchableOpacity>
    
       <View className="p-2">
        <Text className="text-orange-900 font-bold text-3xl">Transactions</Text>
       </View>
      </View>
      <View className="px-7">
        <Text className="text-slate-500 text-xl">Previous Receipts</Text>
      </View>
      <View className="bg-slate-300 h-[1px] my-3"  />
      <View className="p-7">
      <FlatList
        data={DATA}
        renderItem={itemRender}
        keyExtractor={item => item.id}
      />
      </View>
    </SafeAreaView>
  )
}

export default TransactionsScreen;