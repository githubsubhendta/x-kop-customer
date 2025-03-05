import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {SVG_arrow_back, SVG_calender1} from '../utils/SVGImage.js';
import {Calendar} from 'react-native-calendars';
import {RadioButton} from 'react-native-paper';
import moment from 'moment';
import useUserStore from '../stores/user.store.js';
import useCallHistory from '../Api/callHistory.js';
import {deleteSchedule, getAllSchedules} from '../Api/scheduleService.js';
import {useFocusEffect} from '@react-navigation/native';

const ScheduleScreen = ({navigation}) => {
  const [scheduleCall, setScheduleCall] = useState(false);
  const [selected, setSelected] = useState(null);
  const [slot, setSlot] = useState(0);
  const [timeSlots, setTimeSlots] = useState(null);
  const {user} = useUserStore();
  const {callHistory, fetchCallHistory, loading, hasMore} = useCallHistory();
  const [scheduleList, setScheduleList] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setSelected(currentDate);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
    }, []),
  );

  // useEffect(() => {
  //   (async () => {
  //     const allHistory = await getAllSchedules();
  //     setScheduleList(allHistory);
  //   })();
  // }, []);

  useEffect(() => {
    (async () => {
      try {
        const allHistory = await getAllSchedules();
        const currentDate = new Date().toISOString().split('T')[0];

        const validSchedules = [];

        for (const schedule of allHistory) {
          const {startTime, _id} = schedule;

          // Validate if startTime exists and is a valid date
          if (startTime && !isNaN(new Date(startTime).getTime())) {
            const scheduleDate = new Date(startTime)
              .toISOString()
              .split('T')[0];

            if (scheduleDate < currentDate) {
              console.log(`Deleting expired schedule: ${_id}`);
              await deleteSchedule(_id);
            } else {
              validSchedules.push(schedule);
            }
          } else {
            console.warn(
              `Invalid startTime for schedule: ${JSON.stringify(schedule)}`,
            );
          }
        }

        setScheduleList(validSchedules);
      } catch (error) {
        console.error('Error fetching or deleting schedules:', error);
      }
    })();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    const allHistory = await getAllSchedules();
    setScheduleList(allHistory);
    setRefreshing(false);
  };

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
      startTime.setHours(9, 0, 0, 0);
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

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCallHistory();
    }
  };
  const handleReschedule = item => {
    navigation.navigate('Reschedule', {
      selectedSchedule: item,
      scheduleId: item._id,
      // originalStartTime: item.startCallTime,
      // originalEndTime: item.endCallTime,
      // feePerMinute: item.officer.officerDetails.ConsultationTypeID.FeePerMinute,
    });
  };

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
                    {(() => {
                      const durationInMs =
                        new Date(item.endCallTime) -
                        new Date(item.startCallTime);
                      const hours = Math.floor(durationInMs / (1000 * 60 * 60));
                      const minutes = Math.floor(
                        (durationInMs % (1000 * 60 * 60)) / (1000 * 60),
                      );
                      const seconds = Math.floor(
                        (durationInMs % (1000 * 60)) / 1000,
                      );
                      const pad = num => String(num).padStart(2, '0');
                      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                    })()}
                  </Text>
                )}

              <Text className="text-black text-sm text-medium">
                {item?.startCallTime !== undefined &&
                  item?.endCallTime !== undefined && (
                    <>Fee:₹{parseFloat(item?.totalCallPrice)}</>
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
    navigation.navigate('SelectConsultantsScreen', {
      startDateTime: JSON.stringify(startDateTime),
      endDateTime: JSON.stringify(endDateTime),
    });
  };

  //////////////////// time showing on card //////////////////////////////////////
  const timeFormate = dateString => {
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  //////////////////// time showing on card end//////////////////////////////////////

  return (
    <View className="flex-1 bg-transparent relative">
      {!scheduleCall ? (
        <>
          <View>
            <ScrollView
              className="px-5 py-10"
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              <Text className="text-primary font-medium text-2xl">
                History & Scheduling
              </Text>
            </ScrollView>
          </View>
          <View className="mt-2">
            <View className="px-5">
              <Text className="text-[#997654] font-medium text-sm">
                New Calls schedules
              </Text>
            </View>
            <View className="bg-[#C9C9C9] h-[1px] my-3 mb-4" />
            <View className="px-5 h-44">
              <FlatList
                data={scheduleList}
                renderItem={({item}) => (
                  <View className="flex flex-row justify-between items-center py-3 border-b-2 border-slate-200 px-4">
                    <View className="flex flex-row flex-1 items-center mr-2">
                      {/* Avatar Container */}
                      <View className="w-[18%] max-w-[50px] aspect-square rounded-full overflow-hidden bg-gray-200">
                        <Image
                          source={{uri: item.officer.avatar}}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>

                      {/* Details Container */}
                      <View className="ml-3">
                        {/* Name */}
                        <View className="flex flex-row justify-between items-center">
                          <Text
                            className="text-black font-medium text-base"
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.officer.name}
                          </Text>
                          {item.startTime !== undefined && (
                            <TouchableOpacity
                              onPress={() => handleReschedule(item)}
                              hitSlop={{top: 0, bottom: 10, left: 10, right: 5}}
                              accessible
                              accessibilityLabel="Reschedule appointment">
                              <Text className="text-black text-sm font-bold underline">
                                Reschedule
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Duration & Fee Row */}
                        <View className="flex flex-row  items-center ">
                          <Text className="text-secondary text-sm font-light mr-4">
                            Duration:{' '}
                            {(() => {
                              const durationInMs =
                                new Date(item.endTime) -
                                new Date(item.startTime);
                              const hours = Math.floor(
                                durationInMs / (1000 * 60 * 60),
                              );
                              const minutes = Math.floor(
                                (durationInMs % (1000 * 60 * 60)) / (1000 * 60),
                              );
                              const seconds = Math.floor(
                                (durationInMs % (1000 * 60)) / 1000,
                              );
                              const pad = num => String(num).padStart(2, '0');
                              return `${pad(hours)}:${pad(minutes)}:${pad(
                                seconds,
                              )}`;
                            })()}
                          </Text>

                          <Text className="text-black text-sm font-medium">
                            Fee: ₹
                            {(
                              parseInt(
                                (new Date(item.endTime) -
                                  new Date(item.startTime)) /
                                  (1000 * 60),
                              ) *
                              parseFloat(
                                item.officer.officerDetails.ConsultationTypeID
                                  .FeePerMinute,
                              )
                            ).toFixed(2)}
                          </Text>
                        </View>

                        {/* Date/Time Row */}
                        {item.startTime !== undefined && (
                          <View className="flex flex-row  items-center">
                            <Text className="text-black text-[12px] font-medium mr-2">
                              {dateFormate(item.startTime)}
                            </Text>
                            <Text className="text-black text-[12px]">
                              {timeFormate(item.startTime)} -{' '}
                              {timeFormate(item.endTime)}
                            </Text>
                            <Text className="text-[#36D158] text-sm font-medium ml-4">
                              Unpaid
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Reschedule Button */}
                    {/* {item.startTime !== undefined && (
                      <TouchableOpacity
                        onPress={() => handleReschedule(item)}
                        hitSlop={{top: 0, bottom: 10, left: 10, right: 5}}
                        accessible
                        accessibilityLabel="Reschedule appointment">
                        <Text className="text-black text-xs font-bold underline">
                          Reschedule
                        </Text>
                      </TouchableOpacity>
                    )} */}
                  </View>
                )}
                keyExtractor={item => item._id}
                ListEmptyComponent={
                  <View className="py-10 items-center">
                    <Text className="text-gray-500">
                      No schedules available
                    </Text>
                  </View>
                }
                scrollEnabled
                style={{height: 100}}
              />
            </View>
          </View>

          <View className="mb-50">
            <View className="px-5">
              <Text className="text-[#997654] text-md">Previous Calls</Text>
            </View>
            <View className="bg-slate-300 h-[1px] my-3" />
            {callHistory && callHistory.length > 0 ? (
              <View className="px-5">
                <FlatList
                  data={callHistory.sort(
                    (a, b) =>
                      new Date(b.startCallTime) - new Date(a.startCallTime),
                  )}
                  renderItem={itemRender}
                  keyExtractor={item => item._id.toString()}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    loading ? (
                      <ActivityIndicator size="large" color="#0000ff" />
                    ) : null
                  }
                />
              </View>
            ) : (
              <View className="px-5">
                <Text className="text-gray-500 text-sm">
                  No call history available.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            className="absolute bottom-4 right-6 bg-primary px-3 py-3 rounded-xl"
            onPress={() => {
              setScheduleCall(true);
            }}>
            <View className="flex gap-2 flex-row items-center">
              <View className="w-[30px] h-[30px]">
                <SvgXml xml={SVG_calender1} height="100%" width="100%" />
              </View>
              <Text className="text-white text-lg">Schedule a Call</Text>
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View className="px-5 pb-20 pt-2">
            <View className="flex flex-row items-center">
              <TouchableOpacity
                className="w-8 h-8 justify-start my-2 -ml-1"
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
                <Text className="text-[#202020] text-sm ">
                  Preferred Slot for
                </Text>
                <Text className="text-slate-700 text-[16px] font-bold">
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
          <View className="px-6">
            <TouchableOpacity
              className="bg-primary py-3 rounded-md"
              onPress={handleScheduleSubmit}>
              <Text className="text-white text-center text-[20px] font-bold">
                Proceed
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ScheduleScreen;
