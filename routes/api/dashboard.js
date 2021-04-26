const express = require('express');
const router = express.Router();
const Conexao = require('../../conexao');

router.get('/graficos/:tipo/:classificacao', (requisicao, resposta) => {
    let tipo = requisicao.params.tipo;
    let classificacao = requisicao.params.classificacao;
    if ((tipo != 'pizza') && (tipo != 'colunas') && (tipo != 'linhas'))
        return resposta.status(400).json({ erro: 'Tipo de gráfico inválido!' });

    if ((classificacao != 'categorias') && (classificacao != 'meiospagamento'))
        return resposta.status(400).json({ erro: 'Classificação inválida!' });

    let data = new Date(), ano = data.getFullYear(), mes = data.getMonth();
    let dataUltimoDia = new Date(ano, mes + 1, 0);

    //Para o gráfico de linhas, a pesquisa pega os últimos 6 meses
    let dataPesquisaIni;
    if (tipo == 'linhas'){
        data.setMonth(data.getMonth() - 6);
        dataPesquisaIni = data.getFullYear() + '-' + (mes + 1) + '-01';
    }
    else
        dataPesquisaIni = ano + '-' + (mes + 1) + '-01';

    let dataPesquisaFim = ano + '-' + (mes + 1) + '-' + dataUltimoDia.getDate();

    if (tipo == 'pizza' || tipo == 'colunas'){
        ExecutarSQLPizzaOuColunas(classificacao, [dataPesquisaIni, dataPesquisaFim])
        .then(resultado => {
            return resposta.status(200).json(resultado);
        })
        .catch(erro => { 
            return resposta.status(500).json({ erro: erro.message })
        });
    } else {
        // ExecutarSQLLinhas(classificacao, dataPesquisaIni, dataPesquisaFim)
        // .then(resultado => {
        //     return resposta.status(200).json(resultado);
        // })
        // .catch(erro => { 
        //     return resposta.status(500).json({ erro: erro.message })
        // });
        return resposta.status(200).json({"series": ["x", "y", "z"], "valores": [["2021-02", 199.25, 200.56, 1300.74], ["2021-03", 250.00, 743.43, 800.41], ["2021-04", 0, 463.11, 998.43]]});
    }   
});

function ExecutarSQLPizzaOuColunas(classificacao, params){
    let sql;
    if (classificacao == 'categorias')
        sql = 
        `SELECT cat.Descricao AS descricao, SUM(parcelas.Valor) AS valor
         FROM compras compras
         INNER JOIN categorias cat on (compras.Id_Categoria = cat.Id)
         INNER JOIN parcelas parcelas on (compras.Id = parcelas.Id_compra)
         WHERE parcelas.Data_Vencimento BETWEEN ? AND ?
         GROUP BY compras.Id_Categoria;`;
    else
        sql = 
        `SELECT meios.Descricao AS descricao, SUM(parcelas.Valor) AS valor
         FROM compras compras
         INNER JOIN meiospagamento meios on (compras.Id_MeioPagamento = meios.Id)
         INNER JOIN parcelas parcelas on (compras.Id = parcelas.Id_compra)
         WHERE parcelas.Data_Vencimento BETWEEN ? AND ?
         GROUP BY compras.Id_MeioPagamento;`;

    return new Promise((resolve, reject) => {
        const conexao = new Conexao();
        conexao.query(sql, params)
            .then(resultado => {
                resolve(resultado);
            })
            .catch(erro => {   
                throw erro;
            })
            .finally(() =>{
                conexao.close();
            });        
    });      
}

function ExecutarSQLLinhas(classificacao, dataPesquisaIni, dataPesquisaFim){
    let sql;
    if (classificacao == 'categorias')
        sql = 
        `SELECT cat.Descricao AS descricao
        FROM compras compras
        INNER JOIN categorias cat on (compras.Id_Categoria = cat.Id)
        WHERE Data_Compra BETWEEN ? AND ?
        GROUP BY compras.Id_Categoria
        ORDER BY cat.Descricao;`;
    else
        sql = 
        `SELECT meios.Descricao AS descricao
         FROM compras compras
         INNER JOIN meiospagamento meios on (compras.Id_MeioPagamento = meios.Id)
         WHERE Data_Compra BETWEEN ? AND ?
         GROUP BY compras.Id_MeioPagamento
         ORDER BY meios.Descricao;`;    

    return new Promise((resolve, reject) => {
        let retorno = { series: [], valores: [[], [], [], [], [], []] };
        const conexao = new Conexao();        
        conexao.query(sql, [dataPesquisaIni, dataPesquisaFim])
            .then(resultado => {
                if (classificacao == 'categorias')
                    sql = 
                    `SELECT COALESCE(ROUND(SUM(parcelas.Valor), 2), 0) AS valor
                     FROM categorias cat
                     LEFT JOIN compras compras ON (cat.Id = compras.Id_Categoria)
                     LEFT JOIN parcelas parcelas ON (compras.Id = parcelas.Id_Compra)
                     WHERE cat.Descricao = ?
                    AND parcelas.Data_Vencimento BETWEEN ? AND ?`;
                else
                    sql = 
                    ``;

                resultado.forEach(linha => {
                    retorno.series.push(linha.descricao);

                    for (let i = 5; i >= 0; i--) {                    
                        let dataTemp = new Date(dataPesquisaFim);
                        dataTemp.setDate(1);
                        dataTemp.setMonth(dataTemp.getMonth() - i);
                        let dataTempUltimoDia = new Date(dataTemp.getFullYear(), dataTemp.getMonth() + 1, 0);
                        let mes = String("00" + (dataTemp.getMonth() + 1)).slice(-2);                        
                        
                        let dataSerieIni = dataTemp.getFullYear() + '-' + mes + '-01';
                        let dataSerieFim = dataTemp.getFullYear() + '-' + mes + '-' + dataTempUltimoDia.getDate();

                        //retorno.valores[Math.abs(i - 5)].push(dataSerieIni.substring(0, 7));

                        conexao.query(sql, [linha.descricao, dataSerieIni, dataSerieFim])
                        .then(resultado => {                          
                            retorno.valores[Math.abs(i - 5)].push(resultado[0].valor);
                        })
                        .catch(erro => { throw erro; })                        
                    }                    
                });

                resolve(retorno);
            })
            .catch(erro => { throw erro; })
            .finally(() => { conexao.close(); });
        });
}

module.exports = router;