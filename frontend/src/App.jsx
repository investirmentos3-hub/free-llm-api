import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('saas-theme') || 'dark');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [usage, setUsage] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('saas-theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('saas-token');
    if (token) {
      loadUser(token);
    }
  }, []);

  const loadUser = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      loadConversations(token);
      loadUsage(token);
    } catch (err) {
      localStorage.removeItem('saas-token');
      setUser(null);
    }
  };

  const loadConversations = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.conversations);
    } catch (err) {
      console.error('Erro ao carregar conversas', err);
    }
  };

  const loadUsage = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/user/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsage(response.data);
    } catch (err) {
      console.error('Erro ao carregar uso', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      const { token, user } = response.data;
      localStorage.setItem('saas-token', token);
      setUser(user);
      setError('');
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const token = localStorage.getItem('saas-token');
    const userMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/chat`,
        {
          message: trimmed,
          model: 'llama3',
          conversationId: activeConversation
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setActiveConversation(response.data.conversationId);
      loadConversations(token);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('saas-token');
    setUser(null);
    setConversations([]);
    setMessages([]);
    setActivePage('chat');
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-strong))',
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px',
              color: 'white',
              fontWeight: '800',
              fontSize: '1.5rem'
            }}>AI</div>
            <h1>Free LLM SaaS</h1>
          </div>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="form-group">
                <label>Nome</label>
                <input type="text" name="name" required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" name="password" required />
            </div>
            {error && <div className="error">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? 'Novo aqui?' : 'Já tem conta?'}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="sidebar-nav">
        <div className="brand">
          <div className="brand-icon">AI</div>
          <h2>Free LLM</h2>
        </div>

        <div className="nav-section">
          <div className="nav-label">Menu</div>
          <button
            className={`nav-link ${activePage === 'chat' ? 'active' : ''}`}
            onClick={() => setActivePage('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-link ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => setActivePage('settings')}
          >
            ⚙️ Configurações
          </button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            {user.name}
            <br />
            <small>{user.email}</small>
          </div>
          <button
            className="btn btn-secondary"
            onClick={logout}
            style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="header">
          <h1>{activePage === 'chat' ? '💬 Chat' : activePage === 'dashboard' ? '📊 Dashboard' : '⚙️ Configurações'}</h1>
          <button
            className="btn btn-secondary"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        </div>

        {activePage === 'chat' && (
          <div className="chat-container">
            <div className="chat-sidebar">
              <button className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                + Nova conversa
              </button>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`nav-link ${activeConversation === conv.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    setMessages(conv.messages || []);
                  }}
                >
                  {conv.title || 'Sem título'}
                </button>
              ))}
            </div>

            <div className="chat-main">
              <div className="messages">
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: 'var(--muted)',
                    margin: 'auto'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✨</div>
                    <p>Comece uma conversa com a IA</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                      <div className="avatar">{msg.role === 'user' ? 'U' : 'AI'}</div>
                      <div className="bubble">{msg.content}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="composer">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  {loading ? '...' : '→'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activePage === 'dashboard' && (
          <div className="page">
            <h2 className="page-title">Dashboard</h2>
            {usage && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{usage.conversations}</div>
                  <div className="stat-label">Conversas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{usage.messages}</div>
                  <div className="stat-label">Mensagens</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{usage.plan === 'free' ? 'Free' : 'Pro'}</div>
                  <div className="stat-label">Plano</div>
                </div>
              </div>
            )}
            <div className="card">
              <h3>Sobre você</h3>
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Plano:</strong> {usage?.plan || 'Free'}</p>
            </div>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="page">
            <h2 className="page-title">Configurações</h2>
            <div className="card">
              <h3>API Key</h3>
              <p>Use sua API Key para integrar com aplicações externas.</p>
              <div className="code-block">
                {user.apiKey}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(user.apiKey);
                  alert('API Key copiada!');
                }}
              >
                📋 Copiar
              </button>
            </div>

            <div className="card">
              <h3>Exemplo de Uso</h3>
              <pre className="code-block">
{`curl -X POST http://localhost:3000/api/chat/chat \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Olá","model":"llama3"}'`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
