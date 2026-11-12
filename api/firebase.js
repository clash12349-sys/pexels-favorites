import {FIREBASE_DB_URL} from '../config.js';

const NODE="favorite_Photos";

export async function getFavorites() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}${NODE}.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    const data = await response.json();
    return data ? Object.values(data) : [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export async function addFavorite(photo) {
    try {
        const response = await fetch(`${FIREBASE_DB_URL}${NODE}.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(photo)
        });
        if (!response.ok) {
            throw new Error('Failed to add favorite');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
}

export async function removeFavorite(photoId) {
    try {
        const response = await fetch(`${FIREBASE_DB_URL}${NODE}/${photoId}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to remove favorite');
        }
        return true;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
}