// import React, {useEffect} from 'react';

// import {
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Platform,
// } from 'react-native';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {SvgXml} from 'react-native-svg';
// import {SVG_Scroll_Swipe} from '../utils/SVGImage.js';
// import requestCameraAndAudioPermission from '../Components/permissions';
// import {navigate} from '../navigation/NavigationService.js';

// const HomeScreen = ({handleTabPress}) => {
//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       requestCameraAndAudioPermission().then(() => {
//         console.log('Permissions requested!');
//       });
//     }
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <ScrollView className="flex-1">
//         <View className="flex justify-center items-center h-[800px]">
//           <Text
//             className="text-primary text-[24px] font-medium mt-[70%] px-10"
//             style={styles.customFontText}>
//             Welcome to ExKop
//           </Text>
//           <Text className="text-secondary w-[100%] text-center px-5 text-sm">
//             Consult expertises in the field and discover the correct ways to
//             your problems. Empower today!{' '}
//           </Text>
//           <View className="mt-[50%]">
//             <TouchableOpacity
//               className="bg-primary py-4 px-20 rounded-lg"
//               onPress={() => {
//                 // navigation.push('SelectConsultantsScreen');
//                 navigate('SelectConsultantsScreen');
//               }}>
//               <Text className="text-[16px] font-medium text-white">
//                 Start Consultation
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               className="mt-4 rounded-lg flex justify-center"
//               onPress={() => {
//                 navigate('Schedule')
//                 handleTabPress('Schedule');
//               }}
//             >
//               <Text className="text-[16px] font-medium text-primary text-center">
//                 Schedule For Later
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <View className="flex justify-center">
//             <View className="w-[40px] h-[40px] m-[auto] mt-20">
//               <SvgXml xml={SVG_Scroll_Swipe} width="100%" height="100%" />
//             </View>
//             <Text className="text-slate-300 text-center ">
//               Swipe Up To Know More
//             </Text>
//           </View>
//         </View>

//         <View className="flex-1 justify-center mt-20 mr-4 ml-4">
//           <View className="w-96 m-auto">
//             <Image
//               source={require('./../images/home2.png')}
//               className="w-full object-cover ml-auto mr-auto h-[180]"
//             />
//           </View>
//           <Text className="text-primary text-[18px] font-medium pt-5">
//             Empowering Individual
//           </Text>
//           <Text className="text-secondary text-base font-light">
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
//             risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
//             nec, ultricies sed, dolor
//           </Text>
//         </View>

//         <View className="flex-1 justify-center mt-20 mr-4 ml-4 mb-28">
//           <View className="w-96 m-auto">
//             <Image
//               source={require('./../images/home1.png')}
//               className="w-full object-cover ml-auto h-[180]"
//             />
//           </View>
//           <Text className="text-primary text-[18px] font-medium pt-5">
//             Lorem Ipsum
//           </Text>
//           <Text className="text-secondary text-base font-light">
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
//             risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
//             nec, ultricies sed, dolor
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   customFontText: {
//     fontFamily: 'Sevillana',
//     fontSize: 24,
//   },
// });

// export default HomeScreen;

import React, {useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import {SVG_Scroll_Swipe, SVG_X_KOP_LOGO} from '../utils/SVGImage.js';
import requestCameraAndAudioPermission from '../Components/permissions';
import {navigate} from '../navigation/NavigationService.js';

const HomeScreen = ({handleTabPress}) => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('Permissions requested!');
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}> 
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView className="flex-1">
        <View className="flex justify-center items-center h-[800px] px-5">
        <View>
            <SvgXml xml={SVG_X_KOP_LOGO} width={200} height={200} />
        </View>
          <Text className="text-primary text-xl font-medium mt-10 text-center" style={{fontFamily:"Ubuntu-R"}}>
            {/* Welcome to ExKop */}
            Empowering Your Success with Expert Legal Insights 
          </Text>
          <Text
            className="text-secondary w-full text-center px-2 text-smfont-medium mt-4"
            style={{fontFamily: 'Titillium-Regular'}}>
            {/* Consult expertises in the field and discover the correct ways to
            your problems. Empower today! */}
            Tap into our network of seasoned law enforcement professionals for
            guidance and security.
          </Text>

          <View className="mt-16">
            <TouchableOpacity
              className="bg-primary py-2 px-16 rounded-lg"
              onPress={() => {
                navigate('SelectConsultantsScreen');
              }}>
              <Text
                className="text-lg font-bold text-white text-center"
                style={{fontFamily: 'Titillium-Regular'}}>
                Start Consultation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-4 rounded-lg"
              onPress={() => {
                navigate('Schedule');
                handleTabPress('Schedule');
              }}>
              <Text
                className="text-lg font-bold text-primary text-center"
                style={{fontFamily: 'Titillium-Regular'}}>
                Schedule For Later
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-10 items-center">
            <SvgXml xml={SVG_Scroll_Swipe} width={40} height={40} />
            <Text className="text-slate-300 text-center mt-4">Swipe Up</Text>
          </View>
        </View>

        <View className="flex-1 justify-center mx-5 -mt-[20]">
          <View className="w-full mx-auto">
            {/* ./../images/home2.png */}
            <Image
              source={require('./../images/img_home1.jpg')}
              className="w-full h-40 object-cover rounded-lg"
              resizeMode="cover"
            />
          </View>
          <Text
            className="text-primary text-lg font-medium pt-5"
            style={{fontFamily: 'Ubuntu-R', fontWeight: '700'}}>
            {/* Empowering Individual */}
            Unrivaled Wisdom and Expertise
          </Text>
          <Text
            className="text-secondary text-base font-light mt-2"
            style={{fontFamily: 'Titillium-Regular'}}>
            Benefit from the wisdom of retired officers who bring a wealth of
            knowledge from their illustrious careers in law enforcement to every
            case.
          </Text>
        </View>

        <View className="flex-1 justify-center mt-10 mx-5 mb-20">
          <View className="w-full mx-auto">
            {/* ./../images/home1.png */}
            <Image
              source={require('./../images/img_home2.jpg')}
              className="w-full h-40 object-cover rounded-lg"
              resizeMode="cover"
            />
          </View>
          <Text
            className="text-primary text-lg font-medium pt-4"
            style={{fontFamily: 'Ubuntu-R', fontWeight: '700'}}>
            Democratizing Legal Guidance
          </Text>
          <Text
            className="text-secondary text-base font-light mt-2"
            style={{fontFamily: 'Titillium-Regular'}}>
            Empowering the common man by making expert legal advice accessible
            and affordable, ensuring that no issue is too small for professional
            attention.
          </Text>
        </View>

        <View className="flex-1 justify-center mx-5 mb-10">
          <View className="w-full mx-auto">
            <Image
              source={require('./../images/img_home3.jpg')}
              className="w-full h-40 object-cover rounded-lg"
              resizeMode="cover"
            />
          </View>
          <Text
            className="text-primary text-lg font-medium pt-4"
            style={{fontFamily: 'Ubuntu-R', fontWeight: '700'}}>
            Strategic Corporate Partnerships
          </Text>
          <Text
            className="text-secondary text-base font-light mt-2"
            style={{fontFamily: 'Titillium-Regular'}}>
            We offer comprehensive support for businesses, handling everything
            from routine legal inquiries to complex fraud investigations,
            ensuring your corporate interests are protected and advanced
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // backgroundColor: '#e4cc9c',
  },
});

export default HomeScreen;
