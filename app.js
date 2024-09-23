const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// Rota inicial
app.get('/', (req, res) => {
    res.send('<a href="/auth">Login com Mercado Livre</a>');
});

// Rota de autenticação - redireciona para o Mercado Livre
app.get('/auth', (req, res) => {
    const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
});

// Rota de callback - onde o Mercado Livre redireciona após autenticação
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.send('Erro: Código de autenticação não fornecido.');
    }

    try {
        // Trocar o código de autorização pelo token de acesso
        const tokenResponse = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            },
        });

        const { access_token, refresh_token } = tokenResponse.data;

        res.json({
            message: 'Autenticação bem-sucedida!',
            access_token,
            refresh_token,
        });
    } catch (error) {
        console.error('Erro ao obter o token de acesso:', error.response.data);
        res.status(500).send('Erro ao obter o token de acesso.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
