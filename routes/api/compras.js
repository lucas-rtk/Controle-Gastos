const express = require('express');
const router = express.Router();
const Conexao = require('../../conexao');
const MeioPagamento = require('../../models/MeioPagamento');
const Categoria = require('../../models/Categoria');
const Parcela = require('../../models/Parcela');
const Compra = require('../../models/Compra');
const e = require('express');

router.get('/:id', (requisicao, resposta) => {
    if (requisicao.query['id_usuario'] == null)
        return resposta.status(400).json({ erro: "ID do usuário não informado!" });

    getCompras(requisicao.params.id, requisicao.query['id_usuario'])
    .then(compras => { 
        if (compras == null)
            return resposta.status(404).json({});
        else
            return resposta.status(200).json(compras[0]); 
    })
    .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
});

router.get('', (requisicao, resposta) => {
    if (requisicao.query['id_usuario'] == null)
        return resposta.status(400).json({ erro: "ID do usuário não informado!" });

    getCompras(null, requisicao.query['id_usuario'])
    .then(compras => { return resposta.status(200).json(compras); })
    .catch(erro => { return resposta.status(500).json({ erro: erro.message }); });
});

router.post('/', (requisicao, resposta) => {    
    if (requisicao.body.length < 1)
        return resposta.status(400).json({ erro: 'Objeto JSON da compra não identificado!' });

    let validacao = ValidarCompra(requisicao.body);
    if (validacao.resultado == false)
        return resposta.status(400).json({ erro: validacao.erro });        

    let sqlCompra = 'INSERT INTO compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES (?, ?, ?, ?, ?, ?, ?);';

    const conexao = new Conexao();
    conexao.query(sqlCompra, [requisicao.body.descricao, requisicao.body.dataCompra, requisicao.body.categoria.id, 
                        requisicao.body.meioPagamento.id, requisicao.body.parcelas.length, requisicao.body.total, 
                        requisicao.body.idUsuario])
        .then(resultado => { 
                let idCompra = resultado.insertId;
                let params = [];

                requisicao.body.parcelas.forEach(item => {
                    params.push([`${item.dataVencimento}`, item.valor, idCompra]);
                });

                let sqlParcela = 'INSERT INTO parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ?';

                conexao.query(sqlParcela, [params])
                .then(() => { return resposta.status(201).json({}); })
                .catch(erro => { return resposta.status(500).json({ erro: erro.message }); });                
            })
        .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
        .finally(() => { conexao.close(); });        
});

router.put('/:id', (requisicao, resposta) => {
    if (requisicao.body.length < 1)
    return resposta.status(400).json({ erro: 'Objeto JSON da compra não identificado!' });

    let validacao = ValidarCompra(requisicao.body);
    if (validacao.resultado == false)
        return resposta.status(400).json({ erro: validacao.erro });    
        
    //Montar SQL de atualização da compra
    let sql = `UPDATE compras SET Descricao = ?, Data_Compra = ?, Id_Categoria = ?, Id_MeioPagamento = ?, Parcelas = ?, Valor = ? WHERE Id = ? AND Id_Usuario = ?`;

    const conexao = new Conexao();
    conexao.query(sql, [requisicao.body.descricao, requisicao.body.dataCompra, requisicao.body.categoria.id, requisicao.body.meioPagamento.id, 
                        requisicao.body.parcelas.length, requisicao.body.total, requisicao.params.id, requisicao.body.idUsuario])
        .then(resultado => { 
            sql = 'DELETE FROM parcelas WHERE Id_Compra = ?;';
            conexao.query(sql, [requisicao.params.id])
            .then(() => {
                let params = [];

                requisicao.body.parcelas.forEach(item => {
                    params.push([`${item.dataVencimento}`, item.valor, requisicao.params.id]);
                });

                sql = 'INSERT INTO parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ?';                
                conexao.query(sql, [params])
                .then(() => { return resposta.status(200).json({}); })
                .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
                .finally(() =>{ conexao.close(); });
            })
            .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })            
        })
        .catch(erro => { return resposta.status(500).json({ erro: erro.message }); });       
});

router.delete('/:id', (requisicao, resposta) => {
    if (requisicao.query['id_usuario'] == null)
        return resposta.status(400).json({ erro: "ID do usuário não informado!" });

    let sqlParcelas = 'DELETE FROM parcelas WHERE Id_Compra = ?';        

    const conexao = new Conexao();
    conexao.query(sqlParcelas, [requisicao.params.id])
    .then(() => { 
        let sqlCompra = 'DELETE FROM compras AND Id = ? AND Id_Usuario = ?';

        conexao.query(sqlParcelas, [requisicao.params.id, requisicao.query['id_usuario']])
        .then(() => { return resposta.status(200).json({}); })
        .catch(erro => { return resposta.status(500).json({ erro: erro.message }); });        
    })
    .catch(erro => { return resposta.status(500).json({ erro: erro.message }); })
    .finally(() =>{ conexao.close(); });
});

