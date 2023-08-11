import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(
      smtpTransport({
        host: process.env.EMAIL_HOST,
        service: process.env.EMAIL_SERVICE,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      })
    );
  }

  async sendCode(email, code) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Code for LogIn',
      html: `
      LogIn code for Information Library.
      code: ${code}
      `
    });
  }
}

export default new EmailService();
