const supertest = require('supertest');
const axios = require('axios');
const app = require('./index'); // Ajuste o caminho conforme necessário

jest.mock('axios');

describe('GET /api/total-revenue', () => {
  it('deve calcular a receita total corretamente', async () => {
    const mockedResponse = {
      data: {
        error: 0,
        orders: [
          { total_amount: '100.00' },
          { total_amount: '200.00' }
        ]
      }
    };
    axios.get.mockResolvedValue(mockedResponse);
    const response = await supertest(app).get('/api/total-revenue');
    expect(response.status).toBe(200);
    expect(response.body.totalRevenue).toBe(300);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('https://partner.shopeemobile.com/api/v1/orders/get'), expect.any(Object));
  });

  it('deve lidar com erros ao buscar pedidos', async () => {
    axios.get.mockRejectedValue(new Error('Erro ao buscar pedidos'));
    const response = await supertest(app).get('/api/total-revenue');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Erro ao buscar pedidos');
  });
});