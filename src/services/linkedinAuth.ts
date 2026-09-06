/**
 * LinkedIn OAuth & Identity Authentication Service
 * Communicates with backend endpoints to manage authentic LinkedIn identity,
 * popup OAuth lifecycle, and real-time profile data ingestion.
 */

import { LinkedInAuthProfile } from '../types';

export interface LinkedInAuthConfig {
  isConfigured: boolean;
  clientIdConfigured: boolean;
  hasClientSecret: boolean;
  appUrl: string;
  redirectUri: string;
  suggestedSharedRedirectUri: string;
  scopes: string[];
}

export interface LinkedInAuthStatusResponse {
  authenticated: boolean;
  profile: LinkedInAuthProfile | null;
  isConfigured: boolean;
  redirectUri: string;
}

export async function fetchLinkedInConfig(): Promise<LinkedInAuthConfig> {
  try {
    const res = await fetch('/api/auth/linkedin/config');
    if (!res.ok) {
      throw new Error(`Failed to load LinkedIn configuration (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch LinkedIn config from server:', err);
    return {
      isConfigured: false,
      clientIdConfigured: false,
      hasClientSecret: false,
      appUrl: window.location.origin,
      redirectUri: `${window.location.origin}/auth/callback`,
      suggestedSharedRedirectUri: `${window.location.origin}/auth/callback`,
      scopes: ['openid', 'profile', 'email'],
    };
  }
}

export async function fetchLinkedInAuthStatus(): Promise<LinkedInAuthStatusResponse> {
  try {
    const res = await fetch('/api/auth/status');
    if (!res.ok) {
      throw new Error(`Failed to load auth status (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch auth status:', err);
    return {
      authenticated: false,
      profile: null,
      isConfigured: false,
      redirectUri: `${window.location.origin}/auth/callback`,
    };
  }
}

export async function initiateLinkedInOAuthFlow(): Promise<{
  popup: Window | null;
  authUrl?: string;
  error?: string;
  redirectUri?: string;
}> {
  try {
    const res = await fetch('/api/auth/linkedin/url');
    const data = await res.json();

    if (!res.ok || !data.url) {
      return {
        popup: null,
        error: data.error || 'Failed to acquire LinkedIn OAuth authorization URL.',
        redirectUri: data.redirectUri,
      };
    }

    // Open the OAuth PROVIDER's URL directly in a popup window
    // (Per AI Studio Preview iframe constraints)
    const width = 600;
    const height = 700;
    const left = window.screenLeft + (window.outerWidth - width) / 2;
    const top = window.screenTop + (window.outerHeight - height) / 2;

    const popup = window.open(
      data.url,
      'linkedin_oauth_popup',
      `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
    );

    return {
      popup,
      authUrl: data.url,
      redirectUri: data.redirectUri,
    };
  } catch (err) {
    return {
      popup: null,
      error: err instanceof Error ? err.message : 'Failed to launch LinkedIn OAuth authorization popup',
    };
  }
}

export async function syncDirectLinkedInToken(accessToken: string): Promise<{
  success: boolean;
  profile?: LinkedInAuthProfile;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/linkedin/token-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Token sync failed' };
    }

    return { success: true, profile: data.profile };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error synchronizing LinkedIn token',
    };
  }
}

export async function disconnectLinkedInAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/disconnect', { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.error('Error disconnecting LinkedIn session:', err);
    return false;
  }
}
