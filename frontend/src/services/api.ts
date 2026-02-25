const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function fetchWeather(lat: number, lng: number) {
  const resp = await fetch(`${BACKEND_URL}/api/weather?lat=${lat}&lng=${lng}`);
  return resp.json();
}

export async function sendChatMessage(
  query: string,
  conversationId?: string,
  userId?: string
) {
  const resp = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      conversation_id: conversationId || '',
      user: userId || 'anonymous',
    }),
  });
  return resp.json();
}
