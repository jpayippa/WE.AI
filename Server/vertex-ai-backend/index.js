const { GoogleAuth } = require('google-auth-library');
const cors = require('cors'); //  Import CORS package

// Allowed origin and expiration date for the temporary CORS exception
const allowedOrigin = 'http://localhost:3000';
const expirationDate = new Date('2025-04-01');

// Initialize GoogleAuth
const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// Configure CORS middleware
const corsOptions = {
    origin: (origin, callback) => {
        const currentDate = new Date();

        // Allow requests from localhost:3000 until April 1st, 2025
        if (origin === allowedOrigin && currentDate < expirationDate) {
            callback(null, true);
        } else if (!origin) {
            // Allow requests without an origin (like from Insomnia/Postman)
            callback(null, true);
        } else if (currentDate >= expirationDate) {
            // After April 1st, deny requests from localhost:3000
            callback(new Error('CORS exception has expired.'));
        } else {
            // Deny requests from disallowed origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};

// Use the configured CORS middleware
exports.generateToken = (req, res) => {
    cors(corsOptions)(req, res, async () => {
        if (req.method === 'OPTIONS') {
            return res.status(204).end(); // Handle preflight requests
        }

        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        try {
            const client = await auth.getClient();
            const tokenResponse = await client.getAccessToken();
            res.status(200).json({ token: tokenResponse.token });
        } catch (error) {
            console.error('Error generating token:', error);
            res.status(500).json({ message: 'Failed to generate token.' });
        }
    });
};
