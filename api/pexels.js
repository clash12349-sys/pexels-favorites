import { PIXABAY_API_KEY } from '../config';

function simplifyPhoto(p) {
  return {
    id: String(p.id),
    photographer: p.user,
    photographerUrl: `https://pixabay.com/users/${p.user}-${p.user_id}/`,
    imageUrl: p.webformatURL,
    alt: p.tags || '',
  };
}

export async function searchPhotos(query, page = 1, perPage = 10) {
  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&page=${page}&per_page=${perPage}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pixabay request failed (${response.status})`);
  const data = await response.json();
  return {
    photos: (data.hits || []).map(simplifyPhoto),
    page,
    totalResults: data.totalHits,
    hasNext: page * perPage < data.totalHits,
  };
}