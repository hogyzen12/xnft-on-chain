import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { atom, useRecoilState } from 'recoil';

import { Screen } from '../components/Screen';

// Atom for storing fetched data
const explorerDataAtom = atom({
  key: 'explorerData',
  default: [],
});

function FullScreenLoadingIndicator() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

function formatPDA(pda) {
  return `${pda.substring(0, 3)}...${pda.substring(pda.length - 3)}`;
}

function ExplorerItem({ item }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
      <Image
        source={{ uri: item.image }}
        style={{ width: 150, height: 150, borderRadius: 10, marginRight: 10 }}
      />
      <View>
        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
        <Text style={{ fontSize: 12 }}>{formatPDA(item.pda)}</Text>
        <Text>Status: {item.status}</Text>
      </View>
    </View>
  );
}

export function TraitsScreens() {
  const [explorerData, setExplorerData] = useRecoilState(explorerDataAtom);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('https://solanagetaccount.info/on-chain-queue')
      .then(response => response.json())
      .then(data => {
        setExplorerData(data.data.sort((a, b) => b.index - a.index));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const filteredData = searchQuery
    ? explorerData.filter(item => item.index.toString() === searchQuery)
    : explorerData;

  if (loading) {
    return <FullScreenLoadingIndicator />;
  }

  return (
    <Screen>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 10, margin: 10 }}
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
        placeholder="Search by index"
        keyboardType="numeric"
      />
      <FlatList
        data={filteredData}
        keyExtractor={item => item.mint}
        renderItem={({ item }) => <ExplorerItem item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
      />
    </Screen>
  );
}
