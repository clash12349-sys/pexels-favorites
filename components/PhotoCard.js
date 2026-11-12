import React from 'react';
import { View, Image, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function PhotoCard({ photo, isFavorite, onToggleFavorite, width = 280, height = 360, disabled = false }) {
  const openProfile = () => {
    if (photo.photographerUrl) Linking.openURL(photo.photographerUrl);
  };

  return (
    <View style={[styles.card, { width }]}>
      <Image source={{ uri: photo.imageUrl }} style={{ width, height }} resizeMode="cover" />
      <View style={styles.footer}>
        <Pressable onPress={openProfile} style={styles.credit}>
          <FontAwesome name="camera" size={14} color="#05A081" />
          <View style={{ marginLeft: 8, flexShrink: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{photo.photographer}</Text>
            <Text style={styles.link}>View profile ›</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => onToggleFavorite(photo)} disabled={disabled} hitSlop={12}>
          <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={28} color={isFavorite ? '#E63946' : '#555'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginHorizontal: 8, elevation: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  credit: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 10 },
  name: { fontWeight: '700', fontSize: 15, color: '#222' },
  link: { fontSize: 12, color: '#05A081', marginTop: 2 },
});