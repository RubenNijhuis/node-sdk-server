// Import the framework and instantiate it
import cors from '@fastify/cors';
import fastify, { FastifyRequest } from 'fastify';

import { PayClient } from './PayClient/index.js';

declare module "fastify" {
    export interface FastifyInstance {
        payClient: PayClient;
    }
}

const loggerSettings = {
    transport: {
        target: 'pino-pretty',
        options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
        },
    },
}

const app = fastify({
    logger: loggerSettings
})

await app.register(cors)

interface PreHandlerConfigBody {
    config: {
        serviceId: string;
        serviceSecret: string;
        tgu: string;
    }
}

app.addHook('preHandler', (request: FastifyRequest<{ Body: PreHandlerConfigBody }>, reply, done) => {
    if (!request.body) {
        return reply.code(400).send({
            error: `Please provide serviceId and serviceSecret in a "config" object`
        });
    }

    if (!request.body.config) {
        return reply.code(400).send({
            error: `Please provide serviceId and serviceSecret in a "config" object`
        });
    }

    const { serviceId, serviceSecret } = request.body.config;

    if (!serviceId || !serviceSecret) {
        return reply.code(400).send({
            error: `Please provide serviceId and serviceSecret in a "config" object`
        });
    }

    if (!request.body.config.tgu) {
        app.payClient = new PayClient({
            serviceId,
            serviceSecret
        });
    }

    app.payClient = new PayClient({
        serviceId,
        serviceSecret,
    });

    done();
})

app.get("/health-check", async () => {
    return {
        status: 'ok'
    }
});

// Declare all functions
app.post('/service', async () => {
    return app.payClient.services.getConfig();
});


interface GetOrderBody { id: string; }
app.post('/order/status', async (request: FastifyRequest<{ Body: GetOrderBody }>, reply) => {
    if (!request.body.id) {
        return reply.code(400).send({
            error: `Please provide order id in a "id" object`
        });
    }

    return app.payClient.orders.status(request.body.id);
});

type CreateOrderBody = Parameters<PayClient["orders"]["create"]>[0];
app.post('/order/create', async (request: FastifyRequest<{ Body: CreateOrderBody }>, reply) => {
    if (!request.body) {
        return reply.code(400).send({
            error: `Please provide order details in a "body" object`
        });
    }

    return app.payClient.orders.create(request.body);
});

try {
    await app.listen({ port: 3000, host: "0.0.0.0" })
} catch (err) {
    app.log.error(err);
    process.exit(1)
}