function getCompras(ids, idUsuario){
    return new Promise((resolve, reject) => {
        let sql = `SELECT compra.Id AS id
                        , compra.Descricao AS descricao
                        , compra.Data_Compra AS dataCompra
                        , compra.Id_Categoria AS idCategoria
                        , cat.Descricao AS descricaoCategoria
                        , compra.Id_MeioPagamento AS idMeio
                        , meio.Descricao AS descricaoMeio
                        , compra.Valor AS total
                        , parcela.Id AS idParcela
                        , parcela.Data_Vencimento AS dataVencimento
                        , parcela.Valor AS valorParcela
                   FROM compras compra
                   INNER JOIN categorias cat ON (compra.Id_Categoria = cat.Id)
                   INNER JOIN meiospagamento meio ON (compra.Id_MeioPagamento = meio.Id)
                   INNER JOIN parcelas parcela on (compra.Id = parcela.Id_Compra)
                   WHERE compra.Id_Usuario = ?`;

        if (ids != null)
            sql += `\n AND compra.Id in (${ids})`;
        
        sql += ' ORDER BY compra.Data_Compra DESC';
                   
        const conexao = new Conexao();
        let retorno = [];
        conexao.query(sql, [idUsuario])
            .then(linhas => {
                if (linhas.length == 0){
                    resolve(retorno);
                } else{   
                    let quebra = -1;
                    let i = 0;
                    let parcelas = [];
                    do {
                        if (quebra != linhas[i].id){
                            if (i != 0) {
                                let meioPagamento = new MeioPagamento(linhas[i - 1].idMeio, linhas[i - 1].descricaoMeio);
                                let categoria = new Categoria(linhas[i - 1].idCategoria, linhas[i - 1].descricaoCategoria);                                
                                retorno.push(new Compra(linhas[i - 1].id, linhas[i - 1].descricao, linhas[i - 1].dataCompra, categoria, meioPagamento, parcelas, linhas[i - 1].total))

                                parcelas = [];
                                quebra = i;
                            }                                                    

                            quebra = linhas[i].id;
                        }

                        parcelas.push(new Parcela(linhas[i].idParcela, linhas[i].dataVencimento, linhas[i].valorParcela));
                        i++;
                    } while (i < linhas.length);

                    let meioPagamento = new MeioPagamento(linhas[i - 1].idMeio, linhas[i - 1].descricaoMeio);
                    let categoria = new Categoria(linhas[i - 1].idCategoria, linhas[i - 1].descricaoCategoria);                                
                    retorno.push(new Compra(linhas[i - 1].id, linhas[i - 1].descricao, linhas[i - 1].dataCompra, categoria, meioPagamento, parcelas, linhas[i - 1].total))
            
                    resolve(retorno);
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

function ValidarCompra(compra){
    if (compra.idUsuario == null || compra.idUsuario <= 0)     
        return { resultado: false, erro: 'A compra não possui um usuário válido!' };

    if (compra.valor <= 0)
        return { resultado: false, erro: 'A compra deve possuir um valor superior à 0!' };

    if (compra.parcelas.length < 1)
        return { resultado: false, erro: 'A compra deve possuir ao menos uma parcela!' };

    let soma = 0;
    compra.parcelas.forEach(item => { 
        if (item.dataVencimento == null)
            return { resultado: false, erro: 'Uma ou mais parcelas não possuem data de vencimento!' };    

        if (item.valor <= 0)
            return { resultado: false, erro: 'Uma ou mais parcelas não possuem valor!' };                

        soma += item.valor; 
    });

    if (compra.total != soma)
        return { resultado: false, erro: 'A soma das parcelas deve ser igual ao total da compra!' };

    if (compra.categoria == null || compra.categoria.id <= 0)     
        return { resultado: false, erro: 'A compra não possui uma categoria válida!' };

    if (compra.meioPagamento == null || compra.meioPagamento.id <= 0)     
        return { resultado: false, erro: 'A compra não possui um meio de pagamento válido!' };

    if (compra.dataCompra == null)     
        return { resultado: false, erro: 'A compra não possui uma data de compra!' };

    return { resultado: true, erro: '' };
}

module.exports = router;