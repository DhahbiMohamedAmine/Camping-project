import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { db } from "../server";
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with your actual JWT secret key

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
  auth: {
    user: 'hamadhahbi2020@gmail.com', // Your email address
    pass: 'nkjj xlsv zqkf slby', // Your email password or an app password
  },
});

// Register and send a verification email
router.post("/register", async (req, res) => {
  const { type, nom, prenom, email, telephone, cin, password } = req.body;

  if (!type || !nom || !prenom || !email || !telephone || !cin || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }

  // Check if the email already exists
  const checkEmailSql = 'SELECT * FROM user WHERE email = ?';
  db.query(checkEmailSql, [email], async (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }

    if (result.length > 0) {
      return res.status(400).send({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO user (type, nom, prenom, email, telephone, cin, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [type, nom, prenom, email, telephone, cin, hashedPassword], async (err: Error, result: any) => {
      if (err) {
        return res.status(500).send({ error: 'Database insertion failed' });
      }

      // Generate a verification token
      const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

      // Send the verification email
      const mailOptions = {
        from: 'hamadhahbi2020@gmail.com',
        to: email,
        subject: 'Email Verification',
        html: `<h2>Please verify your email</h2>
               <p>Click the link below to verify your email:</p>
               <a href="http://localhost:3000/verify-email?token=${verificationToken}">Verify Email</a>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send({ error: 'Failed to send verification email: ' + error });
        }
        res.send({ message: 'User registered successfully. Please check your email to verify your account.', userId: result.insertId });
      });
    });
  });
});

// Verify email route
router.get("/verify-email", (req: any, res: any) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send({ error: 'Verification token is required' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(400).send({ error: 'Invalid or expired token' });
    }

    const { email } = decoded;

    // Update the user's email_verified field in the database
    const sql = 'UPDATE user SET isVerified = 1 WHERE email = ?';
    db.query(sql, [email], (err: any, result: any) => {
      if (err) {
        return res.status(500).send({ error: 'Database update failed' });
      }

      res.send({ message: 'Email verified successfully' });
    });
  });
});

// Login
// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Email and password are required" });
  }

  const sql = 'SELECT * FROM user WHERE email = ?';
  db.query(sql, [email], async (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }

    if (result.length === 0) {
      return res.status(404).send({ error: 'User not found' });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid credentials' });
    }

    // Check if the user is verified
    if (user.isVerified !== 1) {
      return res.status(400).send({ error: 'Please verify your email before logging in' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, type: user.type }, JWT_SECRET, { expiresIn: '1h' });

    // Send the response with user data and token
    res.send({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        type: user.type, // Include the user type here
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        cin: user.cin,
        isVerified: user.isVerified,
      },
    });
  });
});


// Request password reset
// Request password reset
router.post("/reset-password-request", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  const sql = 'SELECT * FROM user WHERE email = ?';
  db.query(sql, [email], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }

    if (result.length === 0) {
      return res.status(404).send({ error: 'User not found' });
    }

    const user = result[0];

    // Generate a password reset token
    const resetToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Send the reset email with a link to the frontend reset page
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: 'hamadhahbi2020@gmail.com',
      to: email,
      subject: 'Password Reset',
      html: `<h2>Password Reset Request</h2>
             <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>If you did not request this, please ignore this email.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send({ error: 'Failed to send reset email: ' + error });
      }
      res.send({ message: 'Password reset email sent. Please check your inbox.' });
    });
  });
});


// Reset password
// Reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).send({ error: "Token and new password are required" });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(400).send({ error: 'Invalid or expired token' });
    }

    const { email } = decoded;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const sql = 'UPDATE user SET password = ? WHERE email = ?';
    db.query(sql, [hashedPassword, email], (err: any, result: any) => {
      if (err) {
        return res.status(500).send({ error: 'Database update failed' });
      }

      res.send({ message: 'Password has been reset successfully' });
    });
  });
});

// Send support message
router.post("/support", async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).send({ error: "Email and message are required" });
  }

  const mailOptions = {
    from: 'dhahbimohamedaminef175@gmail.com',
    to: 'hamadhahbi2020@gmail.com', // Support email
    subject: 'Client Support Request',
    html: `<p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send({ error: 'Failed to send support request: ' + error });
    }
    res.send({ message: 'Your message has been sent successfully!' });
  });
});

export default router;
