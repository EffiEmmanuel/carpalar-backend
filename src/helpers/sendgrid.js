import sendgrid from 'sendgrid'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = (recipient, subject, html) => {
    const message = {
        from: process.env.SENDGRID_EMAIL,
        to: recipient,
        subject,
        html
    }
    sendgrid.send(message).then(response => console.log('Email sent successfully')).catch(error => console.log('Error:', error))
}

export default sendEmail