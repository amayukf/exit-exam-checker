import { useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    const processedUsername = username.replace(/\//g, '').trim()

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/exit-exam-result', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({ username: processedUsername })
      })

      const json = await response.json()

      if (json.status === 'success' || response.ok) {
        // Handle the real API structure: { status, data: { full_name, results: [] } }
        setResult(json.data || json) 
      } else {
        setError(json.message || 'Student result not found. Please check the username.')
      }
    } catch (err) {
      console.error(err)
      setError('Connection failed. Please ensure the server is running and the proxy is active.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const fullName = result.full_name || result.fullName || 'N/A'
    const institution = result.institution_name || 'N/A'
    const department = result.exam_topic_name || 'N/A'
    const examDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    const resultsRows = result.results && result.results.length > 0
      ? result.results.map(r => `
          <tr>
            <td>${r.year}</td>
            <td style="font-weight:700; font-size:1.2rem;">${r.total_score}</td>
            <td><span class="status ${r.status.toLowerCase()}">${r.status}</span></td>
          </tr>`).join('')
      : `<tr><td colspan="3" style="text-align:center; color:#999;">No examination records found.</td></tr>`

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Official Result - ${fullName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 40px; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 30px; }
          .header-left h1 { font-size: 1.4rem; font-weight: 800; color: #1a1a2e; }
          .header-left p { font-size: 0.8rem; color: #555; margin-top: 4px; }
          .badge { background: #1a1a2e; color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
          .section-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 6px; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; background: #f7f9fc; border-radius: 12px; padding: 24px; margin-bottom: 30px; }
          .info-item .value { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          thead tr { background: #1a1a2e; color: white; }
          thead th { padding: 12px 16px; text-align: left; font-size: 0.85rem; }
          tbody tr:nth-child(even) { background: #f7f9fc; }
          tbody td { padding: 12px 16px; font-size: 0.95rem; border-bottom: 1px solid #eee; }
          .status { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
          .status.pass { background: #e6f9f0; color: #1a7a4a; }
          .status.fail { background: #fdecea; color: #c0392b; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 0.75rem; color: #999; }
          .watermark { text-align: center; margin-top: 30px; color: #c8c8c8; font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>Ministry of Education — Result Transcript</h1>
            <p>National Higher Education Exit Examination Authority</p>
          </div>
          <span class="badge">OFFICIAL DOCUMENT</span>
        </div>

        <div class="section-title">Student Information</div>
        <div class="info-grid">
          <div class="info-item"><div class="section-title">Full Name</div><div class="value">${fullName}</div></div>
          <div class="info-item"><div class="section-title">Institution</div><div class="value">${institution}</div></div>
          <div class="info-item"><div class="section-title">Department</div><div class="value">${department}</div></div>
        </div>

        <div class="section-title">Examination History</div>
        <table>
          <thead>
            <tr>
              <th>Examination Period</th>
              <th>Total Score</th>
              <th>Result Status</th>
            </tr>
          </thead>
          <tbody>
            ${resultsRows}
          </tbody>
        </table>

        <div class="watermark">NEAEA — National Educational Assessment and Examinations Agency</div>

        <div class="footer">
          <span>Generated: ${examDate}</span>
          <span>Exam ID: ${result.username || 'N/A'}</span>
          <span>result.ethernet.edu.et</span>
        </div>
      </body>
      </html>`

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;'
    document.body.appendChild(iframe)
    iframe.contentDocument.open()
    iframe.contentDocument.write(htmlContent)
    iframe.contentDocument.close()

    iframe.onload = () => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 2000)
    }
  }

  return (
    <div className="app-container">
      <div className="bg-mesh"></div>
      <div className="grid-overlay"></div>

      <header className="fade-in">
        <div className="logo-container">
          <div className="logo-orb"></div>
          <h1>Result Portal</h1>
        </div>
        <p className="subtitle">
          National Higher Education Exit Examination Result System. 
          Enter your username to access your academic achievements.
        </p>
      </header>

      <main className="search-wrapper fade-in" style={{ animationDelay: '0.2s' }}>
        <form onSubmit={handleSearch} className="search-input-group">
          <input
            type="text"
            placeholder="Enter Exam Username (e.g. ETS/1245/15)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'View Result'}
          </button>
        </form>
      </main>

      <section className="result-section">
        {loading && (
          <div style={{ textAlign: 'center' }}>
            <div className="loader"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Decrypting Academic Records...
            </p>
          </div>
        )}

        {error && (
          <div className="error-msg fade-in">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="result-container fade-in">
            <div id="result-dashboard" className="result-card glass">
              <div className="student-info">
                <div className="info-item">
                  <label>Student Name</label>
                  <span>{result.full_name || result.fullName || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Institution</label>
                  <span>{result.institution_name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <span>{result.exam_topic_name || 'N/A'}</span>
                </div>
              </div>

              <div className="scores-list" style={{ marginTop: '2rem' }}>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '1px' }}>
                  Examination History
                </label>
                
                <div className="scores-grid" style={{ marginTop: '1rem' }}>
                  {result.results && result.results.length > 0 ? (
                    result.results.map((res, index) => (
                      <div key={index} className="score-card">
                        <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{res.year}</label>
                        <div className="score-value">{res.total_score}</div>
                        <div className={`status-badge ${res.status.toLowerCase()}`}>
                          {res.status}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="score-card">
                      <label style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Total Score</label>
                      <div className="score-value">{result.totalScore || '--'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Out of 100</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button className="download-btn" onClick={handleDownload}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Official PDF Report
              </button>
            </div>
          </div>
        )}
      </section>

      <footer style={{ marginTop: 'auto', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.8rem', textAlign: 'center' }}>
        &copy; 2026 Ministry of Education. Premium Dashboard.
      </footer>
    </div>
  )
}

export default App
