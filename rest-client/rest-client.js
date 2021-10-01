const axios = require('axios');

const getPtoVenta = async(url) => {

    //const location = encodeURI(dir);

    //console.log(url);
    const instance = axios.create({
        baseURL: url,
    });

    const resp = await instance.get();

    if (resp.data) {

        return {
            direccion: resp.data.calle + ' ' + resp.data.numero,
            nombre: resp.data.nombre,
            id: resp.data.id
        };

    } else {
        throw new Error('Error en la llamada al endPoint ' + url);
    }


};

const getAllPtoVenta = async(url) => {

    //const location = encodeURI(dir);


    const instance = axios.create({
        baseURL: url,
    });

    const resp = await instance.get();

    //console.log(resp.data);
    if (resp.data) {
        let nombres = [];
        const tt = resp.data.retorno.forEach(element => {
            nombres.push({ id: element.id, nombre: element.nombre });
        });
        return {
            datos: nombres
        };

    } else {
        throw new Error('Error en la llamada al endPoint ' + url);
    }

};



const getBigBag = async(url) => {

    const instance = axios.create({
        baseURL: url,
    });

    const resp = await instance.get();
    //console.log(resp.data.retorno);
    if (resp.data.retorno) {

        return {
            data: resp.data.retorno
        };

    } else {
        throw new Error('Error en la llamada al endPoint ' + url);
    }


};

const setEstadoNotifBag = async(url) => {
    const instance = axios.create({
        baseURL: url,
    });
    //console.log(url);
    // llamamos a setEstadoNotifBag
    const resp = await instance.get();
    if (resp.resultado = 'OK') {
        return {
            resultado: 'OK'
        };

    } else {
        throw new Error('Error en la llamada al endPoint ' + url);
    }
}




const getLogin = async(url) => {

    const instance = axios.create({
        baseURL: url,
    });
    //console.log(url);
    const resp = await instance.get();
    if (resp.resultado = 'OK') {
        return {
            data: resp.data.usuario,
            resultado: 'OK'
        };

    } else {
        throw new Error('Error en la llamada al endPoint ' + url);
    }


};

const setDatosBag = async(url, data) => {

    const instance = axios.create({
        baseURL: url,
        params: {
            idBag: data.idBag,
            usuario: data.usuario,
            ptoVenta: data.ptoVenta,
            kg: data.kg,
            usuario: data.usuario,
            estado_actual: data.estado_actual
        }
    });


    const resp = await instance.put();
    //    console.log(resp);    
    if (resp.resultado = 'OK') {
        //console.log(resp);
        return {
            data: resp.data.data,
            resultado: 'OK',
            mail: resp.data.texto,
            ecoaliado: resp.data.ecoaliado
        };

    } else {
        throw new Error('Error en la llamada al endPoint ' + url);
    }


};


module.exports = {
    getPtoVenta,
    setDatosBag,
    getAllPtoVenta,
    getBigBag,
    getLogin,
    setEstadoNotifBag

}