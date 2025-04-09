import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

interface CacheItem {
  uri: string;
  timestamp: number;
}

const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const CACHE_KEY = 'IMAGE_CACHE_MAP';

export const useImageCache = () => {
  const [cacheMap, setCacheMap] = useState<Record<string, CacheItem>>({});

  useEffect(() => {
    loadCacheMap();
  }, []);

  const loadCacheMap = async () => {
    try {
      const cacheData = await AsyncStorage.getItem(CACHE_KEY);
      if (cacheData) {
        setCacheMap(JSON.parse(cacheData));
      }
    } catch (error) {
      console.error('Error loading cache map:', error);
    }
  };

  const saveCacheMap = async (newCacheMap: Record<string, CacheItem>) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newCacheMap));
      setCacheMap(newCacheMap);
    } catch (error) {
      console.error('Error saving cache map:', error);
    }
  };

  const getCachedImage = async (url: string): Promise<string> => {
    const cacheItem = cacheMap[url];
    const now = Date.now();

    // If cache exists and is not expired
    if (cacheItem && now - cacheItem.timestamp < CACHE_EXPIRY) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(cacheItem.uri);
        if (fileInfo.exists) {
          return cacheItem.uri;
        }
      } catch (error) {
        console.error('Error checking cached file:', error);
      }
    }

    // Download and cache the image
    try {
      const filename = url.split('/').pop() || Date.now().toString();
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.downloadAsync(url, fileUri);
      
      const newCacheMap = {
        ...cacheMap,
        [url]: {
          uri: fileUri,
          timestamp: now,
        },
      };
      
      await saveCacheMap(newCacheMap);
      return fileUri;
    } catch (error) {
      console.error('Error caching image:', error);
      return url; // Fallback to original URL if caching fails
    }
  };

  const clearCache = async () => {
    try {
      // Delete all cached files
      for (const key in cacheMap) {
        const item = cacheMap[key];
        try {
          await FileSystem.deleteAsync(item.uri);
        } catch (error) {
          console.error('Error deleting cached file:', error);
        }
      }

      // Clear cache map
      await AsyncStorage.removeItem(CACHE_KEY);
      setCacheMap({});
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return {
    getCachedImage,
    clearCache,
  };
}; 