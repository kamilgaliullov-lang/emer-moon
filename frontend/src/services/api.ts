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

export interface UserProfileData {
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_mun?: string;
  user_role?: string;
  user_premium?: boolean;
}

export async function updateUserProfile(data: UserProfileData): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/user/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return resp.json();
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return { success: false, error: String(error) };
  }
}
