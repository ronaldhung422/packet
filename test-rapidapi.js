// Test RapidAPI directly
const url = 'https://www.instagram.com/reel/Dc_Ca43KO06/';
const apiUrl = `https://instagram-scraper-20251.p.rapidapi.com/postdetail/?url_embed_safe=true&code_or_url=${encodeURIComponent(url)}`;

fetch(apiUrl, {
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'instagram-scraper-20251.p.rapidapi.com',
    'x-rapidapi-key': 'ca3e8ce95cmsh8f0a123057ce6f9p165924jsn26410f3a065c'
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  return response.text();
})
.then(text => {
  console.log('Response length:', text.length);
  console.log('First 200 chars:', text.substring(0, 200));
  try {
    const json = JSON.parse(text);
    console.log('\nParsed JSON successfully');
    console.log('Has data:', !!json.data);
    if (json.data) {
      console.log('Location name:', json.data.location?.name);
      console.log('Location address:', json.data.location?.address);
    }
  } catch (e) {
    console.error('Failed to parse JSON');
  }
})
.catch(error => {
  console.error('Error:', error.message);
});
