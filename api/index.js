import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const app = express();
app.use(express.json());

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});
const payment = new Payment(client);

// Rota para Criar Pagamento (O que seu Java chama)
app.post('/create-payment', async (req, res) => {
    try {
        const { amount, email, description, metadata } = req.body;
        
        const paymentData = {
            body: {
                transaction_amount: parseFloat(amount),
                description: description || "Pagamento App",
                payment_method_id: 'pix',
                payer: { email },
                metadata: metadata || {}
            }
        };

        const result = await payment.create(paymentData);
        
        // Retorna exatamente o que o Android precisa
        res.status(201).json({
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Rota de Teste (Para você abrir no navegador)
app.get('/', (req, res) => {
    res.send("Servidor Thly Bank Online na Render!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
