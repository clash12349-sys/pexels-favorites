import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, StyleSheet, Alert, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import PhotoCard from '../components/PhotoCard';

import { getFavorites, addFavorite, removeFavorite } from '../api/firebase';
import { searchPhotos } from '../api/nasa';

const PER_PAGE = 10;

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [photos, setPhotos] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadFavorites = () =>
    getFavorites()
      .then((favs) => setFavoriteIds(new Set(favs.map((f) => f.id))))
      .catch((err) => Alert.alert('Error', err.message));


  useEffect(() => {
    loadFavorites();
  }, []);


  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      return () => {};
    }, [])
  );

  const runSearch = async (query, pageNumber) => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const result = await searchPhotos(query.trim(), pageNumber, PER_PAGE);
      setPhotos(result.photos);
      setPage(result.page);
      setHasNext(result.hasNext);
      setTotalResults(result.totalResults);
      setCurrentQuery(query.trim());
    } catch (err) {
      Alert.alert('Search failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (photo) => {
    setBusyId(photo.id);
    try {
      if (favoriteIds.has(photo.id)) {
        await removeFavorite(photo.id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(photo.id);
          return next;
        });
      } else {
        await addFavorite(photo);
        setFavoriteIds((prev) => new Set(prev).add(photo.id));
      }
    } catch (err) {
      Alert.alert('Could not update favorite', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#05A081" />
          <Text style={styles.hint}>Fetching photos…</Text>
        </View>
      );
    }
    if (photos.length === 0) {
      return (
        <View style={styles.center}>
          <FontAwesome name="image" size={48} color="#bbb" />
          <Text style={styles.hint}>
            {currentQuery ? `No results for "${currentQuery}".` : 'No results yet.\nType something above to search for photos.'}
          </Text>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.resultInfo}>{totalResults} results for "{currentQuery}"</Text>
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 8 }}
          renderItem={({ item }) => (
            <PhotoCard
              photo={item}
              isFavorite={favoriteIds.has(item.id)}
              onToggleFavorite={toggleFavorite}
              disabled={busyId === item.id}
            />
          )}
        />
        <View style={styles.pager}>
          <Pressable style={[styles.pageBtn, page <= 1 && styles.disabled]} disabled={page <= 1} onPress={() => runSearch(currentQuery, page - 1)}>
            <Text style={styles.pageBtnText}>‹ Prev</Text>
          </Pressable>
          <Text style={styles.pageText}>Page {page}</Text>
          <Pressable style={[styles.pageBtn, !hasNext && styles.disabled]} disabled={!hasNext} onPress={() => runSearch(currentQuery, page + 1)}>
            <Text style={styles.pageBtnText}>Next ›</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <FontAwesome name="search" size={18} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Search photos (e.g. joy, ocean)…"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={() => runSearch(searchText, 1)}
          returnKeyType="search"
        />
        <Pressable style={styles.goBtn} onPress={() => runSearch(searchText, 1)}>
          <Text style={styles.goText}>Go</Text>
        </Pressable>
      </View>
      {renderContent()}
      <Text style={styles.attribution}>Photos provided by Pexels.com</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6F5' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, paddingLeft: 14, borderRadius: 30, borderWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 12, fontSize: 16 },
  goBtn: { backgroundColor: '#05A081', paddingHorizontal: 18, paddingVertical: 12, borderTopRightRadius: 30, borderBottomRightRadius: 30 },
  goText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hint: { marginTop: 12, fontSize: 16, color: '#777', textAlign: 'center' },
  resultInfo: { marginHorizontal: 16, color: '#555' },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 10 },
  pageBtn: { backgroundColor: '#05A081', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  pageBtnText: { color: '#fff', fontWeight: '600' },
  pageText: { marginHorizontal: 18, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.35 },
  attribution: { textAlign: 'center', color: '#05A081', paddingBottom: 8, fontSize: 13 },
});