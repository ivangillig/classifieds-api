import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

export const sendEmailConfirmation = async (email, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  })

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_PROVIDER_HOST,
    port: process.env.MAIL_PROVIDER_PORT,
    auth: {
      user: process.env.MAIL_PROVIDER_USER,
      pass: process.env.MAIL_PROVIDER_PASS,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Confirmation',
    text: `Please confirm your email by clicking the following link: ${process.env.FRONTEND_URL}/auth/confirm-email?token=${token}`,
  }

  await transporter.sendMail(mailOptions)
}
