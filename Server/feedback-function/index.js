const nodemailer = require('nodemailer');
const cors = require('cors'); // ✅ Import the CORS package

// Define the allowed origin and the expiration date
const allowedOrigin = 'http://localhost:3000';
const expirationDate = new Date('2025-04-01');

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
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};


// ✅ Use the configured CORS middleware
exports.sendFeedback = (req, res) => {
    cors(corsOptions)(req, res, async () => {
        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).send({ message: 'Method Not Allowed' });
        }

        // Extract email and feedback from the request body
        const { email, feedback } = req.body;

        if (!feedback || feedback.trim() === '') {
            return res.status(400).json({ message: 'Feedback is required.' });
        }

        // Generate a unique subject with a timestamp
        const uniqueSubject = `New Feedback Submission - ${new Date().toISOString()}`;

        // Configure the Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, // Your Gmail address
                pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
            },
        });

        // Email options
        const mailOptions = {
            from: email || 'no-reply@example.com',
            to: 'westernaicontact@gmail.com',
            subject: uniqueSubject, // Use the unique subject
            text: `Feedback: ${feedback}\n\nContact Email: ${email || 'Not Provided'}`,
        };

        // Send the email
        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Feedback sent successfully.' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Failed to send feedback.' });
        }
    });
};
