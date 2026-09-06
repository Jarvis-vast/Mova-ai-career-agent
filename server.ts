import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-side state for authenticated LinkedIn user data
interface AuthenticatedLinkedInUser {
  sub: string;
  name: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  emailVerified?: boolean;
  picture?: string;
  locale?: {
    country?: string;
    language?: string;
  };
  accessToken?: string;
  connectedAt: string;
  provider: 'linkedin';
}

let activeLinkedInSession: AuthenticatedLinkedInUser | null = null;

// Helper to resolve canonical App URL
function resolveAppUrl(req: Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol || 'http';
  return `${protocol}://${host}`;
}

// -------------------------------------------------------------
// 1. Health and Environment Diagnostics
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    linkedInConfigured: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
  });
});

// -------------------------------------------------------------
// 2. LinkedIn OAuth Configuration & Status
// -------------------------------------------------------------
app.get('/api/auth/linkedin/config', (req: Request, res: Response) => {
  const appUrl = resolveAppUrl(req);
  const redirectUri = `${appUrl}/auth/callback`;
  const isConfigured = Boolean(
    process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
  );

  res.json({
    isConfigured,
    clientIdConfigured: Boolean(process.env.LINKEDIN_CLIENT_ID),
    hasClientSecret: Boolean(process.env.LINKEDIN_CLIENT_SECRET),
    appUrl,
    redirectUri,
    suggestedSharedRedirectUri: process.env.APP_URL
      ? `${process.env.APP_URL.replace(/\/$/, '')}/auth/callback`
      : redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });
});

app.get('/api/auth/status', (req: Request, res: Response) => {
  const appUrl = resolveAppUrl(req);
  const redirectUri = `${appUrl}/auth/callback`;

  res.json({
    authenticated: Boolean(activeLinkedInSession),
    profile: activeLinkedInSession,
    isConfigured: Boolean(
      process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
    ),
    redirectUri,
  });
});

// -------------------------------------------------------------
// 3. Generate LinkedIn Authorization URL
// -------------------------------------------------------------
app.get('/api/auth/linkedin/url', (req: Request, res: Response) => {
  const appUrl = resolveAppUrl(req);
  const redirectUri = `${appUrl}/auth/callback`;
  const clientId = process.env.LINKEDIN_CLIENT_ID;

  if (!clientId) {
    return res.status(400).json({
      error: 'LINKEDIN_CLIENT_ID is not configured in environment variables.',
      redirectUri,
      setupHelp:
        'Please define LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your environment or AI Studio Secrets.',
    });
  }

  const state = Math.random().toString(36).substring(2, 15);
  const scope = 'openid profile email';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope,
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  res.json({
    url: authUrl,
    redirectUri,
    state,
  });
});

