const { Resend } = require("resend");
const resend = new Resend(`${process.env.RESEND_API_KEY}`);

const sendEmail = async (options) => {
    await resend.emails.send({
        from: "scribbles@gmail.com",
        to: options.email,
        subject: options.subject,
        html: options.message,
    });
};

module.exports = sendEmail;
