const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const app = express();
const PORTA = 6987;

app.use(express.static(path.join(__dirname, 'public')));
//app.use(logger);
app.use(express.json);
//app.use('/api/usuarios', require('./routes/api/usuarios'));

app.get('/api/usuarios', (req, res) => {
    console.log("tentando criar objeto conexão");
    res.json({ Resposta: " Certo!" });
});


app.listen(PORTA, () => console.log(`Servidor inciado na porta ${PORTA}`));