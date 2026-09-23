export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { status: 400, headers }
      )
    }

    // Call RapidAPI
    const apiUrl = `https://instagram-scraper-20251.p.rapidapi.com/postdetail/?url_embed_safe=true&code_or_url=${encodeURIComponent(url)}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-scraper-20251.p.rapidapi.com',
        'x-rapidapi-key': 'ca3e8ce95cmsh8f0a123057ce6f9p165924jsn26410f3a065c'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ error: `API Error: ${response.status}`, details: errorText }),
        { status: response.status, headers }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { status: 200, headers }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    )
  }
}
