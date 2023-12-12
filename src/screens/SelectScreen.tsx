import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import collectionData from '../../assets/collection.json';
import { Screen } from '../components/Screen';

const BASE_URL = 'https://shdw-drive.genesysgo.net/7SGVq4i2SoDxd21UVieiicDHG8HoZ9cNP5i5HQ1JvTZf/';

function AttributeSelector({ data, attribute, onSelectAttribute, selectedValue, isOpen, toggleOpen }) {
  const uniqueAttributes = Array.from(new Set(data.map(item => item[attribute]))).map(attr => {
    const firstItem = data.find(item => item[attribute] === attr);
    return { attr, image: BASE_URL + firstItem.image };
  });

  const handlePress = (attr) => {
    if (attr === selectedValue) {
      onSelectAttribute(attribute, null); // Deselect if the same attribute is pressed again
    } else {
      onSelectAttribute(attribute, attr);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => toggleOpen(attribute)}>
        <Text style={styles.header}>{attribute.toUpperCase()}</Text>
      </TouchableOpacity>
      {isOpen && (
        <FlatList
          data={uniqueAttributes}
          keyExtractor={item => item.attr}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handlePress(item.attr)}
              style={[
                styles.imageContainer,
                item.attr === selectedValue && styles.selectedImageContainer
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
            </TouchableOpacity>
          )}
          horizontal
        />
      )}
    </View>
  );
}

export function SelectScreens() {
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [filteredImages, setFilteredImages] = useState([]);
  const [openCategories, setOpenCategories] = useState({ bg: false, skin: false, clothing: true, hair: false });
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const images = collectionData
      .filter(item => Object.entries(selectedAttributes).every(([attr, value]) => !value || item[attr] === value))
      .map(item => BASE_URL + item.image);
    setFilteredImages(images);

    // Calculate counts for each attribute
    const newCounts = {};
    ['bg', 'skin', 'clothing', 'hair'].forEach(attr => {
      newCounts[attr] = collectionData.filter(item => item[attr] === selectedAttributes[attr]).length;
    });
    setCounts(newCounts);
  }, [selectedAttributes]);

  const handleSelectAttribute = (attribute, value) => {
    setSelectedAttributes(prev => ({ ...prev, [attribute]: value }));
  };

  const toggleOpen = (attribute) => {
    setOpenCategories(prev => ({ ...prev, [attribute]: !prev[attribute] }));
  };

  return (
    <Screen>
      {['bg', 'skin', 'clothing', 'hair'].map(attr => (
        <AttributeSelector
          key={attr}
          data={collectionData}
          attribute={attr}
          onSelectAttribute={handleSelectAttribute}
          selectedValue={selectedAttributes[attr]}
          isOpen={openCategories[attr]}
          toggleOpen={toggleOpen}
        />
      ))}

      <View style={styles.countsContainer}>
        {Object.entries(counts).map(([attr, count]) => (
          selectedAttributes[attr] && (
            <Text key={attr} style={styles.countText}>
              {`${count}/${collectionData.length} (${((count / collectionData.length) * 100).toFixed(2)}%) with selected ${attr}`}
            </Text>
          )
        ))}
      </View>

      {filteredImages.length > 0 && (
        <Text style={styles.matchesHeading}>Matches</Text>
      )}

      <FlatList
        data={filteredImages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.gridImage} />
        )}
        numColumns={3}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedImageContainer: {
    borderColor: 'blue',
    borderWidth: 2
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'cover'
  },
  gridImage: {
    width: 100,
    height: 100,
    margin: 1
  },
  header: {
    fontSize: 12, // Smaller font size for headers
    fontWeight: 'bold',
    padding: 3
  },
  countsContainer: {
    padding: 3
  },
  countText: {
    fontSize: 12,
    padding: 2
  },
  noResultsText: {
    fontSize: 16,
    padding: 10,
    textAlign: 'center'
  }
});

export default SelectScreens;
