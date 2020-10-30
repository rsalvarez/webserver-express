const express = require('express')
const app = express();
const hbs = require('hbs');
require('./hbs/helpers');

const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/parciales');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {

    res.render('home', {
        nombre: 'rafael',
        titulo: 'Sitio Web Demo'
    });

})

app.get('/about', (req, res) => {

    res.render('about', {

        titulo: 'Sitio Web Demo'
    });

})



app.get('/data', (req, res) => {
    res.send('Hola Data');

})

app.listen(port, () => {
    console.log("Escuchango peticiones en el puerto " + port);
})