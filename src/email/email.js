const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Read HTML templates
const createTemplate = fs.readFileSync(
  path.join(__dirname, "account-create.html"),
  "utf8"
);
const resetTemplate = fs.readFileSync(
  path.join(__dirname, "password-reset.html"),
  "utf8"
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (to, subject, htmlType="Account Create", details) => {
  try {
    let html = "";
    if (htmlType === "Account Create") {
      html = createTemplate;
    } else if (htmlType === "Password Reset") {
      html = resetTemplate;
    }
    //Account Create
    if (htmlType === "Account Create") {
      html = html.replace("{{name}}", details.name);
      html = html.replace("{{loginUrl}}", details.loginUrl);
    }
    //Password Reset
    if (htmlType === "Password Reset") {
      html = html.replace("{{name}}", details.name);
      html = html.replace("{{expiryTime}}", details.expiryTime);
      html = html.replace("{{resetUrl}}", details.resetUrl);
      html = html.replace("{{resetUrlLink}}", details.resetUrl);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    };
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.log("Failed to send email", error);
    return {
      success: false,
      message: "Failed to send email",
      db_error: error.message,
    };
  }
};
