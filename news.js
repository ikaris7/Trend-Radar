export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  const query = String(request.query.q || '').trim();
  if (!query) {
    return response.status(400).json({ error: 'Digite um assunto para pesquisar.' });
  }

  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: 'A variável NEWSDATA_API_KEY ainda não foi configurada na Vercel.'
    });
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    q: query.slice(0, 100),
    language: 'pt',
    image: '1'
  });

  try {
    const upstream = await fetch(`https://newsdata.io/api/1/latest?${params}`);
    const data = await upstream.json();

    if (!upstream.ok || data.status === 'error') {
      const message = data?.results?.message || data?.message || 'A API de notícias não respondeu corretamente.';
      return response.status(502).json({ error: message });
    }

    const articles = (data.results || [])
      .filter(article => article.title && article.link)
      .map(article => ({
        id: article.article_id || article.link,
        title: article.title,
        description: article.description || article.content || 'Sem resumo disponível.',
        image: article.image_url || null,
        favicon: getFavicon(article.source_url || article.link),
        url: article.link,
        publishedAt: normalizeDate(article.pubDate || article.pubDateTZ),
        source: article.source_name || article.source_id || 'Fonte não informada',
        sourceUrl: article.source_url || null,
        category: article.category || [],
        country: article.country || []
      }));

    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return response.status(200).json({ query, total: articles.length, articles });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Não foi possível buscar notícias neste momento.' });
  }
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString();
  const iso = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function getFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  } catch {
    return null;
  }
}
