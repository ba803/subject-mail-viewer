const { google } = require('googleapis');

class GoogleAuthService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5050/api/auth/callback';

    this.scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
  }

  isConfigured() {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      !process.env.GOOGLE_CLIENT_ID.includes('your_google_client_id')
    );
  }

  getRedirectUri(customRedirectUri) {
    if (customRedirectUri) return customRedirectUri;
    if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
    if (process.env.RENDER_EXTERNAL_URL) {
      return `${process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '')}/api/auth/callback`;
    }
    if (process.env.NODE_ENV === 'production') {
      return 'https://subject-mail-viewer.onrender.com/api/auth/callback';
    }
    return this.redirectUri || 'http://localhost:5050/api/auth/callback';
  }

  getOAuth2Client(customRedirectUri) {
    const redirect = this.getRedirectUri(customRedirectUri);
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirect
    );
  }

  getAuthUrl(state = 'auth_flow', customRedirectUri) {
    if (!this.isConfigured()) {
      throw new Error('Google OAuth credentials are not configured in environment variables.');
    }

    const oauth2Client = this.getOAuth2Client(customRedirectUri);
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: this.scopes,
      state: state,
    });
  }

  async getTokens(code, customRedirectUri) {
    const oauth2Client = this.getOAuth2Client(customRedirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  getAuthenticatedClient(tokens) {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }

  async getUserProfile(tokens) {
    const auth = this.getAuthenticatedClient(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const { data } = await oauth2.userinfo.get();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      givenName: data.given_name,
      picture: data.picture,
    };
  }

  async revokeToken(token) {
    try {
      const oauth2Client = this.getOAuth2Client();
      await oauth2Client.revokeToken(token);
      return true;
    } catch (err) {
      console.warn('Token revocation warning (may already be expired/revoked):', err.message);
      return false;
    }
  }
}

module.exports = new GoogleAuthService();

