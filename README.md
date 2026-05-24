<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cfc15061-fd55-42be-8d11-5f299b3872c7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`.
3. In Google Cloud Console, add these OAuth client values for local development:
   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Run the app:
   `npm run dev`

The app uses `APP_URL` to build the OAuth callback. If you run it somewhere other than `http://localhost:3000`, set `APP_URL` to that origin, or set `GOOGLE_REDIRECT_URI` to the exact callback URL registered in Google Cloud Console.
