import { createTransport, Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

interface IEmailOptions {
  email: string;
  data: object;
  subject: string;
  template: string;
}

const sendMail = async (options: IEmailOptions) => {
  const tranporter: Transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL as string,
      pass: process.env.SMTP_PASS as string,
    },
  });

  const { email, data, subject, template } = options;

  const html = await ejs.renderFile(
    path.join(__dirname, `../mails/${template}`),
    data
  );

  const mailOptions = {
    from: process.env.SMTP_MAIL as string,
    to: email,
    subject,
    html,
  };

  await tranporter.sendMail(mailOptions);
};

export { sendMail };