// -------------------------------------------------------------
// 4. OAuth Callback Handlers (/auth/callback & /auth/callback/)
// -------------------------------------------------------------
const handleOAuthCallback = async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query;
  const appUrl = resolveAppUrl(req);
  const redirectUri = `${appUrl}/auth/callback`;

  if (error) {
    const errorMsg = String(error_description || error || 'LinkedIn authentication declined');
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>LinkedIn Authentication Error</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #18181b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #27272a; border: 1px solid #ef4444; border-radius: 12px; padding: 24px; max-width: 440px; text-align: center; }
          h3 { color: #ef4444; margin-top: 0; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>Authentication Error</h3>
          <p>${escapeHtml(errorMsg)}</p>
          <p style="font-size: 12px; color: #71717a;">This window will close automatically...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*');
            setTimeout(function() { window.close(); }, 3500);
          }
        </script>
      </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code in LinkedIn callback.');
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <body style="background: #18181b; color: #f4f4f5; font-family: sans-serif; padding: 24px; text-align: center;">
        <h3 style="color: #ef4444;">Server Configuration Error</h3>
        <p>LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET is missing from the server environment.</p>
      </body>
      </html>
    `);
  }

  try {
    // 1. Exchange authorization code for LinkedIn access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      expires_in?: number;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenData.access_token) {
      const errDetail = tokenData.error_description || tokenData.error || 'Token exchange failed';
      throw new Error(`LinkedIn token error: ${errDetail}`);
    }

    // 2. Fetch authentic LinkedIn user profile via OpenID Connect UserInfo endpoint
    const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoRes.ok) {
      throw new Error(`Failed to fetch LinkedIn userinfo: ${userInfoRes.status} ${userInfoRes.statusText}`);
    }

    const userInfo = (await userInfoRes.json()) as {
      sub: string;
      name: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
      email?: string;
      email_verified?: boolean;
      locale?: {
        country?: string;
        language?: string;
      };
    };

    // Store in active session
    activeLinkedInSession = {
      sub: userInfo.sub,
      name: userInfo.name,
      givenName: userInfo.given_name,
      familyName: userInfo.family_name,
      email: userInfo.email,
      emailVerified: userInfo.email_verified,
      picture: userInfo.picture,
      locale: userInfo.locale,
      accessToken: tokenData.access_token,
      connectedAt: new Date().toISOString(),
      provider: 'linkedin',
    };

    // Return popup response that dispatches postMessage to parent window
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>LinkedIn Authentication Success</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #121214; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1c1917; border: 1px solid #22c55e; border-radius: 12px; padding: 28px; max-width: 440px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          h3 { color: #22c55e; margin-top: 0; font-size: 18px; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.5; }
          .badge { display: inline-block; background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-family: monospace; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>Authentication Successful!</h3>
          <p>Linked authentic LinkedIn identity for <strong>${escapeHtml(userInfo.name)}</strong>.</p>
          <div class="badge">Verified via LinkedIn OpenID Connect</div>
          <p style="font-size: 12px; color: #71717a; margin-top: 16px;">This popup is closing and updating your candidate profile...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_AUTH_SUCCESS',
              provider: 'linkedin',
              profile: ${JSON.stringify(activeLinkedInSession)}
            }, '*');
            setTimeout(function() { window.close(); }, 1200);
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
      </html>
    `);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown authentication error';
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <body style="background: #18181b; color: #f4f4f5; font-family: sans-serif; padding: 32px; text-align: center;">
        <h3 style="color: #ef4444;">LinkedIn Verification Failed</h3>
        <p style="color: #a1a1aa;">${escapeHtml(errorMsg)}</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*');
          }
        </script>
      </body>
      </html>
    `);
  }
};

app.get('/auth/callback', handleOAuthCallback);
app.get('/auth/callback/', handleOAuthCallback);

// -------------------------------------------------------------
// 5. Direct LinkedIn Sync with Token or Manual Live Verification
// -------------------------------------------------------------
app.post('/api/auth/linkedin/token-sync', async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'accessToken is required for direct LinkedIn token synchronization.' });
  }

  try {
    const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoRes.ok) {
      return res.status(userInfoRes.status).json({
        error: `LinkedIn API error: ${userInfoRes.status} ${userInfoRes.statusText}`,
      });
    }

    const userInfo = (await userInfoRes.json()) as {
      sub: string;
      name: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
      email?: string;
      email_verified?: boolean;
      locale?: {
        country?: string;
        language?: string;
      };
    };

    activeLinkedInSession = {
      sub: userInfo.sub,
      name: userInfo.name,
      givenName: userInfo.given_name,
      familyName: userInfo.family_name,
      email: userInfo.email,
      emailVerified: userInfo.email_verified,
      picture: userInfo.picture,
      locale: userInfo.locale,
      accessToken,
      connectedAt: new Date().toISOString(),
      provider: 'linkedin',
    };

    res.json({
      success: true,
      profile: activeLinkedInSession,
    });
  } catch (err: unknown) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to query LinkedIn API',
    });
  }
});

// -------------------------------------------------------------
// 6. Disconnect LinkedIn OAuth Session
// -------------------------------------------------------------
app.post('/api/auth/disconnect', (_req: Request, res: Response) => {
  activeLinkedInSession = null;
  res.json({ success: true, message: 'LinkedIn authentication cleared.' });
});

// Helper: Escape HTML to avoid XSS in popup response templates
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -------------------------------------------------------------
// 7. Server Initialization & Vite Middleware Integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
