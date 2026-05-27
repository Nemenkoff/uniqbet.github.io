/**
 * UNIQBET — клиентское API
 * Подключается на всех страницах: <script src="/api.js"></script>
 * Заменяет прямую работу с localStorage для auth и баланса.
 */

const API = (() => {
  const BASE = 'https://tired-worlds-ring.loca.lt/api';

  // ── Токен ──────────────────────────────────────────────
  function getToken()        { return localStorage.getItem('uniqbet_token'); }
  function setToken(t)       { localStorage.setItem('uniqbet_token', t); }
  function clearToken()      { localStorage.removeItem('uniqbet_token'); }

  // ── Сессия (кэш в памяти + localStorage) ───────────────
  function getSession() {
    try { return JSON.parse(localStorage.getItem('uniqbet_session')); }
    catch { return null; }
  }
  function setSession(data) {
    localStorage.setItem('uniqbet_session', JSON.stringify(data));
  }
  function clearSession() {
    localStorage.removeItem('uniqbet_session');
    clearToken();
  }

  // ── Базовый fetch с авторизацией ───────────────────────
  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
    return data;
  }

  // ══════════════════════════════════════════════════════
  //  AUTH
  // ══════════════════════════════════════════════════════

  async function register({ username, email, password }) {
    const data = await request('POST', '/register', { username, email, password });
    setToken(data.token);
    setSession({ username: username.toLowerCase(), displayName: data.displayName, playerId: data.playerId, email });
    return data;
  }

  async function login({ login, password }) {
    const data = await request('POST', '/login', { login, password });
    setToken(data.token);
    setSession({ username: login.toLowerCase(), displayName: data.displayName, playerId: data.playerId, email: data.email });
    return data;
  }

  function logout() {
    clearSession();
  }

  function isLoggedIn() {
    return !!getToken() && !!getSession();
  }

  // ══════════════════════════════════════════════════════
  //  BALANCE
  // ══════════════════════════════════════════════════════

  async function loadBalance() {
    return await request('GET', '/balance');
  }

  async function saveBalance(balanceData) {
    return await request('POST', '/balance', balanceData);
  }

  async function addTransaction({ type, amount, note }) {
    return await request('POST', '/transaction', { type, amount, note });
  }

  async function getTransactions() {
    return await request('GET', '/transactions');
  }

  // ══════════════════════════════════════════════════════
  //  PUBLIC
  // ══════════════════════════════════════════════════════
  return {
    register,
    login,
    logout,
    isLoggedIn,
    getSession,
    loadBalance,
    saveBalance,
    addTransaction,
    getTransactions,
  };
})();
