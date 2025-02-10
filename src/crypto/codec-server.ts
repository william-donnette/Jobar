import * as proto from '@temporalio/proto';
import cors from 'cors';
import express from 'express';
import {EncryptionCodec} from './encryption-codec';

type Payload = proto.temporal.api.common.v1.IPayload;

interface JSONPayload {
	metadata?: Record<string, string> | null;
	data?: string | null;
}

interface Body {
	payloads: JSONPayload[];
}

/**
 * Helper function to convert a valid proto JSON to a payload object.
 *
 * This method will be part of the SDK when it supports proto JSON serialization.
 */
function fromJSON({metadata, data}: JSONPayload): Payload {
	return {
		metadata: metadata && Object.fromEntries(Object.entries(metadata).map(([k, v]): [string, Uint8Array] => [k, Buffer.from(v, 'base64')])),
		data: data ? Buffer.from(data, 'base64') : undefined,
	};
}

/**
 * Helper function to convert a payload object to a valid proto JSON.
 *
 * This method will be part of the SDK when it supports proto JSON serialization.
 */
function toJSON({metadata, data}: proto.temporal.api.common.v1.IPayload): JSONPayload {
	return {
		metadata: metadata && Object.fromEntries(Object.entries(metadata).map(([k, v]): [string, string] => [k, Buffer.from(v).toString('base64')])),
		data: data ? Buffer.from(data).toString('base64') : undefined,
	};
}

export async function startCodec({port = 8883}: any = {}) {
	const codec = await EncryptionCodec.create('test-key-id');

	const app = express();
	app.use(cors({allowedHeaders: ['x-namespace', 'content-type']}));
	app.use(express.json());

	app.post('/decode', async (req, res) => {
		try {
			const {payloads: raw} = req.body as Body;
			const encoded = raw.map(fromJSON);
			const decoded = await codec.decode(encoded);
			const payloads = decoded.map(toJSON);
			res.json({payloads}).end();
		} catch (err) {
			res.status(500).end('Internal server error');
		}
	});

	app.post('/encode', async (req, res) => {
		try {
			const {payloads: raw} = req.body as Body;
			const decoded = raw.map(fromJSON);
			const encoded = await codec.encode(decoded);
			const payloads = encoded.map(toJSON);
			res.json({payloads}).end();
		} catch (err) {
			res.status(500).end('Internal server error');
		}
	});

	await new Promise<void>((resolve, reject) => {
		// @ts-ignore
		app.listen(port, resolve);
		app.on('error', reject);
	});
}
