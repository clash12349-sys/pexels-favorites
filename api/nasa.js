
const BASE_URL = 'https://images-api.nasa.gov/search';

function simplifyPhoto(item) {
  const d = item.data[0];
  const links = item.links || [];
  // Choose the best-quality preview that is available
  const best =
    links.find((l) => l.href.includes('~medium')) ||
    links.find((l) => l.href.includes('~large')) ||
    links[0];

  return {
    // Firebase keys can't contain . # $ [ ] / so we replace them
    id: d.nasa_id.replace(/[.#$\[\]\/]/g, '_'),
    title: d.title,
    photographer: d.photographer || d.secondary_creator || `NASA ${d.center || ''}`.trim(),
    photographerUrl: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,
    imageUrl: best ? best.href.replace('http://', 'https://') : '',
    alt: d.description || d.title || '',
  };
}

export async function searchPhotos(query, page = 1, perPage = 10) {
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&media_type=image&page=${page}&page_size=${perPage}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NASA request failed (${response.status})`);

  const data = await response.json();
  const items = data.collection.items || [];
  const total = data.collection.metadata?.total_hits || 0;
  const hasNext = (data.collection.links || []).some((l) => l.rel === 'next');

  return {
    photos: items.filter((i) => i.links && i.links.length).map(simplifyPhoto),
    page,
    totalResults: total,
    hasNext,
  };
}