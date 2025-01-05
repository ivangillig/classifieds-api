import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_PROVIDER_HOST,
    port: process.env.MAIL_PROVIDER_PORT,
    auth: {
      user: process.env.MAIL_PROVIDER_USER,
      pass: process.env.MAIL_PROVIDER_PASS,
    },
  })
}

const getEmailTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, '..', 'emailTemplates', `${templateName}.html`)
  let template = fs.readFileSync(templatePath, 'utf8')
  for (const key in replacements) {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key])
  }
  return template
}

export const sendEmailConfirmation = async (email, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  })

  const transporter = getTransporter()

  const emailTemplate = getEmailTemplate('confirmEmail', {
    confirmationLink: `${process.env.FRONTEND_URL}/auth/confirm-email?token=${token}`
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Confirmation',
    html: emailTemplate,
  }

  await transporter.sendMail(mailOptions)
}
