const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper

async function main(archivo, emails) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        // host: "192.168.0.179",
        host: process.env.SMTP_HOST /*'smtp.gmail.com'*/ ,
        port: process.env.PORT_MAIL,
        secure: false, //false, // true for 465, false for other ports
        /* tls: {
             rejectUnauthorized: false
         },*/
        auth: {
            user: process.env.EMAIL, //testAccount.user, // generated ethereal user
            pass: process.env.PASSWORD //testAccount.pass, // generated ethereal password
        }

    });


    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: process.env.EMAIL, //''"Esyop ECOALIADOS" <no-reply@esyop.gob.ar>', // sender address
        to: emails, // "rafaelrio4@gmail.com", // list of receivers
        subject: "Recepcion de material", // Subject line
        text: "Revise el archivo adjunto", // plain text body
        html: "<b>Revise el archivo adjunto</b>", // html body
        attachments: [{
            filename: 'ticket_recibo.pdf',
            path: archivo,
            contentType: 'application/pdf'
        }]
    });


}
module.exports = {
    main
}