const express = require('express');
const router = express.Router();
const Conexao = require('../../conexao');
const Categoria = require('../../models/Categoria');

router.get('/', (requisicao, resposta) => {
    if (requisicao.query['id_usuario'] == null)
        return resposta.status(400).json({ erro: "ID do usuário não informado!" });

    const conexao = new Conexao();
    let retorno = [];
    conexao.query('SELECT Id AS id, Descricao AS descricao FROM categorias WHERE Id_Usuario = ? ORDER BY Id', [requisicao.query['id_usuario']])
    .then(resultado => {
        for (let i = 0; i < resultado.length; i++) {
            retorno.push(new Categoria(resultado[i].id, resultado[i].descricao));            
        }

        return resposta.status(200).json(retorno);
    })
    .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
    .finally(() => { conexao.close(); });
});

router.post('/', (requisicao, resposta) => {
    if (requisicao.body.descricao.length < 1)
        return resposta.status(400).json({ erro: 'Informe uma descrição para a categoria!' });

    getCategoria(requisicao.body.descricao)
        .then(retorno => {
            if (retorno != null)
                return resposta.status(400).json({ erro: 'Já existe uma categoria com esta descrição!' });

            let sql = 'INSERT INTO categorias (Descricao, Id_Usuario) VALUES (?, ?)';

            const conexao = new Conexao();
            conexao.query(sql, [requisicao.body.descricao, requisicao.body.id_usuario])
                .then(() => { return resposta.status(201).json({}); })
                .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
                .finally(() => { conexao.close(); });                
        })
        .catch(erro => { return resposta.status(500).json({ erro: erro.message }); });         
});

router.put('/:id', (requisicao, resposta) => {
    if (requisicao.body.descricao.length < 1)
        return resposta.status(400).json({ erro: 'Informe uma descrição para a categoria!' });

    getCategoria(requisicao.body.descricao)
        .then(retorno => {
            if ((retorno != null) && (retorno.id != requisicao.params.id))
                return resposta.status(400).json({ erro: 'Já existe uma categoria com esta descrição!' });

            let sql = 'UPDATE categorias SET Descricao = ? WHERE Id = ? AND Id_Usuario = ?';

            const conexao = new Conexao();
            conexao.query(sql, [requisicao.body.descricao, requisicao.params.id, requisicao.body.id_usuario])
                .then(() => { return resposta.status(200).json({}); })
                .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
                .finally(() =>{ conexao.close(); });                
        })
        .catch(erro => { return resposta.status(500).json({ erro: erro.message }); });  
});

router.delete('/:id', (requisicao, resposta) => {
    if (requisicao.query['id_usuario'] == null)
        return resposta.status(400).json({ erro: "ID do usuário não informado!" });

    CategoriaEmUso(requisicao.params.id)
    .then(emUso => {
        if (emUso)
            return resposta.status(400).json({ erro: "Categoria em uso! Modifique as compras lançadas com esta categoria e após efetue a exclusão novamente." });

        let sql = 'DELETE FROM categorias WHERE Id = ? AND Id_Usuario = ?';        

        const conexao = new Conexao();
        conexao.query(sql, [requisicao.params.id, requisicao.query['id_usuario']])
        .then(() => { return resposta.status(200).json({}); })
        .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
        .finally(() =>{ conexao.close(); });
    })
    .catch(erro => { return resposta.status(500).json({ erro: erro.message }); });    
});

function getCategoria(descricao){
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM categorias WHERE Descricao = ?';

        const conexao = new Conexao();
        conexao.query(sql, [descricao])
            .then(linhas => {
                if (linhas.length == 0){
                    resolve(null);
                } else{                      
                    resolve(new Categoria(linhas[0].Id, linhas[0].descricao));
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

function CategoriaEmUso(id){
    return new Promise((resolve, reject) => {
        let sql = 'SELECT Id FROM compras WHERE Id_Categoria = ?';

        const conexao = new Conexao();
        conexao.query(sql, [id])
            .then(linhas => {
                resolve(linhas.length != 0);
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