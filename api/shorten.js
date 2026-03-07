module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    const tinyUrl = 'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url);
    const response = await fetch(tinyUrl);
    if (!response.ok) throw new Error('TinyURL API error: ' + response.status);

    const short = await response.text();
    if (!short || !short.startsWith('http')) throw new Error('Invalid response from TinyURL');

    return res.status(200).json({ short });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
