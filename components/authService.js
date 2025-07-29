// Updated authService.js to use backend endpoints and JWT token
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://syncmeet-back.onrender.com';

export async function signInWithEmail(email, password) {
  const res = await fetch(`${API_URL}/req/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const result = await res.json();
  await AsyncStorage.setItem('token', result.token);
  await AsyncStorage.setItem('email', email);
  return result;
}

export async function signUpWithEmail(email, password, fullName) {
  const res = await fetch(`${API_URL}/req/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, email, name: fullName, password }),
  });
  if (!res.ok) throw new Error('Signup failed');
  const result = await res.json();
  await AsyncStorage.setItem('token', result.token);
  await AsyncStorage.setItem('email', email);
  await AsyncStorage.setItem('fullName', fullName || '');
  return result;
}

export async function signOutUser() {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('email');
  await AsyncStorage.removeItem('fullName');
}

export async function getCurrentUser() {
  const email = await AsyncStorage.getItem('email');
  const token = await AsyncStorage.getItem('token');
  if (email && token) return { email, token };
  return null;
}

export async function getToken() {
  return await AsyncStorage.getItem('token');
}

// Helper for authenticated requests
export async function authFetch(url, options = {}) {
  const token = await getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}