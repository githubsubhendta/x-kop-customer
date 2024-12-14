import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {RadioButton} from 'react-native-paper';
import moment from 'moment';
import {SvgXml} from 'react-native-svg';
import {SVG_arrow_back} from '../utils/SVGImage';
import {updateSchedule} from '../Api/scheduleService';

const Reschedule = ({route, navigation}) => {
  const {selectedSchedule, scheduleId} = route.params;
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const date = new Date(selectedSchedule.startTime);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString('en-US', options);
    const selectedIndex = timeSlots.findIndex(item =>
      item.includes(formattedTime),
    );

    setSelectedSlot(selectedIndex);
  }, [timeSlots, selectedSchedule]);

  useEffect(() => {
    if (selectedSchedule?.startTime) {
      setSelectedDate(selectedSchedule.startTime);
    }
  }, [selectedSchedule]);

  const generateTimeSlots = (startTime, endTime, interval) => {
    let slots = [];
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      let endTimeSlot = new Date(currentTime.getTime() + interval);
      if (endTimeSlot > endTime) {
        break;
      }
      slots.push(formatTime(currentTime) + ' - ' + formatTime(endTimeSlot));
      currentTime = endTimeSlot;
    }
    return slots;
  };

  const roundUpTo30Minutes = date => {
    let minutes = date.getMinutes();
    let roundedMinutes = Math.ceil(minutes / 30) * 30;
    date.setMinutes(roundedMinutes);
    return date;
  };

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
    let startTime = new Date(selectedDate);
    startTime = roundUpTo30Minutes(startTime);
    let endTime = new Date(selectedDate);
    endTime.setHours(18, 0, 0, 0);
    let interval = 30 * 60 * 1000;
    setTimeSlots(generateTimeSlots(startTime, endTime, interval));
  }, [selectedDate]);

  const handleRescheduleSubmit = async () => {
    const date = selectedDate;

    if (!timeSlots[selectedSlot]) {
      console.error('Invalid time slot selected');
      return;
    }

    const [startTime, endTime] = timeSlots[selectedSlot].split('-');
    const startDateTimeString = `${date} ${startTime.trim()}`;
    const endDateTimeString = `${date} ${endTime.trim()}`;
    try {
      // Format the date without redundant timezone information
      const startDateTime = moment(
        `${moment(date).format('YYYY-MM-DD')} ${startTime.trim()}`,
        'YYYY-MM-DD hh:mm A',
      ).toISOString();

      const endDateTime = moment(
        `${moment(date).format('YYYY-MM-DD')} ${endTime.trim()}`,
        'YYYY-MM-DD hh:mm A',
      ).toISOString();

      if (!startDateTime || !endDateTime) {
        throw new Error('Failed to parse dates');
      }

      const newSchedule = {
        startTime: startDateTime,
        endTime: endDateTime,
      };
      await updateSchedule(scheduleId, newSchedule);
      // navigation.goBack();
      navigation.navigate('Schedule');
    } catch (error) {
      console.error('Error updating schedule:', error.message);
    }
  };

  return (
    <View className="flex-1 px-5 py-10">
      <View className="flex flex-row space-x-4 my-2">
        <TouchableOpacity
          className="w-8 h-8 justify-center -ml-1"
          onPress={() => navigation.goBack()}>
          <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
        </TouchableOpacity>
        <Text className="text-primary font-medium text-2xl">
          Reschedule Call
        </Text>
      </View>
      <View className="pt-2 mb-10 bg-transparent">
        <Calendar
          disableAllTouchEventsForDisabledDays={true}
          markedDates={{
            [moment(selectedDate).format('YYYY-MM-DD')]: {
              selected: true,
              selectedColor: '#222222',
              selectedTextColor: 'yellow',
            },
          }}
          minDate={new Date().toISOString().split('T')[0]}
          onDayPress={day => {
            setSelectedDate(new Date(day.dateString));
          }}
        />
      </View>
      {selectedDate && (
        <View className="px-5 flex flex-row gap-2 mb-4">
          <Text className="text-[#202020] text-sm">Preferred Slot for</Text>
          <Text className="text-slate-700 text-[16px] font-bold">
            {moment(selectedDate).format('MMMM Do YYYY')}
          </Text>
        </View>
      )}
      <ScrollView horizontal={true} className="gap-3">
        {timeSlots.length > 0 ? (
          timeSlots.map((item, index) => (
            <TouchableOpacity
              key={'slot_key' + index}
              className={`flex flex-row items-center px-2 py-1 border ${
                selectedSlot === index ? 'border-primary' : 'border-secondary'
              } rounded-lg`}
              onPress={() => setSelectedSlot(index)}>
              <RadioButton
                color="#997654"
                status={selectedSlot === index ? 'checked' : 'unchecked'}
                value="option1"
                onPress={() => setSelectedSlot(index)}
              />
              <Text className="text-primary">{item}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No available time slots</Text>
        )}
      </ScrollView>
      <View className="px-6 mt-5">
        <TouchableOpacity
          className="bg-primary py-3 rounded-md"
          onPress={handleRescheduleSubmit}>
          <Text className="text-white text-center text-[20px] font-bold">
            Reschedule
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Reschedule;
