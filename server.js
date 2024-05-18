const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Adicione esta configuração para evitar erros de SSL
    }
});

// Rota para buscar dados do banco de dados
app.get('/tasks', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM tasks');
        const tasks = result.rows;
        client.release();
        res.json(tasks);
    } catch (err) {
        console.error('Erro ao buscar dados do banco de dados:', err);
        res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
    }
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
