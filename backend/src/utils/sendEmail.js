const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Email functionality is deactivated
    console.log(`[EMAIL DEACTIVATED] Would have sent email to ${options.email} with subject: ${options.subject}`);
    return;
};

module.exports = sendEmail;
