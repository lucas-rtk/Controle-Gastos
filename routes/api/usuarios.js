const express = require('express');
const router = express.Router();
const Conexao = require('../../conexao');
const Usuario = require('../../models/Usuario');

router.post('/', (requisicao, resposta) => {
    getUsuario(requisicao.body.email)
        .then(retorno => {
            if (retorno != null)
                return resposta.status(400).json({ Erro: 'Já existe um usuário com este endereço de e-mail!' });

            let sql = 'INSERT INTO usuarios (Nome, Senha, Email) VALUES (?, ?, ?)';

            const conexao = new Conexao();
            conexao.query(sql, [requisicao.body.nome, requisicao.body.senha, requisicao.body.email])
                .then(linhas => {
                    return resposta.status(201).json();
                })
                .catch(erro => {            
                    return resposta.status(500).json({ Erro: erro.message });
                })
                .finally(() =>{
                    conexao.close();
                });                
        })
        .catch(erro => {
            return resposta.status(500).json({ Erro: erro.message });
        });     
});

router.post('/login', (requisicao, resposta) => {
    getUsuario(requisicao.body.email)
        .then(retorno => {
            if ((retorno == null) || (retorno.senha != requisicao.body.senha)) {
                return resposta.status(400).json("Endereço de e-mail ou senha inválidos!");
            } else {                      
                retorno.senha = null; //remove a senha para não retornar ao frontend
                return resposta.status(200).json(retorno);
            }
        })
        .catch(erro => {
            return resposta.status(500).json({ Erro: erro.message });
        });     
});

router.get('/:email', (requisicao, resposta) => {
    getUsuario(requisicao.params.email)
        .then(retorno => {
            if (retorno == null) {
                return resposta.status(404).json();
            } else {       
                retorno.email = null;               
                return resposta.status(200).json(retorno);
            }
        })
        .catch(erro => {
            return resposta.status(500).json({ Erro: erro.message });
        });    
});

function getUsuario(email){
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM usuarios WHERE Email = ?';

        const conexao = new Conexao();
        conexao.query(sql, [email])
            .then(linhas => {
                if (linhas.length == 0){
                    resolve(null);
                } else{                      
                    resolve(new Usuario(linhas[0].Id, linhas[0].Nome, linhas[0].Email, linhas[0].Senha));
                }
            })
            .catch(erro => {   
                throw erro;
            })
            .finally(() =>{
                conexao.close();
            });        
    });    
}

module.exports = router;