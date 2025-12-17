import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Database, Check, Activity, Lock, AlertTriangle, BookOpen, X } from 'lucide-react';
import './App.css';

// CONSTANTS
const API_BASE_URL = "https://api-quiz-161c.onrender.com";

// --- LOGIN SCREEN COMPONENT ---
const LoginScreen = ({ onLogin }) => {
  const [teamName, setTeamName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!teamName.trim()) { setError('TEAM NAME REQUIRED'); return; }
    if (accessCode.toUpperCase() !== 'DEMOGORGON') { setError('INVALID SECURITY CLEARANCE CODE'); return; }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/create_team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName }),
      });

      if (!response.ok) throw new Error('SERVER CONNECTION FAILED');

      const data = await response.json();
      await onLogin(data.team_id, data.team_name);

    } catch (err) {
      console.error(err);
      setError('CONNECTION TO HAWKINS LAB FAILED');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="scanlines"></div>
      <div className="vignette"></div>
      
      <div className="login-container">
        <div className="login-header">
          <AlertTriangle size={48} className="warning-icon" />
          <h1>RESTRICTED ACCESS</h1>
          <p>HAWKINS NATIONAL LABORATORY</p>
        </div>

        <form onSubmit={handleSubmit} className="login-box">
          <div className="input-group">
            <label>OPERATIVE TEAM NAME</label>
            <input type="text" placeholder="ENTER DESIGNATION" value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={loading} autoFocus />
          </div>
          <div className="input-group">
            <label>SECURITY CLEARANCE CODE</label>
            <input type="password" placeholder="ENTER PASSCODE" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} disabled={loading} />
          </div>
          {error && <div className="error-message"><Lock size={16} /> {error}</div>}
          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'ESTABLISHING UPLINK...' : 'UNLOCK GATEWAY'}
          </button>
        </form>
        <div className="login-footer"><p>WARNING: UNAUTHORIZED ACCESS IS A CLASS 1 FELONY</p><small>DEPT. OF ENERGY // ID: HNL-85</small></div>
      </div>
    </div>
  );
};

