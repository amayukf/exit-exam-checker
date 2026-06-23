// Vercel Serverless Function: /api/exit-exam-result
// This runs server-side on Vercel. The API key is NEVER sent to the browser.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { username } = req.body

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Username is required' })
  }

  // Sanitize: only alphanumeric
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)

  if (!sanitizedUsername) {
    return res.status(400).json({ status: 'error', message: 'Invalid username format' })
  }

  try {
    const upstream = await fetch('https://eap.ethernet.edu.et/api/exit-exam-result', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // API_KEY (no VITE_ prefix) is a server-only secret - never visible in browser
        'x-api-key': process.env.API_KEY
      },
      body: JSON.stringify({ username: sanitizedUsername })
    })

    const data = await upstream.json()

    // Forward the real status code from upstream
    return res.status(upstream.status).json(data)

  } catch (err) {
    console.error('[exit-exam-result] upstream error:', err)
    return res.status(502).json({ status: 'error', message: 'Upstream service unavailable' })
  }
}
