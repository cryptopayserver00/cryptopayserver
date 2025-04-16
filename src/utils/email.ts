import nodemailer from 'nodemailer';

export class EMAIL {
  static async sendInvoiceEmail(email: string, body: any): Promise<any> {
    try {
      throw new Error('can not send the email');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the email');
    }
  }

  static async sendEmailCore(
    host: string,
    port: number,
    user: string, 
    pwd: string,
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      host: host,
      port: port || 587,
      secure: false,
      auth: {
        user: user,
        pass: pwd,
      },
    });

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (e) {
      console.error('Error sending email:', e);
      return false;
    }
  }
}
