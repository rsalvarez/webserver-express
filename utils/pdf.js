var pdf = require('html-pdf');
var fs = require('fs');
var paths = require('path');




const getPdf = (contenido, filename, path) => {
    var options = {
        format: 'A5',
        base: 'file://' + paths.normalize(path + '/public/assets/')
    };

    contenido = contenido.replace('<SRC-IMG>', 'file://' + paths.normalize(path + '/public/assets/img/logo.png'));
    console.log(options);
    console.log(contenido);


    pdf.create(contenido, options).toFile(filename, function(err, res) {

        if (err) {
            console.log(err);
        } else {
            /*console.log('Ok');
            console.log(res);*/
            //return res;
        }
    });

    //console.log(pdf.log);


};



module.exports = {
    getPdf
};