import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!process.env.SMTP_USER) return; // skip if not configured
  await transporter.sendMail({
    from: `"Planora" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const emailTemplates = {
  invitationReceived: (eventTitle: string, hostName: string) => ({
    subject: `You're invited to "${eventTitle}"`,
    html: `<h2>You have a new invitation!</h2><p><strong>${hostName}</strong> has invited you to join <strong>${eventTitle}</strong>.</p><p>Login to Planora to accept or decline.</p>`,
  }),
  participantApproved: (eventTitle: string) => ({
    subject: `Your request to join "${eventTitle}" was approved!`,
    html: `<h2>Request Approved!</h2><p>Your request to join <strong>${eventTitle}</strong> has been approved. You're all set!</p>`,
  }),
  participantRejected: (eventTitle: string) => ({
    subject: `Your request to join "${eventTitle}" was declined`,
    html: `<h2>Request Declined</h2><p>Unfortunately, your request to join <strong>${eventTitle}</strong> was not approved.</p>`,
  }),
  paymentSuccess: (eventTitle: string, amount: number) => ({
    subject: `Payment confirmed for "${eventTitle}"`,
    html: `<h2>Payment Successful!</h2><p>Your payment of <strong>$${amount}</strong> for <strong>${eventTitle}</strong> has been confirmed.</p>`,
  }),
};
