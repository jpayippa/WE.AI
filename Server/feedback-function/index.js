const nodemailer = require('nodemailer');

exports.sendFeedback = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Method Not Allowed' });
    }

    const { email, feedback } = req.body;

    if (!feedback || feedback.trim() === '') {
        return res.status(400).json({ message: 'Feedback is required.' });
    }

    // Generate a unique subject with a timestamp
    const uniqueSubject = `New Feedback Submission - ${new Date().toISOString()}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Your Gmail address
            pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
        },
    });

    const mailOptions = {
        from: email || 'no-reply@example.com',
        to: 'westernaicontact@gmail.com',
        subject: uniqueSubject, // Use the unique subject here
        text: `Feedback: ${feedback}\n\nContact Email: ${email || 'Not Provided'}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Feedback sent successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send feedback.' });
    }
};
