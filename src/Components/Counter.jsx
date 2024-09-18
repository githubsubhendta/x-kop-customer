// Counter.js
import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';

const Counter = () => {
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);

        return () => clearInterval(intervalRef.current); 
    }, []);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMins = mins < 10 ? '0' + mins : mins;
    const formattedSecs = secs < 10 ? '0' + secs : secs;

    return (
        <Text className="p-2 text-base font-medium">
            {formattedMins}:{formattedSecs} mins left
        </Text>
    );
}

export default Counter;
