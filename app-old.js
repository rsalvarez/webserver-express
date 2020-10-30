const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-type': 'application/json' });
    let data = {
        nombre: 'Rafael',
        apellido: 'Alvarez',
        url: req.url
    }
    res.write(JSON.stringify(data));
    res.end();
}).listen(8080);

console.log("Escuchando en el puerto 8080");