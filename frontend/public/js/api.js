import { getAuthToken } from './auth.js';

export const BACKEND_URL = "http://localhost:5000";

export async function askAI(message, subject, imageDataUrl) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not logged in');

  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, subject, image: imageDataUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'AI request failed');
  }

  return await response.json();
}