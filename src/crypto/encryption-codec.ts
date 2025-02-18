// @@@SNIPSTART typescript-encryption-codec
import {METADATA_ENCODING_KEY, Payload, PayloadCodec, ValueError} from '@temporalio/common';
import {decode, encode} from '@temporalio/common/lib/encoding';
import {temporal} from '@temporalio/proto';
import {webcrypto as crypto} from 'node:crypto';
import {decrypt, encrypt} from './crypto';

const ENCODING = 'binary/encrypted';
const METADATA_ENCRYPTION_KEY_ID = 'encryption-key-id';

export class EncryptionCodec implements PayloadCodec {
	constructor(protected readonly keys: Map<string, crypto.CryptoKey>, protected readonly defaultKeyId: string) {}

	static async create(keyId: string): Promise<EncryptionCodec> {
		const keys = new Map<string, crypto.CryptoKey>();
		keys.set(keyId, await fetchKey(keyId));
		return new this(keys, keyId);
	}

	/* istanbul ignore next */
	async encode(payloads: Payload[]): Promise<Payload[]> {
		return Promise.all(
			payloads.map(async (payload) => ({
				metadata: {
					[METADATA_ENCODING_KEY]: encode(ENCODING),
					[METADATA_ENCRYPTION_KEY_ID]: encode(this.defaultKeyId),
				},
				// Encrypt entire payload, preserving metadata
				data: await encrypt(
					temporal.api.common.v1.Payload.encode(payload).finish(),
					this.keys.get(this.defaultKeyId)! // eslint-disable-line @typescript-eslint/no-non-null-assertion
				),
			}))
		);
	}

	/* istanbul ignore next */
	async decode(payloads: Payload[]): Promise<Payload[]> {
		return Promise.all(
			payloads.map(async (payload) => {
				if (!payload.metadata || decode(payload.metadata[METADATA_ENCODING_KEY]) !== ENCODING) {
					return payload;
				}
				if (!payload.data) {
					throw new ValueError('Payload data is missing');
				}

				const keyIdBytes = payload.metadata[METADATA_ENCRYPTION_KEY_ID];
				if (!keyIdBytes) {
					throw new ValueError('Unable to decrypt Payload without encryption key id');
				}

				const keyId = decode(keyIdBytes);
				let key = this.keys.get(keyId);
				if (!key) {
					key = await fetchKey(keyId);
					this.keys.set(keyId, key);
				}
				const decryptedPayloadBytes = await decrypt(payload.data, key);
				return temporal.api.common.v1.Payload.decode(decryptedPayloadBytes);
			})
		);
	}
}

async function fetchKey(_keyId: string): Promise<crypto.CryptoKey> {
	// In production, fetch key from a key management system (KMS). You may want to memoize requests if you'll be decoding
	// Payloads that were encrypted using keys other than defaultKeyId.
	const key = Buffer.from('test-key-test-key-test-key-test!');
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		key,
		{
			name: 'AES-GCM',
		},
		true,
		['encrypt', 'decrypt']
	);

	return cryptoKey;
}
// @@@SNIPEND
