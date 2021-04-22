const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const cors = require('cors');
const app = express();
const PORTA = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger);
app.use(cors());
app.use(express.json());
app.use('/api/usuarios', require('./routes/api/usuarios'));

app.listen(PORTA, () => console.log(`Servidor inciado na porta ${PORTA}`));