module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { parts } = req.body;
    if (!parts) return res.status(400).json({ error: 'No message parts' });
    
    const models = ['gemini-2.5-flash'];
    let lastError;
    
    for (const modelName of models) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        console.log('Trying model:', modelName);
        
        const geminiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 4000 }
          })
        });
        
        const data = await geminiRes.json();
        if (geminiRes.ok) {
          console.log('Success:', modelName);
          return res.status(200).json(data);
        }
        lastError = data.error?.message || data;
      } catch (e) {
        lastError = e.message;
      }
    }
    
    return res.status(400).json({ error: lastError });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
