const { GoogleAuth } = require('google-auth-library');

// Initialize GoogleAuth with necessary scopes
const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// Cloud Function to generate a Bearer Token
exports.generateToken = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Get a client authenticated with the service account
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();

        // Send the Bearer Token to the frontend
        res.status(200).json({ token: tokenResponse.token });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ message: 'Failed to generate token.' });
    }
};
