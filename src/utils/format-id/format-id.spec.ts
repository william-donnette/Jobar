import assert from 'assert';
import {formatId} from '.';

describe('formatId function', function () {
	it('should convert string to lowercase', function () {
		const input = 'HELLO WORLD';
		const result = formatId(input);
		assert.strictEqual(result, 'hello-world');
	});

	it('should remove special characters and keep only letters, numbers, and spaces', function () {
		const input = 'Hello@#$ World! 123';
		const result = formatId(input);
		assert.strictEqual(result, 'hello-world-123');
	});

	it('should trim spaces from the start and end', function () {
		const input = '   Hello World   ';
		const result = formatId(input);
		assert.strictEqual(result, 'hello-world');
	});

	it('should replace multiple spaces with a single dash', function () {
		const input = 'Hello   World';
		const result = formatId(input);
		assert.strictEqual(result, 'hello-world');
	});

	it('should throw an error for an empty string input', function () {
		const input = '';
		assert.throws(() => formatId(input), new Error("This input can't be used as an ID"));
	});

	it('should throw an error for a string with only special characters', function () {
		const input = '@#$%^&*()';
		assert.throws(() => formatId(input), new Error("This input can't be used as an ID"));
	});

	it('should handle numbers correctly', function () {
		const input = '123 456 789';
		const result = formatId(input);
		assert.strictEqual(result, '123-456-789');
	});

	it('should keep tiret', function () {
		const input = 'hello-world';
		const result = formatId(input);
		assert.strictEqual(result, 'hello-world');
	});

	it('should throw an error if the result is empty after formatting', function () {
		const input = '   @#$%^&*()   ';
		assert.throws(() => formatId(input), new Error("This input can't be used as an ID"));
	});
});
