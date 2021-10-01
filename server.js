const express = require('express');
const app = express();
const hbs = require('hbs');
const axio = require('./rest-client/rest-client');
const bodyParser = require('body-parser');
const pdf = require('./utils/pdf');
const mail = require('./utils/mails');
const jwt = require('jsonwebtoken');

require('./hbs/helpers');
var path = require('path');
require('dotenv').config();
const port = process.env.PORT;

app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/parciales');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

function getToken(userDb) {
    let token = jwt.sign({
        usuario: userDb
    }, process.env.SEED, { expiresIn: '1m' /*60 * 60 * 24 * 30 */ });

    return token

};


async function middleware(body) {

    let usuario = body.user;
    let pass = body.password;

    let user;

    let rtaAll = await axio.getLogin(process.env.URL_EP + '/api/usuarios/login/' + usuario + "/" + pass).then((resultado) => {
        user = resultado

    }).catch((err) => {
        return false;
    });



    if (user.resultado != 'OK' || user.data == null) {
        return false;
    } else {
        return getToken(user.data);
    }


};

app.get('/login', async(req, res) => {
    if (!req.query.id || !req.query.idBag) {
        res.render(
            'error', {
                errorMsg: 'Sistema Solo accesible desde lectura de QR'
            }
        );
    } else {
        let idPtoVenta = req.query.id;
        let idBigBag = req.query.idBag;
        res.render(
            'login', {
                idBag: idBigBag,
                ptoVenta: idPtoVenta
            }
        );

    }


});

app.post('/', async(req, res) => {


    let idPtoVenta = req.body.ptoVenta;
    let idBigBag = req.body.BagId;
    let token = await middleware(req.body);

    if (!token) {
        res.render('error', {
            errorMsg: "Login invalido"
        })
    }


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
            mensajeEgresoCV: mensajeEgresoCV,
            token: token
        });
    }).catch((err) => {

        res.render('error', {
            titulo: "Error ",
            errorMsg: err.response.data.msg
        })
    });

})



let verificaTk = (valToken) => {

    let token = valToken; //eq.get('Authorization');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            console.log(err);
            return false;
        }

        return true;

    });
};

app.get('/about', (req, res) => {

    res.render('about', {

        titulo: 'Sitio Web Demo'
    });

})

app.get('/salir', async(req, res) => {
    res.render('error', {
            titulo: "Salist",
            errorMsg: 'Accion terminada, listo para salir.'
        }) // else login
});


app.post('/data', async(req, res) => {
    //console.log('Data : ');

    if (!verificaTk(req.body.token)) {
        res.render('error', {
                titulo: "Error",
                errorMsg: 'Acceso invalido, debe hacer login nuevamente, ya que le token esta vencido'
            }) // else login
    }
    let usuario = req.body.user;

    let kg = req.body.kg;
    let idBag = req.body.BagId;
    let ptoVenta = req.body.ptoventa;

    //let user;
    let retorno;

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

            mail.main(archivo, emails.substr(0, emails.length - 1)).then(() => {
                let notificado = axio.setEstadoNotifBag(process.env.URL_EP + '/api/bigbag/setEstadoNotifBag/' + retorno.data.id);
            });


        }

        res.render('resultado', {
            resultado: "La operacion fue realizada con exito."
        });

    }



})

app.listen(port, () => {

    console.log("Escuchango peticiones en el puerto " + port);
})