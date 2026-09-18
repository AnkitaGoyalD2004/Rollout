const API_BASE = '/api';
const FLAGS_URL = `${API_BASE}/flags`;
const AUTH_URL = `${API_BASE}/auth`;

// Helper to get authorization headers
function getAuthHeaders() {
  const token = localStorage.getItem('rollout_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// 1. AUTHENTICATION APIS (Dynamic - users type their own company)
export async function registerUser({ name, email, password, company }) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, company }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
}

export async function getMe() {
  const res = await fetch(`${AUTH_URL}/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Session invalid or expired');
  }
  return res.json();
}

// 2. FEATURE FLAGS APIS (Company is securely identified via the JWT token)
export async function getFlags(env = 'all') {
  const url = env && env !== 'all' ? `${FLAGS_URL}?env=${encodeURIComponent(env)}` : FLAGS_URL;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

// Fetch recent audit logs for authenticated workspace
export async function getAuditLogs() {
  const res = await fetch(`${FLAGS_URL}/audit-logs`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

// Create a new flag in authenticated company workspace
export async function createFlag(flagData) {
  const res = await fetch(FLAGS_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(flagData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create flag');
  }
  return res.json();
}

// Toggle a flag ON or OFF
export async function toggleFlag(id) {
  const res = await fetch(`${FLAGS_URL}/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to toggle flag');
  return res.json();
}

// Update an existing flag
export async function updateFlag(id, updateData) {
  const res = await fetch(`${FLAGS_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update flag');
  }
  return res.json();
}

// Delete a flag
export async function deleteFlag(id) {
  const res = await fetch(`${FLAGS_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete flag');
  return res.json();
}

// Test / Evaluate a flag (Public evaluation endpoint)
export async function evaluateFlag(key, userId, env = 'production', company = '') {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (env && env !== 'all') params.append('env', env);
  if (company && company !== 'all') params.append('company', company);

  const url = `${FLAGS_URL}/evaluate/${encodeURIComponent(key)}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to evaluate flag');
  }
  return res.json();
}


