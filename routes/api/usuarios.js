const express = require('express');
const router = express.Router();
//var mysql = require('mysql');

// router.post('/', (requisicao, resposta) => {
//     resposta.send(requisicao.body);
// });

router.get('/', (requisicao, resposta) => {
    console.log("tentando criar objeto conexão");
    resposta.json({ Resposta: " Certo!" });
});

module.exports = router;