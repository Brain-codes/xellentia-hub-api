require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const validator = require("validator");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/contact", (req, res) => {
  const { email, phone, message, name } = req.body;

  if (!email || !phone || !message || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (!validator.isMobilePhone(phone, "any")) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  // Read the HTML file
  const templatePath = path.join(__dirname, "contactEmail.html");
  fs.readFile(templatePath, "utf8", (err, html) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      return res.status(500).json({ error: "Failed to load email template" });
    }

    // Replace placeholders with actual values
    const filledHtml = html
      .replace("{{name}}", name)
      .replace("{{nameBlock}}", name)
      .replace("{{email}}", email)
      .replace("{{phone}}", phone)
      .replace("{{message}}", message);

    // Email options
    const mailOptions = {
      from: email,
      to: "adenugaadewumi01@gmail.com",
      subject: "New Contact Form Submission",
      html: filledHtml,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        Importance: "Normal",
      },
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email" });
      }
      console.log("Email sent: " + info.response);
      res
        .status(200)
        .json({ success: "Form submitted successfully and email sent" });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
