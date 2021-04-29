const express = require('express');
const router = express.Router();
const Conexao = require('../../conexao');

router.get('/graficos/:tipo/:classificacao', (requisicao, resposta) => {
    if (requisicao.query['id_usuario'] == null)
        return resposta.status(400).json({ erro: "ID do usuário não informado!" });

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
        ExecutarSQLPizzaOuColunas(classificacao, [dataPesquisaIni, dataPesquisaFim, requisicao.query['id_usuario']])
        .then(resultado => {
            return resposta.status(200).json(resultado);
        })
        .catch(erro => { 
            return resposta.status(500).json({ erro: erro.message })
        });
    } else {        
        ExecutarSQLLinhas(classificacao, dataPesquisaIni, dataPesquisaFim, requisicao.query['id_usuario'])
        .then(resultado => {
            return resposta.status(200).json(resultado);
        })
        .catch(erro => { 
            return resposta.status(500).json({ erro: erro.message })
        });
        // return resposta.status(200).json({"series": ["x", "y", "z"], "valores": [["2021-02", 199.25, 200.56, 1300.74], ["2021-03", 250.00, 743.43, 800.41], ["2021-04", 0, 463.11, 998.43]]});
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
         AND compras.Id_Usuario = ?
         GROUP BY compras.Id_Categoria;`;
    else
        sql = 
        `SELECT meios.Descricao AS descricao, SUM(parcelas.Valor) AS valor
         FROM compras compras
         INNER JOIN meiospagamento meios on (compras.Id_MeioPagamento = meios.Id)
         INNER JOIN parcelas parcelas on (compras.Id = parcelas.Id_compra)
         WHERE parcelas.Data_Vencimento BETWEEN ? AND ?
         AND compras.Id_Usuario = ?
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

async function ExecutarSQLLinhas(classificacao, dataPesquisaIni, dataPesquisaFim, idUsuario){
    let sql;
    if (classificacao == 'categorias')
        sql = 
        `SELECT DISTINCT compras.Id_Categoria AS id, cat.Descricao AS descricao FROM compras compras INNER JOIN categorias cat ON (compras.Id_Categoria = cat.Id) INNER JOIN parcelas parcelas ON (compras.Id = parcelas.Id_Compra)
         WHERE compras.Id_Usuario = ? AND parcelas.Data_Vencimento BETWEEN ? AND ? GROUP BY compras.Id_Categoria ORDER BY cat.Descricao;`; 
    else
        sql = 
        `SELECT DISTINCT compras.Id_MeioPagamento AS id, meios.Descricao AS descricao FROM compras compras INNER JOIN meiospagamento meios ON (compras.Id_MeioPagamento = meios.Id) INNER JOIN parcelas parcelas ON (compras.Id = parcelas.Id_Compra)
         WHERE compras.Id_Usuario = ? AND parcelas.Data_Vencimento BETWEEN ? AND ? GROUP BY compras.Id_MeioPagamento ORDER BY meios.Descricao;`;    

    let retorno = { series: [], valores: [[], [], []] };
    let faltante = 99;
    const conexao = new Conexao();                
    conexao.query(sql, [idUsuario, dataPesquisaIni, dataPesquisaFim])
    .then(resultado => {
        if (classificacao == 'categorias')
            sql = 
            `SELECT COALESCE(ROUND(SUM(parcelas.Valor), 2), 0) AS valor FROM categorias cat LEFT JOIN compras compras ON (cat.Id = compras.Id_Categoria) LEFT JOIN parcelas parcelas ON (compras.Id = parcelas.Id_Compra)
             WHERE compras.id_Usuario = ? AND compras.Id_Categoria = ? AND parcelas.Data_Vencimento BETWEEN ? AND ?`;
        else
            sql = 
            `SELECT COALESCE(ROUND(SUM(parcelas.Valor), 2), 0) AS valor FROM meiospagamento meios LEFT JOIN compras compras ON (meios.Id = compras.Id_MeioPagamento) LEFT JOIN parcelas parcelas ON (compras.Id = parcelas.Id_Compra)
             WHERE compras.id_Usuario = ? AND compras.Id_MeioPagamento = ? AND parcelas.Data_Vencimento BETWEEN ? AND ?`;                              
            
        faltante = resultado.length * 3;

        //preenche só as datas primeiro
        for (let j = 2; j >= 0; j--) {   
            let dataTemp = new Date(dataPesquisaFim);
            dataTemp.setDate(1);
            dataTemp.setMonth(dataTemp.getMonth() - j);
            let mes = String("00" + (dataTemp.getMonth() + 1)).slice(-2);                        
                
            let dataSerieIni = dataTemp.getFullYear() + '-' + mes + '-01';

            retorno.valores[Math.abs(j - 2)].push(dataSerieIni.substring(0, 7));                        
        }

        for (let i = 0; i < resultado.length; i++) {
            retorno.series.push(resultado[i].descricao);
                
            for (let j = 2; j >= 0; j--) {   
                let dataTemp = new Date(dataPesquisaFim);
                dataTemp.setDate(1);
                dataTemp.setMonth(dataTemp.getMonth() - j);
                let dataTempUltimoDia = new Date(dataTemp.getFullYear(), dataTemp.getMonth() + 1, 0);
                let mes = String("00" + (dataTemp.getMonth() + 1)).slice(-2);                        
                    
                let dataSerieIni = dataTemp.getFullYear() + '-' + mes + '-01';
                let dataSerieFim = dataTemp.getFullYear() + '-' + mes + '-' + dataTempUltimoDia.getDate();

                conexao.query(sql, [idUsuario, resultado[i].id, dataSerieIni, dataSerieFim])
                .then(resultado2 => {                                
                    retorno.valores[Math.abs(j - 2)].push(resultado2[0].valor || 0);
                    faltante--;
                })
                .catch(erro => { console.log(erro) })
            }                           
        }             
    })
    .catch(erro => { console.log(erro) })
    .finally(() => { 
        conexao.close(); 
    });

    do{
        await new Promise(r => setTimeout(r, 500));
    } while (faltante != 0);
    return retorno;     
}

module.exports = router;