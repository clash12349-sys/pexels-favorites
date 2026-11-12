import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import PhotoCard from '../components/PhotoCard';
import { getFavorites, addFavorite, removeFavorite } from '../api/firebase';

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [removedIds, setRemovedIds] = useState(new Set());


  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getFavorites()
        .then((favs) => {
          if (!active) return;
          setFavorites(favs);
          setRemovedIds(new Set());
          setIndex((i) => (i < favs.length ? i : 0));
        })
        .catch((err) => Alert.alert('Error', err.message))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  const count = favorites.length;
  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const lucky = () => {
    if (count < 2) return;
    let r;
    do {
      r = Math.floor(Math.random() * count);
    } while (r === index);
    setIndex(r);
  };

  const toggleFavorite = async (photo) => {
    setBusy(true);
    try {
      if (removedIds.has(photo.id)) {
        await addFavorite(photo);
        setRemovedIds((prev) => {
          const s = new Set(prev);
          s.delete(photo.id);
          return s;
        });
      } else {
        await removeFavorite(photo.id);
        setRemovedIds((prev) => new Set(prev).add(photo.id));
      }
    } catch (err) {
      Alert.alert('Could not update favorite', err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#05A081" />
      </View>
    );
  }

  if (count === 0) {
    return (
      <View style={styles.center}>
        <FontAwesome name="heart-o" size={52} color="#bbb" />
        <Text style={styles.hint}>No favorites yet.{'\n'}Tap the heart on a photo in the Home tab!</Text>
      </View>
    );
  }

  const photo = favorites[index];

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>{index + 1} / {count}</Text>
      <View style={styles.row}>
        <Pressable onPress={prev} disabled={count < 2}>
          <MaterialIcons name="arrow-back-ios" size={34} color={count < 2 ? '#ccc' : '#05A081'} />
        </Pressable>
        <PhotoCard
          photo={photo}
          isFavorite={!removedIds.has(photo.id)}
          onToggleFavorite={toggleFavorite}
          width={250}
          height={340}
          disabled={busy}
        />
        <Pressable onPress={next} disabled={count < 2}>
          <MaterialIcons name="arrow-forward-ios" size={34} color={count < 2 ? '#ccc' : '#05A081'} />
        </Pressable>
      </View>
      <Pressable style={[styles.luckyBtn, count < 2 && { opacity: 0.4 }]} onPress={lucky} disabled={count < 2}>
        <Text style={styles.luckyText}>🎲 I'm Feeling Lucky</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6F5', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F3F6F5' },
  hint: { marginTop: 12, fontSize: 16, color: '#777', textAlign: 'center' },
  counter: { fontSize: 16, color: '#555', marginBottom: 10, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  luckyBtn: { backgroundColor: '#05A081', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 25, marginTop: 24 },
  luckyText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});