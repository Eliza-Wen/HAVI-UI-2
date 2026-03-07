module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const { parts } = req.body;
    
    if (!parts) {
      return res.status(400).json({ error: 'No message parts provided' });
    }
    
    const modelName = 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Calling Gemini API with model:', modelName);
    
    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000
        }
      })
    });

    const data = await geminiRes.json();
    
    if (!geminiRes.ok) {
      console.error('Gemini API error:', data);
      const errorMsg = data.error?.message || JSON.stringify(data) || 'Unknown API error';
      return res.status(geminiRes.status).json({ error: errorMsg });
    }

    return res.status(200).json(data);
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
