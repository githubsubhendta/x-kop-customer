import React, {useState, useRef} from 'react';
import {StyleSheet, View, Text, TouchableOpacity,StatusBar} from 'react-native';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SvgXml} from 'react-native-svg';
import {SVG_Intro1, SVG_Intro2, SVG_Intro3} from '../utils/SVGImage.js';
import { SafeAreaView } from 'react-native-safe-area-context';


const OnboardingScreen = ({navigation}) => {
  const swiperRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePagination = index => {
    setCurrentPage(index < 0?0:index);
  };

  const handleGetStarted = () => {
    AsyncStorage.setItem('onboarding_screen', JSON.stringify({status: true}));
    setTimeout(()=>{
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    },1000)

  };

  const handleNext = () => {
    const nextPage = currentPage + 1;
    swiperRef.current.scrollBy(nextPage, true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <Swiper
        ref={swiperRef}
        style={styles.wrapper}
        showsButtons={true}
        loop={false}
        showsPagination={false}
        onIndexChanged={handlePagination}
        prevButton={<Text>Previous</Text>}
        nextButton={<Text>Next</Text>}>
        <View style={styles.slide}>
          <View className="px-5">
            <Text className="text-primary font-medium text-[24px]">Expertise on-Demand</Text>
            <Text className="text-secondary text-base w-[300px]">
              A league of retired police officers, with insight across legal and
              safety realms.
            </Text>
          </View>
          <View className="w-[200px] h-[400px]">
            <SvgXml xml={SVG_Intro1} width="100%" height="100%" />
          </View>
        </View>
        <View style={styles.slide}>
          <View className="px-5">
            <Text className="text-primary font-medium text-[24px]">Where Trust Meets Security</Text>
            <Text className="text-secondary text-base font-normal w-[300px]">
              Verified advisors, offering confidential consultations within a
              secure environment.
            </Text>
          </View>
          <View className="w-[200px] h-[400px]">
            <SvgXml xml={SVG_Intro2} width="100%" height="100%" />
          </View>
        </View>
        <View style={styles.slide}>
          <View className="px-5">
            <Text className="text-primary text-[24px] font-medium">Empowering you!</Text>
            <Text className="text-secondary text-base w-[300px]">
              Fostering an environment to provide best in class solutions.
              Seamless & effortless
            </Text>
          </View>
          <View className="w-[200px] h-[400px]">
            <SvgXml xml={SVG_Intro3} width="100%" height="100%" />
          </View>
        </View>
      </Swiper>

      <View style={styles.pagination}>
        {[...Array(3).keys()].map(index => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentPage === index ? styles.activeDot : null,
            ]}
          />
        ))}
      </View>
      <View className="py-10 bg-white">
        <TouchableOpacity
          onPress={handleGetStarted}
          className="bg-primary py-3 mx-10 rounded-xl shadow-[0px 4px 8px rgba(0, 0, 0, 0.25)]">
          <Text className="text-white text-center text-base font-medium">
            Get Started
          </Text>
        </TouchableOpacity>
        <View className="my-2 h-5">
        {currentPage < 2 && <TouchableOpacity onPress={handleNext}>
          <Text className="text-center text-primary text-base font-medium">Skip</Text>
        </TouchableOpacity>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
  },

  pagination: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 20,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#997654',
    marginHorizontal: 5,
    opacity: 0.2,
  },
  activeDot: {
    backgroundColor: '#997654',
    opacity: 1
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color: 'blue',
    fontSize: 16,
  },
});

export default OnboardingScreen;
