import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});

const payment = new Payment(client);

export default async function handler(req, res) {
    // Permite apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Método não permitido. Use POST." });
    }

    const { amount, email, description, metadata } = req.body;

    // Validação básica
    if (!amount || !email) {
        return res.status(400).json({ error: "Valor e e-mail são obrigatórios" });
    }

    try {
        const result = await payment.create({
            body: {
                transaction_amount: Number(amount),
                description: description || "Pagamento via App",
                payment_method_id: 'pix',
                payer: { email },
                metadata: metadata || {}
            }
        });

        // Retorna os dados que o seu App Java precisa
        return res.status(201).json({
            payment_id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
            message: "PIX gerado com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: "Erro no Mercado Pago", 
            details: error.message 
        });
    }
}