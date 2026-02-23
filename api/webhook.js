import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});

const payment = new Payment(client);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).end();
    }

    try {
        // O Mercado Pago envia o ID de formas diferentes dependendo do evento
        const paymentId = req.body.data?.id || req.body.resource?.split('/').pop();

        if (!paymentId || isNaN(paymentId)) {
            return res.status(200).send("Aguardando ID válido");
        }

        const result = await payment.get({ id: paymentId });

        if (result.status === "approved") {
            console.log(`Pagamento ${paymentId} APROVADO.`);
            // Espaço para sua lógica de banco de dados
        }

        res.status(200).send("OK");

    } catch (error) {
        console.error("Erro no Webhook:", error.message);
        res.status(200).send("Erro processado"); // Retornamos 200 para o MP parar de tentar
    }
}