import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

import { Screen } from '../components/Screen';

export function HomeScreen({ navigation }) {

  const handlePress = (target) => {
    navigation.navigate(target);
  };

  return (
    <Screen style={tw`bg-black flex-1 justify-center items-center`}>
      <Image
        source={require('../../assets/metame.gif')} // Path to the initial GIF
        style={{ width: 300, height: 300 }}
        resizeMode="contain"
      />
      <TouchableOpacity
        onPress={() => handlePress('Traits')}
        style={tw`bg-yellow-400 mt-8 px-6 py-3 rounded-full`}
      >
        <Text style={tw`text-lg font-bold text-black`}>Explore Traits</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handlePress('Explorer')}
        style={tw`bg-yellow-400 mt-8 px-6 py-3 rounded-full`}
      >
        <Text style={tw`text-lg font-bold text-black`}>Explore On Chain</Text>
      </TouchableOpacity>
    </Screen>
  );
}
