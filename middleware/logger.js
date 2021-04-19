const moment = require ('moment');

const logger = (requisicao, resposta, proximo) =>{
    console.log(`${requisicao.protocol}://${requisicao.get('host')}${requisicao.originalUrl}: ${moment().format()}`);

    proximo();
}

module.exports = logger;