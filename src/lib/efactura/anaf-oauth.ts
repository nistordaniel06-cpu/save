import { AnafOAuthToken } from './types';

const ANAF_AUTH_ENDPOINT = 'https://logincert.anaf.ro/anaf-oauth2/v1/auth';
const ANAF_TOKEN_ENDPOINT = 'https://logincert.anaf.ro/anaf-oauth2/v1/token';

export function isAnafOAuthConfigured(): boolean {
  return Boolean(
    process.env.ANAF_CLIENT_ID && 
    process.env.ANAF_CLIENT_SECRET
  );
}

export function getAnafAuthUrl(organizationId: string, returnUrl?: string): string {
  const clientId = process.env.ANAF_CLIENT_ID || 'DEMO_CLIENT_ID';
  const redirectUri = process.env.ANAF_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/efactura/callback`;
  
  const statePayload = JSON.stringify({
    orgId: organizationId,
    returnUrl: returnUrl || '/settings/company',
    timestamp: Date.now(),
  });
  
  const stateEncoded = Buffer.from(statePayload).toString('base64url');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    token_content_type: 'jwt',
    state: stateEncoded,
  });

  return `${ANAF_AUTH_ENDPOINT}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<AnafOAuthToken> {
  const clientId = process.env.ANAF_CLIENT_ID;
  const clientSecret = process.env.ANAF_CLIENT_SECRET;
  const redirectUri = process.env.ANAF_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/efactura/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('ANAF OAuth credentials (ANAF_CLIENT_ID / ANAF_CLIENT_SECRET) are not configured on server.');
  }

  const response = await fetch(ANAF_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ANAF Token exchange failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600,
    tokenType: data.token_type || 'Bearer',
    scope: data.scope || '',
    createdAt: Date.now(),
  };
}

export async function refreshAnafToken(refreshToken: string): Promise<AnafOAuthToken> {
  const clientId = process.env.ANAF_CLIENT_ID;
  const clientSecret = process.env.ANAF_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('ANAF OAuth credentials are not configured on server.');
  }

  const response = await fetch(ANAF_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`ANAF Token refresh failed (${response.status})`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in || 3600,
    tokenType: data.token_type || 'Bearer',
    scope: data.scope || '',
    createdAt: Date.now(),
  };
}
