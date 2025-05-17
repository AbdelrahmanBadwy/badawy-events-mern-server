const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, text, html }) => {
  try {
    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    // Set up email data
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
// AbdelRahman.Fawzi.AbdelAzim@h-eng.helwan.edu.eg
