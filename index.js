const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

const ordersApiUrl = 'https://partner.shopeemobile.com/api/v1/orders/get';
const partnerId = 'SEU_PARTNER_ID';
const shopId = 'ID_DA_SUA_LOJA';
const apiKey = 'SUA_API_KEY';

app.get('/api/total-revenue', async (req, res) => {
  try {
    const params = {
      partner_id: partnerId,
      shopid: shopId,
      pagination_offset: 0,
      pagination_entries_per_page: 100,
      create_time_from: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // Há 30 dias
      create_time_to: Math.floor(Date.now() / 1000), // Agora
    };
    const config = {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      params: params,
    };
    let totalRevenue = 0;
    let hasMoreOrders = true;
    while (hasMoreOrders) {
      const response = await axios.get(ordersApiUrl, config);
      const data = response.data;

      if (data.error === 0 && data.orders) {
        const orders = data.orders;

        // Calcular a receita total somando o valor dos pedidos
        orders.forEach(order => {
          totalRevenue += parseFloat(order.total_amount);
        });

        // Verificar se há mais páginas de pedidos a serem buscadas
        if (orders.length < params.pagination_entries_per_page) {
          hasMoreOrders = false; // Não há mais pedidos para buscar
        } else {
          // Incrementar o offset para buscar a próxima página
          params.pagination_offset += params.pagination_entries_per_page;
        }
      } else {
        throw new Error(`Erro ao buscar pedidos: ${data.msg}`);
      }
    }
    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Iniciar o servidor Express
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
