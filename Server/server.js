const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
    },
});

// API Endpoint
app.post('/api/send-feedback', async (req, res) => {
    const { email, feedback } = req.body;

    if (!feedback || feedback.trim() === '') {
        return res.status(400).json({ message: 'Feedback is required.' });
    }

    const mailOptions = {
        from: email || 'no-reply@example.com',
        to: 'westernaicontact@gmail.com',
        subject: 'New Feedback Submission',
        text: `Feedback: ${feedback}\n\nContact Email: ${email || 'Not Provided'}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Feedback sent successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send feedback.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
