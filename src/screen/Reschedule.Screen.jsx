import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { RadioButton } from 'react-native-paper';
import moment from 'moment';
import { SvgXml } from 'react-native-svg';
import { SVG_arrow_back } from '../utils/SVGImage';
import { updateSchedule } from '../Api/scheduleService';

const Reschedule = ({ route, navigation }) => {
  const { selectedSchedule, scheduleId } = route.params;
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  // const [refreshing, setRefreshing] = useState(false);

  // Effect to set the selected slot based on the selected schedule
  useEffect(() => {
    const date = new Date(selectedSchedule.startTime);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString('en-US', options).trim();

    const selectedIndex = timeSlots.findIndex(item => {
      const slotStartTime = item.split(' - ')[0].trim();
      return slotStartTime === formattedTime;
    });
    // Set the selected slot to the correct index if found
    if (selectedIndex !== -1) {
      setSelectedSlot(selectedIndex);
    }
  }, [timeSlots, selectedSchedule]);

  useEffect(() => {
    if (selectedSchedule?.startTime) {
      setSelectedDate(selectedSchedule.startTime);
    }
  }, [selectedSchedule]);

  const generateTimeSlots = (startTime, endTime, interval) => {
    let slots = [];
    let currentTime = new Date();

    let slotStart = new Date(startTime);
    while (slotStart < endTime) {
      let slotEnd = new Date(slotStart.getTime() + interval);

      // Exclude past slots
      if (slotEnd > currentTime) {
        slots.push(formatTime(slotStart) + ' - ' + formatTime(slotEnd));
      }

      slotStart = slotEnd;
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
    if (selectedSlot === null) {
      alert('Please select a valid time slot before submitting.');
      return;
    }
    const date = selectedDate;
    const [startTime, endTime] = timeSlots[selectedSlot].split('-');
    try {
      const startDateTime = moment(
        `${moment(date).format('YYYY-MM-DD')} ${startTime.trim()}`,
        'YYYY-MM-DD hh:mm A'
      ).toISOString();

      const endDateTime = moment(
        `${moment(date).format('YYYY-MM-DD')} ${endTime.trim()}`,
        'YYYY-MM-DD hh:mm A'
      ).toISOString();

      if (!startDateTime || !endDateTime) {
        throw new Error('Failed to parse dates');
      }

      const newSchedule = {
        startTime: startDateTime,
        endTime: endDateTime,
      };
      await updateSchedule(scheduleId, newSchedule);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating schedule:', error.message);
    }
  };
  
  return (
    <View className="flex-1 px-5 py-10 bg-white">
      <View className="flex flex-row space-x-4 my-2">
        <TouchableOpacity
          className="w-8 h-8 justify-center -ml-1"
          onPress={() => navigation.goBack()}>
          <SvgXml xml={SVG_arrow_back} height={'100%'} width={'100%'} />
        </TouchableOpacity>
        <Text className="text-primary font-medium text-2xl">Reschedule Call</Text>
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
        {timeSlots &&
          timeSlots.length &&
          timeSlots.map((item, index) => (
            <TouchableOpacity
              key={'slot_key' + index}
              onPress={() => setSelectedSlot(index)}>
              <View
                className={`flex flex-row items-center px-2 py-2 border-2 ${
                  selectedSlot === index ? 'border-primary' : 'border-secondary'
                } rounded-lg`}>
                <RadioButton
                  color="#997654"
                  status={selectedSlot === index ? 'checked' : 'unchecked'}
                  value="option1"
                  onPress={() => setSelectedSlot(index)}
                />
                <Text className="text-primary">{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
