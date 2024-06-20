require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const validator = require("validator");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Configure your SMTP transporter using cPanel email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/contact", (req, res) => {
  const { email, phone, message } = req.body;

  if (!email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (!validator.isMobilePhone(phone, "any")) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  // Email options
  const mailOptions = {
    from: email,
    to: "adenugaadewumi01@gmail.com", // The email address you want to receive messages
    subject: "New Contact Form Submission",
    text: `You have a new message from ${email}:\n\nPhone: ${phone}\n\nMessage:\n${message}`,
    headers: {
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      Importance: "Normal",
    },
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: "Failed to send email" });
    }
    console.log("Email sent: " + info.response);
    res
      .status(200)
      .json({ success: "Form submitted successfully and email sent" });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