// --- HANDBOOK MODAL COMPONENT (HINT MODE) ---
const HandbookModal = ({ isOpen, onClose, teamId }) => {
  if (!isOpen) return null;
  const idDisplay = teamId || "{TEAM_ID}";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="handbook-modal" onClick={e => e.stopPropagation()}>
        <div className="handbook-header">
          <span>📁 FIELD OPERATIONS MANUAL</span>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>
        <div className="handbook-content">
          <p style={{marginBottom: '2rem', color: '#facc15'}}>PROPERTY OF HAWKINS LAB // SYNTAX GUIDE</p>
          
          <div className="handbook-section">
            <h3>1. INTELLIGENCE GATHERING</h3>
            <p>Check locations and inventory regularly to find clues.</p>
            <div className="code-block">
              GET /{idDisplay}/eleven<br/>
              GET /{idDisplay}/mike<br/>
              GET /{idDisplay}/team_status/{idDisplay}
            </div>
          </div>

          <div className="handbook-section">
            <h3>2. ASSET TRANSFER PROTOCOL</h3>
            <p><strong>Hint:</strong> Key items found in the Upside Down may be needed in the Real World.</p>
            <div className="code-block">
              POST /{idDisplay}/send_item<br/>
              {`{ "from_friend": "Character_Name", "item": "EXACT_ITEM_NAME" }`}
            </div>
          </div>

          <div className="handbook-section">
            <h3>3. EQUIPMENT COMBINATION</h3>
            <p><strong>Hint:</strong> Some technologies must be combined to function. Check item descriptions.</p>
            <div className="code-block">
              PUT /{idDisplay}/use_item<br/>
              {`{ "friend": "Character_Name", "action": "combine_item1_item2" }`}
            </div>
          </div>

          <div className="handbook-section">
            <h3>4. FREQUENCY ADJUSTMENT</h3>
            <p><strong>Hint:</strong> Once equipment is combined, it must be tuned to receive the signal.</p>
            <div className="code-block">
              PATCH /{idDisplay}/fix<br/>
              {`{ "friend": "Character_Name", "action": "scan_frequency" }`}
            </div>
          </div>

          <div className="handbook-section">
            <h3>5. SECURITY OVERRIDE</h3>
            <p><strong>Hint:</strong> Remove obstacles using the numeric code revealed by the radio.</p>
            <div className="code-block">
              DELETE /{idDisplay}/remove<br/>
              {`{ "friend": "Character_Name", "code": "4_DIGIT_CODE" }`}
            </div>
          </div>

          <div className="handbook-section">
            <h3>6. EXTRACTION PROTOCOL</h3>
            <p style={{color: '#ef4444'}}><strong>Warning:</strong> The gate is unstable. Both operatives must trigger extraction within 10 seconds.</p>
            <div className="code-block">
              POST /{idDisplay}/escape<br/>
              {`{ "friend": "Character_Name" }`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- VICTORY MODAL COMPONENT ---
const VictoryModal = ({ isOpen, onReset, escapeKey }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="victory-modal">
        <h1 className="victory-title">ESCAPED!</h1>
        <p className="victory-text">
          Congratulations, Operatives. You have successfully navigated the Upside Down and closed the gate.
        </p>
        
        {escapeKey && (
          <div className="escape-key-box">
            KEY: {escapeKey}
          </div>
        )}

        <button className="next-mission-btn" onClick={onReset}>
          NEXT MISSION
        </button>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const StrangerThingsDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teamData, setTeamData] = useState({ id: '', name: '' });
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [copied, setCopied] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  
  // New States
  const [showHandbook, setShowHandbook] = useState(false);
  const [victoryData, setVictoryData] = useState({ won: false, key: '' });

  const handleLogin = (id, name) => {
    setTeamData({ id, name });
    setIsAuthenticated(true);
  };

  const handleReset = () => {
    setIsAuthenticated(false);
    setTeamData({ id: '', name: '' });
    setVictoryData({ won: false, key: '' });
    setGameStarted(false);
    setIsUpsideDown(false);
  };

  const toggleDimension = () => setIsUpsideDown(!isUpsideDown);
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  // Poll for Victory Status
  useEffect(() => {
    if (!isAuthenticated || !teamData.id || victoryData.won) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/team_status/${teamData.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.escaped) {
            const keyResponse = await fetch(`${API_BASE_URL}/${teamData.id}/key`);
            const keyData = await keyResponse.json();
            setVictoryData({ won: true, key: keyData.escape_key });
          }
        }
      } catch (err) {
        console.error("Status poll failed", err);
      }
    };

    // --- FIX: Corrected setInterval syntax ---
    const interval = setInterval(checkStatus, 3000); // Correct way: (function, delay)
    return () => clearInterval(interval);
  }, [isAuthenticated, teamData.id, victoryData.won]);

  const teamIdDisplay = teamData.id || '{team_id}';
  const apiEndpoints = [
    { method: 'GET', url: `/${teamIdDisplay}/eleven`, desc: 'Eleven: Look around Hawkins Lab' },
    { method: 'GET', url: `/${teamIdDisplay}/mike`, desc: 'Mike: Look around Upside Down' },
    { method: 'POST', url: `/${teamIdDisplay}/send_item`, desc: 'Send item across dimensions' },
    { method: 'PUT', url: `/${teamIdDisplay}/use_item`, desc: 'Combine or use items' },
    { method: 'PATCH', url: `/${teamIdDisplay}/fix`, desc: 'Fix or adjust equipment' },
    { method: 'DELETE', url: `/${teamIdDisplay}/remove`, desc: 'Remove obstacle / activate panel' },
    { method: 'HEAD', url: `/${teamIdDisplay}/status`, desc: 'Quick dimension sync check' },
    { method: 'OPTIONS', url: `/${teamIdDisplay}/escape`, desc: 'Discover escape requirements' },
    { method: 'POST', url: `/${teamIdDisplay}/escape`, desc: 'Attempt to escape' },
    { method: 'GET', url: `/${teamIdDisplay}/key`, desc: 'Retrieve escape key' },
    { method: 'GET', url: `/${teamIdDisplay}/hint`, desc: 'Get context-aware hint' },
  ];

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className={`dashboard-wrapper ${isUpsideDown ? 'upside-down' : ''}`}>
      <div className="scanlines"></div>
      <div className="vignette"></div>

      {/* HEADER */}
      <header>
        <div className="container">
          <div className="header-inner">
            <div className="logo"><h1>STRANGER APIS</h1></div>
            <div className="header-controls">
              <div style={{marginRight: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right'}}>
                <div>OPERATIVE: <span style={{color: 'var(--success)'}}>{teamData.name}</span></div>
                <div style={{fontSize: '0.7rem', opacity: 0.7}}>ID: {teamData.id}</div>
              </div>
              <button className="dimension-toggle" onClick={toggleDimension}>
                {isUpsideDown ? 'UPSIDE DOWN' : 'NORMAL WORLD'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container">
        {/* Hero Section */}
        <section className="hero">
          <h2>Welcome to Hawkins Lab:<br /><span style={{ color: 'var(--danger)' }}>API Coordination Training</span></h2>
          <p>Eleven and Mike are separated across dimensions. Use your mastery of HTTP Methods to pass items through the rift and coordinate their escape.</p>

          <div className="cards-container">
            <CharacterCard name="Eleven" items={['Eggos', 'Psychic Blast']} world="Upside Down" borderColor="#ef4444" />
            <div style={{ alignSelf: 'center' }}><Activity size={48} color={isUpsideDown ? '#ef4444' : '#0F4C75'} /></div>
            <CharacterCard name="Mike" items={['Walkie-Talkie', 'Flashlight']} world="Hawkins" borderColor="#3b82f6" />
          </div>

          {!gameStarted ? (
            <button onClick={() => setGameStarted(true)} className="cta-button">START YOUR ESCAPE</button>
          ) : (
            <div className="hardware-container">
              <div className="hardware-top-bezel"><div className="neon-red-text">GATEWAY PORTAL OPENED</div></div>
              <div className="hardware-mid-section">
                <div className="crt-screen-container">
                  <div className="crt-screen-content"><code style={{fontSize: '1.2rem'}}>{API_BASE_URL}</code></div>
                </div>
                <div className="hardware-button-container">
                  <button onClick={() => copyToClipboard(API_BASE_URL, 'base-url')} className="blue-physical-btn">
                    {copied === 'base-url' ? <Check size={32} strokeWidth={3} /> : <Copy size={32} strokeWidth={3} />}
                  </button>
                </div>
              </div>
              <div className="hardware-bottom-bezel"><div className="led-matrix-display"><span className="led-text">Your Team ID is: {teamData.id}</span></div></div>
            </div>
          )}
        </section>

        {/* Info Grid */}
        <section className="info-grid">
          <div className="glass-panel">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
              <Database /> Mission Briefing
            </h3>
            <p style={{marginBottom: '1rem'}}><strong>THE SITUATION:</strong> Characters are trapped in separate JSON objects.</p>
            <p><strong>THE GOAL:</strong> Transfer key items and GET /{teamData.id}/key.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Terminal /> Method Matrix
            </h3>
            <div className="method-matrix">
              <div className="matrix-cell m-get"><strong>GET</strong><span>CHECK</span>Check</div>
              <div className="matrix-cell m-post"><strong>POST</strong><span>SEND</span>Create</div>
              <div className="matrix-cell m-put"><strong>PUT</strong><span>MIX</span>Update</div>
              <div className="matrix-cell m-patch"><strong>PATCH</strong><span>FIX</span>Modify</div>
              <div className="matrix-cell m-delete"><strong>DEL</strong><span>CUT</span>Remove</div>
              <div className="matrix-cell m-head"><strong>HEAD</strong><span>PING</span>Status</div>
            </div>
          </div>
        </section>

        {/* Live Monitor */}
        <section className="monitor-section">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '1rem' }}>&gt; LIVE TERMINAL MONITOR</h3>
          <div className="terminal-window">
            <div className="terminal-header">
              <span>root@hawkins-lab:~# api_monitor.sh --team={teamData.id}</span>
              <div className="terminal-dots"><div className="dot" style={{background: '#ef4444'}}></div><div className="dot" style={{background: '#eab308'}}></div><div className="dot" style={{background: '#22c55e'}}></div></div>
            </div>
            <div className="terminal-body">
              {apiEndpoints.map((ep, index) => (
                <EndpointRow key={index} method={ep.method} url={ep.url} fullUrl={`${API_BASE_URL}${ep.url}`} desc={ep.desc} onCopy={copyToClipboard} copied={copied} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Handbook Button */}
      <button className="handbook-toggle" onClick={() => setShowHandbook(true)} title="Open Handbook">
        <BookOpen size={24} />
      </button>

      {/* MODALS */}
      <HandbookModal isOpen={showHandbook} onClose={() => setShowHandbook(false)} teamId={teamData.id} />
      <VictoryModal isOpen={victoryData.won} onReset={handleReset} escapeKey={victoryData.key} />
    </div>
  );
};

// Sub-components
const CharacterCard = ({ name, items, world, borderColor }) => (
  <div className="char-card" style={{ borderColor: borderColor }}>
    <small style={{ textTransform: 'uppercase', color: '#6b7280' }}>{world}</small>
    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: '10px 0' }}>{name}</div>
    {items.map(item => <div key={item} style={{ background: 'rgba(0,0,0,0.5)', padding: '4px', fontSize: '0.8rem', marginBottom: '4px' }}>{item}</div>)}
  </div>
);

const EndpointRow = ({ method, url, fullUrl, desc, onCopy, copied }) => (
  <div className="endpoint-row">
    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }}>
      <span className={`badge ${method}`}>{method}</span>
      <code style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{url}</code>
    </div>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '10px' }}>
      <span style={{ fontSize: '0.8rem', color: '#6b7280' }} className="hidden md:block">{desc}</span>
      <button onClick={() => onCopy(fullUrl, url)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
        {copied === url ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
      </button>
    </div>
  </div>
);

export default StrangerThingsDashboard;