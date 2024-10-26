import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import {SVG_arrow_back, SVG_calender1} from '../utils/SVGImage.js';
import {Calendar} from 'react-native-calendars';
import {RadioButton} from 'react-native-paper';
import moment from 'moment';
import useUserStore from '../stores/user.store.js';

const ScheduleScreen = ({navigation}) => {
  const [scheduleCall, setScheduleCall] = useState(false);
  const [selected, setSelected] = useState(null);
  const [slot, setSlot] = useState(0);
  const [timeSlots, setTimeSlots] = useState(null);
  const {user} = useUserStore();

  useEffect(() => {
    // console.log("hekksfbjfbjfe===>",user.consultations)
    // console.log("hekksfbjfbjfe===>",user.schedules)
    const currentDate = new Date().toISOString().split('T')[0];
    setSelected(currentDate);
  }, []);

  const marked = useMemo(
    () => ({
      [selected]: {
        selected: true,
        selectedColor: '#222222',
        selectedTextColor: 'yellow',
      },
    }),
    [selected],
  );



  const dateFormate = dateString => {
    const date = new Date(dateString);

    function getOrdinalSuffix(day) {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    }
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const dayWithSuffix = day + getOrdinalSuffix(day);

    const formattedDate = `${dayWithSuffix} ${month} ${year}`;
    return formattedDate;
  };

  function generateTimeSlots(startTime, endTime, interval) {
    let slots = [];
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      let endTimeSlot = new Date(currentTime.getTime() + interval);
      if (endTimeSlot > endTime) {
        break;
      }
      slots.push(formatTime(currentTime) + '-' + formatTime(endTimeSlot));
      currentTime = endTimeSlot;
    }

    return slots;
  }

  function roundUpTo30Minutes(date) {
    let minutes = date.getMinutes();
    let roundedMinutes = Math.ceil(minutes / 30) * 30;
    date.setMinutes(roundedMinutes);
    return date;
  }

  function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  }

  useEffect(() => {
    let startTime;
    const today = new Date().toISOString().split('T')[0];
    if (selected === today) {
      const currentTime = new Date();
      startTime = roundUpTo30Minutes(currentTime);
    } else if (selected > today) {
      startTime = new Date();
      startTime.setHours(9, 0, 0, 0); // 9:00 AM
    } else {
      startTime = null;
    }

    let endTime = new Date();
    endTime.setHours(18, 0, 0, 0); 
    let interval = 30 * 60 * 1000; 

    if (startTime) {
      setTimeSlots(generateTimeSlots(startTime, endTime, interval));
    } else {
      setTimeSlots(null);
    }
  }, [selected]);

  const itemRender = ({item}) => {
    return (
      <View className="flex flex-row justify-between py-2 border-b-2 border-slate-200 px-0">
        <View className="flex flex-row gap-2">
          <View className="w-[50px] h-[50px] rounded-full">
            <Image
              source={{uri: item.officer.avatar}}
              className="w-[100%] h-[100%] rounded-full"
            />
          </View>
          <View>
            <Text className="text-black font-medium text-base">
              {item.officer.name}
            </Text>
            <View className="flex flex-row gap-5">
              {item?.startCallTime !== undefined &&
                item?.endCallTime !== undefined && (
                  <Text className="text-secondary text-sm font-light">
                    Duration:{' '}
                    {Math.ceil(parseFloat(
                      (new Date(item.endCallTime) -
                        new Date(item.startCallTime)) /
                        (1000 * 60),
                    ).toFixed(2))}{' '}
                    min
                  </Text>
                )}
              <Text className="text-black text-sm text-medium">
                {item?.startCallTime !== undefined &&
                  item?.endCallTime !== undefined && (
                    <>
                      Fee: ₹
                      {item?.totalCallPrice | 0}
                    </>
                  )}
              </Text>
            </View>
            <Text className="text-black text-sm font-medium">
                  {dateFormate(item.startCallTime)}
                </Text>
            {item.date_time !== undefined && (
              <View className="flex flex-row">
                <Text className="text-black text-sm font-medium">
                  {dateFormate(item.date_time)}
                </Text>
                <Text className="text-[#36D158] text-sm font-medium text-left pl-9">
                  {item.payment_status}
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* {item.date_time !== undefined && (
          <TouchableOpacity>
            <Text className="text-black text-base underline">Reschedule</Text>
          </TouchableOpacity>
        )} */}
      </View>
    );
  };

  const handleDateShowFormate = dateString => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
  };

  const handleScheduleSubmit = async () => {
    const date = selected;

    const [startTime, endTime] = timeSlots[slot].split('-');

    const startDateTimeString = `${date} ${startTime}`;
    const endDateTimeString = `${date} ${endTime}`;

    const startDateTime = moment(
      startDateTimeString,
      'YYYY-MM-DD h:mm A',
    ).toDate();
    const endDateTime = moment(endDateTimeString, 'YYYY-MM-DD h:mm A').toDate();

    // console.log(startDateTime);
    // console.log(endDateTime);
    navigation.navigate('SelectConsultantsScreen', {
      startDateTime: JSON.stringify(startDateTime),
      endDateTime: JSON.stringify(endDateTime),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {!scheduleCall ? (
        <>
          <View className="px-5 py-10">
            <Text className="text-primary font-medium text-2xl">
              History & Scheduling
            </Text>
          </View>

          <View className="mt-2">
            <View className="px-5">
              <Text className="text-[#997654] font-medium text-sm">
                New Calls schedules
              </Text>
            </View>
            <View className="bg-[#C9C9C9] h-[1px] my-3 mb-4" />
            <View className="px-5 h-44">
              {user.schedules.length > 0 && (
                <FlatList
                  data={user.schedules}
                  renderItem={({item}) => (
                    <View className="flex flex-row justify-between py-2 border-b-2 border-slate-200 px-0">
                      <View className="flex flex-row gap-2">
                        <View className="w-[50px] h-[50px] rounded-full">
                          <Image
                            source={{uri: item.officer.avatar}}
                            className="w-[100%] h-[100%] rounded-full"
                          />
                        </View>
                        <View>
                          <Text className="text-black font-medium text-base">
                            {item.officer.name}
                          </Text>
                          <View className="flex flex-row gap-5">
                            <Text className="text-secondary text-sm font-light">
                              Duration:{' '}
                              {(new Date(item.endTime) -
                                new Date(item.startTime)) /
                                (1000 * 60)}{' '}
                              min
                              {/* {parseInt(item.duration) <= 30000
                  ? parseInt(item.duration) / 1000 + ' min'
                  : parseInt(item.duration) / 60000 + ' hr'} */}
                            </Text>
                            <Text className="text-black text-sm text-medium">
                              Fee: ₹{' '}
                              {parseInt(
                                (new Date(item.endTime) -
                                  new Date(item.startTime)) /
                                  (1000 * 60),
                              ) *
                                parseFloat(
                                  item.officer.officerDetails.ConsultationTypeID
                                    .FeePerMinute,
                                )}
                            </Text>
                          </View>
                          {item.startTime !== undefined && (
                            <View className="flex flex-row">
                              <Text className="text-black text-sm font-medium">
                                {dateFormate(item.startTime)}
                              </Text>
                              <Text className="text-[#36D158] text-sm font-medium text-left pl-9">
                                Unpaid
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {item.startTime !== undefined && (
                        <TouchableOpacity>
                          <Text className="text-black text-base underline">
                            Reschedule
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  keyExtractor={item => item._id}
                  scrollEnabled
                  style={{ height: 100, }}
                />
              )}
            </View>
          </View>

          <View className="mb-40">
            <View className="px-5">
              <Text className="text-[#997654] text-md">Previous Calls</Text>
            </View>
            <View className="bg-slate-300 h-[1px] my-3" />
            <View className="px-5">
              {/* {
                console.log())
              } */}
              {user.consultations.length > 0 && (
                <FlatList
                  data={user.consultations.sort((a,b)=>new Date(b.endCallTime)-new Date(a.endCallTime))}
                  renderItem={itemRender}
                  keyExtractor={item => item._id}
                  scrollEnabled
                  style={{ marginBottom: 350, }}
                />
              )}
            </View>
          </View>
          <TouchableOpacity
            className="absolute bottom-4 right-10 bg-primary px-6 py-4 rounded-xl"
            onPress={() => {
              setScheduleCall(true);
            }}>
            <View className="flex gap-2 flex-row items-center">
              <View className="w-[30px] h-[30px]">
                <SvgXml xml={SVG_calender1} height="100%" width="100%" />
              </View>
              <Text className="text-white text-xl">Schedule a Call</Text>
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View className="px-5 pb-20 pt-2">
    <View className="flex flex-row items-center">
    <TouchableOpacity
        className="w-[10%] h-8 justify-start my-2"
        onPress={() => setScheduleCall(false)}>
        <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
      </TouchableOpacity>
      <Text className="text-[#862A0D] font-medium text-2xl text-center w-[90%]">
              Schedule Call
            </Text>
    </View>
            <View className="pt-2 mb-10">
              <Calendar
                disableAllTouchEventsForDisabledDays={true}
                markedDates={marked}
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={day => {
                  setSelected(day.dateString);
                }}
              />
            </View>
            {selected && (
              <View className="px-5 flex flex-row gap-2 mb-4">
                <Text className="text-[#202020] text-sm">
                  Preferred Slot for
                </Text>
                <Text className="text-slate-700 text-[18px] font-bold">
                  {handleDateShowFormate(selected)}
                </Text>
              </View>
            )}

            <ScrollView horizontal={true} className="gap-3">
              {timeSlots &&
                timeSlots.length &&
                timeSlots.map((item, index) => (
                  <TouchableOpacity
                    key={'slot_key' + index}
                    className={`flex flex-row items-center px-2 py-2 border-2 
                ${
                  slot === index ? 'border-primary' : 'border-secondary'
                } rounded-lg`}
                    onPress={() => setSlot(index)}>
                    <RadioButton
                      color="#997654"
                      status={slot === index ? 'checked' : 'unchecked'}
                      value="option1"
                      onPress={() => setSlot(index)}
                    />
                    <Text className="text-primary">{item}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
          <View className="px-10">
            <TouchableOpacity
              className="bg-primary py-4 rounded-xl"
              onPress={handleScheduleSubmit}>
              <Text className="text-white text-center text-[20px] font-bold">
                Proceed
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default ScheduleScreen;
