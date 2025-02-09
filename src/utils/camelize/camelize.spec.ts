import assert from 'assert';
import {camelize} from '.';

describe('camelize function', () => {
	it('should camelize a string with spaces', () => {
		const result = camelize('hello world');
		assert.strictEqual(result, 'helloWorld');
	});

	it('should camelize a string with dashes', () => {
		const result = camelize('hello-world');
		assert.strictEqual(result, 'helloWorld');
	});

	it('should camelize a string with underscores', () => {
		const result = camelize('hello_world');
		assert.strictEqual(result, 'helloWorld');
	});

	it('should handle multiple non-word characters in a row', () => {
		const result = camelize('hello--world__test');
		assert.strictEqual(result, 'helloWorldTest');
	});

	it('should not modify a camelCase string', () => {
		const result = camelize('helloWorld');
		assert.strictEqual(result, 'helloWorld');
	});

	it('should handle an empty string', () => {
		const result = camelize('');
		assert.strictEqual(result, '');
	});

	it('should handle a string with no non-word characters', () => {
		const result = camelize('helloworld');
		assert.strictEqual(result, 'helloworld');
	});

	it('should handle strings with special characters', () => {
		const result = camelize('hello@world#test');
		assert.strictEqual(result, 'helloWorldTest');
	});
});
