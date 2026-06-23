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
          'x-api-key': 'EAP-2024-7X9Y-2Z3W-4V5U-6T7S-8R9Q-0P1O'
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
    const element = document.getElementById('result-dashboard')
    if (!element) return

    // Clone the element to modify it for PDF without affecting UI
    const clone = element.cloneNode(true)
    clone.style.background = '#0d0d0d' // Solid dark background for PDF
    clone.style.backdropFilter = 'none' // Remove blur as it breaks html2canvas
    clone.style.webkitBackdropFilter = 'none'
    clone.style.border = '1px solid #333'
    clone.style.padding = '40px'
    clone.style.borderRadius = '16px'
    clone.style.width = '800px' // Fix width for PDF consistency

    const opt = {
      margin: [10, 0],
      filename: `${result.full_name || 'student'}_result.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: true,
        backgroundColor: '#030303'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    window.html2pdf().from(clone).set(opt).save()
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
