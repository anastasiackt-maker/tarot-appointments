const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
