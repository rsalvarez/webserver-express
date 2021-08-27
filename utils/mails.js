const nodemailer = require("nodemailer");



// async..await is not allowed in global scope, must use a wrapper
async function main(archivo, emails) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        // host: "192.168.0.179",
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: '@gmail.com', //testAccount.user, // generated ethereal user
            pass: '' //testAccount.pass, // generated ethereal password
        }

    });
    //console.log('Mail' + archivo);

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'no-reply@esyop.gob.ar', //''"Esyop ECOALIADOS" <no-reply@esyop.gob.ar>', // sender address
        to: emails, //"rafaelrio4@gmail.com", // list of receivers
        subject: "Recepcion de material", // Subject line
        text: "Revise el archivo adjunto", // plain text body
        html: "<b>Revise el archivo adjunto</b>", // html body
        attachments: [{
            filename: 'ticket_recibo.pdf',
            path: archivo,
            contentType: 'application/pdf'
        }]
    });

    //console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    console.log("FIn mail");
}
module.exports = {
    main
}
