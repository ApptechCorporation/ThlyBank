import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const app = express();
app.use(express.json());

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});
const payment = new Payment(client);

// ROTA 1: Gerar PIX
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, email, description, metadata } = req.body;
        const result = await payment.create({
            body: {
                transaction_amount: parseFloat(amount),
                description: description || "Pagamento App",
                payment_method_id: 'pix',
                payer: { email },
                metadata: metadata || {}
            }
        });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROTA 2: Webhook
app.post('/api/webhook', async (req, res) => {
    try {
        const paymentId = req.body.data?.id;
        if (paymentId) {
            const result = await payment.get({ id: paymentId });
            if (result.status === "approved") {
                console.log("Pagamento Aprovado:", paymentId);
            }
        }
        res.status(200).send("OK");
    } catch (e) { res.status(200).send("Erro Processado"); }
});

// ROTA 3: Status Manual
app.get('/api/payment-status', async (req, res) => {
    try {
        const result = await payment.get({ id: req.query.id });
        res.json({ status: result.status });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));