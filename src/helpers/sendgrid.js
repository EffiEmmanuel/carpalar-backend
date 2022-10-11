import sendgridMail from "@sendgrid/mail";
// import
console.log('API KEY:', process.env.SENDGRID_API_KEY)
sendgridMail.setApiKey('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');

const sendEmail = async (recipient, subject, html) => {
  try {
    const message = {
      from: process.env.SENDGRID_EMAIL,
      to: recipient,
      subject,
      html,
    };
    await sendgridMail
      .send(message)
      .then((response) => console.log("Email sent successfully"))
      .catch((error) => console.log("Error:", error));
  } catch (error) {
    console.error(error)
    if(error.response) console.error(error.response.body)
  }
};

export default sendEmail;