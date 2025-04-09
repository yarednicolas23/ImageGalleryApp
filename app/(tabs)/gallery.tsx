import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useImageCache } from '../hooks/useImageCache';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = width / COLUMN_COUNT;

interface ImageItem {
  id: string;
  download_url: string;
  author: string;
}

export default function GalleryScreen() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { getCachedImage } = useImageCache();

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (imageId: string) => {
    try {
      const newFavorites = favorites.includes(imageId)
        ? favorites.filter(id => id !== imageId)
        : [...favorites, imageId];
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const fetchImages = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://picsum.photos/v2/list?page=${page}&limit=30`
      );
      const data = await response.json();
      setImages(prevImages => [...prevImages, ...data]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
    fetchImages();
  }, []);

  const renderItem = useCallback(({ item }: { item: ImageItem }) => {
    const isFavorite = favorites.includes(item.id);

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.download_url }}
          style={styles.image}
          resizeMode="cover"
          onLoad={async () => {
            await getCachedImage(item.download_url);
          }}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#ff0000' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>
    );
  }, [favorites, getCachedImage]);

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={COLUMN_COUNT}
        onEndReached={fetchImages}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0096FF" style={styles.loader} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 4,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    padding: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 4,
  },
  loader: {
    padding: 20,
  },
}); 