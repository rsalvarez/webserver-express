const express = require('express');
const app = express();
const hbs = require('hbs');
const axio = require('./rest-client/rest-client');
const bodyParser = require('body-parser');
const pdf = require('./utils/pdf');
const mail = require('./utils/mails');
require('./hbs/helpers');
var path = require('path');
require('dotenv').config();
const port = process.env.PORT;

app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/parciales');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async(req, res) => {
    if (!req.query.id && !req.query.idBag) {
        res.render('error', {
            titulo: "Cierre ventana",
            errorMsg: 'Gracias por utilizar el sistema'
        })
    } else {
        let idPtoVenta = req.query.id;
        let idBigBag = req.query.idBag;

        let lugares = [];

        let rtaAll = await axio.getAllPtoVenta(process.env.URL_EP + '/api/ptoventa/').then((resultado) => {
            lugares = resultado
        }).catch((err) => {
            res.render('error', {
                errorMsg: err.response.data.msg
            })
        })

        let bag = [];
        let rtaBag = await axio.getBigBag(process.env.URL_EP + '/api/bigbag/' + idBigBag).then((resultado) => {
            bag = resultado.data
        }).catch((err) => {
            res.render('error', {
                errorMsg: err.response.data.msg
            })
        })

        let rta = await axio.getPtoVenta(process.env.URL_EP + '/api/ptoventa/' + idPtoVenta).then((result) => {
            let estado = "";
            let enabled = ""
            let requiered = ""
            let mensajeEgresoCV = '';
            if (bag.estado_actual == "EN_CV") {
                estado = 'Egreso';
                enabled = 'disabled';
                requiered = 'false';
                mensajeEgresoCV = 'SALIDA de bag ';
            } else {
                estado = 'Ingreso'
                enabled = 'enabled';
                requiered = 'true';
                mensajeEgresoCV = null
            }



            res.render('home', {
                nombre: result.nombre,
                titulo: 'Movimiento de Big Bag',
                accionBag: estado,
                direccion: result.direccion,
                lugares: lugares.datos,
                idBug: idBigBag,
                ecoaliado: bag.ecoaliado.nombre,
                enabled: enabled,
                required: requiered,
                mensajeEgresoCV: mensajeEgresoCV
            });
        }).catch((err) => {

            res.render('error', {
                titulo: "Error ",
                errorMsg: err.response.data.msg
            })
        });
    }




})

app.get('/about', (req, res) => {

    res.render('about', {

        titulo: 'Sitio Web Demo'
    });

})

app.post('/salir', async(req, res) => {
    res.redirect("/");
});


app.post('/data', async(req, res) => {
    //console.log('Data : ');


    let usuario = req.body.user;
    let pass = req.body.password;
    let kg = req.body.kg;
    let idBag = req.body.BagId;
    let ptoVenta = req.body.ptoventa;

    let user;
    let retorno;

    if (!usuario || !pass) {
        res.render('error', {
                titulo: "Error ",
                errorMsg: 'usuario y password son obligatorios'
            }) // else login
    }

    let rtaAll = await axio.getLogin(process.env.URL_EP + '/api/usuarios/login/' + usuario + "/" + pass).then((resultado) => {
        user = resultado

    }).catch((err) => {

        res.render('error', {
            errorMsg: err.response.data.msg
        })
    })


    if (user.resultado == 'OK' && user.data != null) {


        if (!req.body.kg) { // caso que es una salida de bolsa del CV

            let datos = {
                idBag: idBag,
                usuario: usuario
            };

            let setear = await axio.setDatosBag(process.env.URL_EP + '/api/bigbag/setStatusBag/', datos).then((resultado) => {

                retorno = resultado

            }).catch((err) => {

                res.render('error', {
                    errorMsg: err.response
                })
            })
            res.render('resultado', {
                resultado: "La operacion fue realizada con exito."
            });

        } else {

            let bag;
            let rtaBag = await axio.getBigBag(process.env.URL_EP + '/api/bigbag/' + idBag).then((resultado) => {

                bag = resultado.data;
            }).catch((err) => {
                res.render('error', {
                    errorMsg: err.response.data.msg
                })
            })


            let datos = {
                estado_actual: bag.estado_actual,
                idBag: idBag,
                usuario: usuario,
                ptoVenta: ptoVenta,
                kg: kg
            };

            let setear = await axio.setDatosBag(process.env.URL_EP + '/api/bigbag/setDatosBug/', datos).then((resultado) => {

                retorno = resultado

            }).catch((err) => {

                res.render('error', {
                    errorMsg: err.response
                })
            })


            if (retorno.mail != "") {
                let archivo = './public/assets/pdf/salida.pdf';
                //console.log(path.resolve(__dirname));
                let emails = "";
                if (retorno.ecoaliado.emails) {

                    retorno.ecoaliado.emails.forEach((valor) => {
                        if (valor.estado == "A") {
                            emails += valor.email + ";";
                        }
                    })
                }

                pdf.getPdf(retorno.mail, archivo, path.resolve(__dirname));
                if (emails == "" || !emails) {
                    emails = process.env.EMAIL;
                }
                console.log(process.env.email);
                mail.main(archivo, emails.substr(0, emails.length - 1)).then(() => {
                    let notificado = axio.setEstadoNotifBag(process.env.URL_EP + '/api/bigbag/setEstadoNotifBag/' + retorno.data.id);
                });
            }

            res.render('resultado', {
                resultado: "La operacion fue realizada con exito."
            });

        }

    } // fin login
    else {
        res.render('error', {
                titulo: "Error ",
                errorMsg: 'login invalido'
            }) // else login
    }

})

app.listen(port, () => {
    
    console.log("Escuchango peticiones en el puerto " + port);
})
