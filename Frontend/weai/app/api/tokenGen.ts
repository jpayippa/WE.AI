const { GoogleAuth } = require('google-auth-library');

export default async function handler() {
  const auth = new GoogleAuth({
    keyFilename: "/Users/saif/Library/Mobile Documents/com~apple~CloudDocs/Synced Documents/University/Year 4/CAPSTONE PROJECT/WE.AI/Frontend/weai/app/utils/we-ai-442218-9d855ae58977.json",
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  try {
    const client = await auth.getClient();
    const tk = await client.getAccessToken();
    tk.json({ token: tk.token });
  } catch (error) {
    console.error('Error fetching token:', error);
  }
}