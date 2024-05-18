const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 
require('dotenv').config();

const app = express();

// Use o middleware CORS
app.use(cors());
app.use(express.json()); // Middleware para analisar o corpo das solicitações como JSON

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

// Rota para adicionar uma nova tarefa ao banco de dados
app.post('/tasks', async (req, res) => {
    try {
        const { task } = req.body;

        // Verifique se o campo de tarefa foi fornecido
        if (!task) {
            return res.status(400).json({ error: 'O campo de tarefa é obrigatório' });
        }

        const client = await pool.connect();
        const result = await client.query('INSERT INTO tasks (task, created_at) VALUES ($1, NOW()) RETURNING *', [task]);
        const newTask = result.rows[0];
        client.release();
        res.status(201).json(newTask); // Retorna a nova tarefa com status 201 (Created)
    } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
        res.status(500).json({ error: 'Erro ao adicionar tarefa' });
    }
});


// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
