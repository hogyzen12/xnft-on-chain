import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';

import { Screen } from '../components/Screen';

export function HomeScreen({ navigation }) {
  const [showSecondGif, setShowSecondGif] = useState(false);

  const handlePressExplore = () => {
    setShowSecondGif(true);
    // Start the timer to navigate to ExamplesScreen
    setTimeout(() => {
      navigation.navigate('Explorer'); // Replace 'Examples' with the actual name used in your navigator
    }, 5000); // Duration of the GIF in milliseconds
  };

  useFocusEffect(
    React.useCallback(() => {
      // Reset the state when the screen is focused
      setShowSecondGif(false);
      return () => {};
    }, [])
  );

  return (
    <Screen style={tw`bg-black flex-1 justify-center items-center`}>
      {!showSecondGif ? (
        <>
          <Image
            source={require('../../assets/metame.gif')} // Path to the initial GIF
            style={{ width: 300, height: 300 }}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={handlePressExplore}
            style={tw`bg-yellow-400 mt-8 px-6 py-3 rounded-full`}
          >
            <Text style={tw`text-lg font-bold text-black`}>Explore On Chain</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Image
          source={require('../../assets/dream.gif')} // Path to the second GIF
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      )}
    </Screen>
  );
}
