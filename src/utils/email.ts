import nodemailer from 'nodemailer';

export class EMAIL {
  static async sendInvoiceEmail(email: string, body: any): Promise<boolean> {
    try {
      return true;
    } catch (e) {
      console.error(e);
      throw new Error('can not send the email');
    }
  }

  static async sendEmailCore(
    host: string,
    port: number,
    isSecure: boolean,
    user: string,
    pwd: string,
    from: string,
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: isSecure,
      auth: {
        user: user,
        pass: pwd,
      },
    });

    const mailOptions = {
      from: `"Sender Name" <${from}>`,
      to: to,
      subject: subject,
      text: text,
      html: html ? html : '',
    };

    try {
      await transporter.verify();

      await transporter.sendMail(mailOptions);
      return true;
    } catch (e) {
      console.error('Error sending email:', e);
      return false;
    }
  }
}
