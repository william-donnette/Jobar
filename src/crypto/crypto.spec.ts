import assert from 'assert';
import {webcrypto as crypto} from 'node:crypto';
import {getDataConverter as getDataConverterDefault} from '.';
import {decrypt, encrypt} from './crypto';
import {getDataConverter} from './data-converter';

describe('Crypto', () => {
	let key: any;

	before(async () => {
		key = await crypto.subtle.generateKey({name: 'AES-GCM', length: 256}, true, ['encrypt', 'decrypt']);
	});

	it('should encrypt and decrypt data correctly', async () => {
		const data = new Uint8Array([1, 2, 3, 4]);
		const encrypted = await encrypt(data, key);
		const decrypted = await decrypt(encrypted, key);
		assert.deepStrictEqual(decrypted, data);
	});
});

describe('Data Converter', () => {
	it('should return a valid data converter', async () => {
		const converter = await getDataConverter();
		assert.ok(converter.payloadCodecs);
	});

	it('should return a valid default data converter', async () => {
		const converter = await getDataConverterDefault();
		assert.ok(converter.payloadCodecs);
	});
});
