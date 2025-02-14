import 'dotenv/config';

export const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
export const PORT = Number(process.env.APP_PORT ?? 3000);
export const HOSTNAME = process.env.APP_HOSTNAME ?? '127.0.0.1';
