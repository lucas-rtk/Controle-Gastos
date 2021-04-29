const mysql = require('mysql');
const config = require('./dbconfig');

class Conexao {
    constructor() {
        this.connection = mysql.createConnection(config);
    }
    
    query(sql, args) {
        return new Promise((resolve, reject) => {
            let logger = this.connection.query(sql, args, (erro, linhas) => {
                if (erro)
                    return reject(erro);
                resolve(linhas);
            } );         
            
            //console.log(logger.sql);
        } );
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end( erro => {
                if (erro)
                    return reject(erro);
                resolve();
            } );
        } );
    }
}

module.exports = Conexao;