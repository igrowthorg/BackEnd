import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kalanisathya12@gmail.com",
      pass: "jhqwpvtnluihkawp"
    },
  });
