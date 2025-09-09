# 🔒 Google OAuth Setup for Bitch@ Admin Panel

## Prerequisites
- Google Cloud Console account
- Bitch@ project running locally

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

## Step 2: Enable Required APIs
Enable these APIs in your Google Cloud project:

### Core APIs (Required for Authentication)
- **Google+ API** (for basic profile info)
- **Gmail API** (for full email access and automation)
- **Google Drive API** (for complete file storage and management)
- **Google Docs API** (for document creation and editing)
- **Google Sheets API** (for spreadsheet data and analysis)
- **YouTube Data API v3** (for video management)
- **Google Analytics API** (for website analytics)
- **PaLM API** (for Gemini AI with restricted access)

### How to Enable APIs:
1. Go to "APIs & Services" > "Library"
2. Search for each API above
3. Click "Enable" for each one

## Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:3000` (for development - check your actual port)
   - Your production domain when deployed
5. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (match your dev server port)
   - Your production callback URL
6. Save and note your Client ID and Client Secret

## Step 4: Configure Environment Variables
Create a `.env.local` file in your project root:

```bash
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# Optional: API Keys for specific services
GMAIL_API_KEY="your-gmail-api-key"
GOOGLE_DRIVE_API_KEY="your-drive-api-key"
YOUTUBE_API_KEY="your-youtube-api-key"
GEMINI_API_KEY="your-gemini-api-key"

# Database
DATABASE_URL="file:./dev.db"
```

**🚨 IMPORTANT PORT CONFIGURATION:**
- Your dev server is running on port **3000**
- **Google Callback URL**: `http://localhost:3000/api/auth/callback/google`
- **Twitter Callback URL**: `http://localhost:3000/api/auth/callback/twitter`
- **NEXTAUTH_URL** should be: `http://localhost:3000`
- If your server runs on a different port, update these URLs accordingly

**🔐 DUAL AUTHENTICATION SYSTEM:**
- **🔒 Google OAuth**: For you (admin) - full Google Workspace access
- **🐦 Twitter OAuth**: For regular users - seamless Twitter-like experience

**🔐 REQUESTED SCOPES:**
The app requests these OAuth scopes for full admin functionality:
- `openid email profile` - Basic Google account access
- `https://mail.google.com/` - Full Gmail access (read/write/compose)
- `https://www.googleapis.com/auth/documents` - Google Docs access
- `https://www.googleapis.com/auth/spreadsheets` - Google Sheets access
- `https://www.googleapis.com/auth/drive` - Full Google Drive access
- `https://www.googleapis.com/auth/youtube.readonly` - YouTube access
- `https://www.googleapis.com/auth/analytics.readonly` - Analytics access

**Note:** Gemini AI access requires separate API key configuration, not OAuth scopes.

## Step 5: Set Admin User
To make yourself an admin user:

1. Sign in with Google OAuth
2. The system will create your user account
3. You'll need to manually set `isAdmin: true` in the database:

```sql
-- Update your user to be admin
UPDATE User SET isAdmin = true WHERE email = 'your-email@gmail.com';
```

Or through Prisma Studio:
```bash
npx prisma studio
```

## Step 6: Test the Setup
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click the 🔒 "Sign In with Google" button
4. Complete OAuth flow
5. You should see "Admin Panel" in the sidebar
6. Visit `/admin` to access the admin dashboard
7. Test each service connection

## Troubleshooting

### OAuth Errors
- **403: access_denied**: Check your authorized origins and redirect URIs
- **invalid_client**: Verify your Client ID and Secret
- **redirect_uri_mismatch**: Ensure redirect URI matches exactly

### API Connection Issues
- **API not enabled**: Go back to Google Cloud Console and enable the API
- **Quota exceeded**: Check your API quotas and usage limits
- **Permissions denied**: Verify the OAuth scopes are correct

### Admin Access Issues
- **Can't see admin panel**: Ensure your user has `isAdmin: true` in the database
- **403 on admin routes**: Check the admin status API endpoint

## Available Google Services in Admin Panel

### 📧 Gmail
- Read and manage emails
- Send automated emails
- Label management
- Email templates

### 📄 Google Docs
- Create and edit documents
- Share documents with users
- Document collaboration
- Export to various formats

### 📊 Google Sheets
- Read and write spreadsheet data
- Create charts and reports
- Data analysis tools
- Real-time collaboration

### ☁️ Google Drive
- File upload and storage
- Folder organization
- File sharing and permissions
- Backup and sync

### 🎥 YouTube
- Video upload and management
- Playlist creation
- Channel analytics
- Comment moderation

### 📈 Analytics
- Website traffic analysis
- User behavior tracking
- Conversion metrics
- Custom dashboards

### 🤖 Gemini AI
- Content generation
- Text analysis
- Code assistance
- Image understanding

## Security Notes
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys and secrets
- Monitor API usage for security anomalies
- Implement proper error handling for API failures

## Next Steps
Once everything is set up:
1. Test all API connections in the admin panel
2. Implement specific business logic for each service
3. Add error handling and retry mechanisms
4. Set up monitoring and logging
5. Deploy to production with proper security measures
