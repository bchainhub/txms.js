import { test, describe } from 'node:test';
import { spawnSync } from 'child_process';
import assert from 'node:assert/strict';
import path from 'path';
import { JSDOM } from 'jsdom';
import txms from '../dist/index.js';
import samples from './samples.json' assert { type: 'json' };
import fs, { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const txmsPath = path.resolve(__dirname, '../bin/txms');
const outputDir = path.resolve(__dirname, './output');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// Encode/Decode Tests
describe('Encode/Decode Tests', () => {
	samples.valid.forEach((f) => {
		test(`Should encode - to data. Description: ${f.description}`, () => {
			const actual = txms.encode(f.hex);
			assert.strictEqual(actual, f.data);
		});
	});

	samples.valid.forEach((f) => {
		test(`Should decode - to hex. Description: ${f.description}`, () => {
			const actual = txms.decode(f.data);
			const normalizedActual = actual.startsWith('0x') ? actual.slice(2) : actual;
			const normalizedExpected = f.hex.startsWith('0x') ? f.hex.slice(2) : f.hex;
			assert.strictEqual(normalizedActual, normalizedExpected);
		});
	});

	samples.invalid.forEach((f) => {
		test(`Should encode — ${f.description}`, () => {
			assert.throws(() => {
				txms.encode(f.hex);
			}, /Not a hex format/);
		});
	});

	samples.valid.forEach((f) => {
		test(`Should count - characters. Description: ${f.description}`, () => {
			const length = txms.count(f.hex);
			assert.strictEqual(length, f.length);
		});
	});

	samples.valid.forEach((f) => {
		test(`Should count - SMS. Description: ${f.description}`, () => {
			const lengthSms = txms.count(f.hex, 'sms');
			assert.strictEqual(lengthSms, f.sms);
		});
	});

	samples.valid.forEach((f) => {
		test(`Should count - MMS. Description: ${f.description}`, () => {
			const lengthSms = txms.count(f.hex, 'mms');
			assert.strictEqual(lengthSms, f.mms);
		});
	});
});

// Endpoint Tests
describe('Endpoint Tests', () => {
	test('Endpoints - Mainnet - should return object.', () => {
		const endpoints = txms.getEndpoint(1, ['us', 'ca']);
		assert.ok(endpoints instanceof Object);
	});

	test('Endpoints - Devin - should return object.', () => {
		const endpoints = txms.getEndpoint('devin', ['bb', 'sx']);
		assert.ok(endpoints instanceof Object);
	});

	test('Endpoints - Default: Mainnet - should return object.', () => {
		const endpoints = txms.getEndpoint(undefined, ['us', 'ca']);
		assert.ok(endpoints instanceof Object);
	});
});

// SMS/MMS Tests
describe('SMS/MMS Tests', () => {
	const hexMessage = samples.valid[0].hex;

	test('SMS - Single number as string', () => {
		const smsUri = txms.sms('+12019715152', hexMessage, 'mainnet');
		assert.ok(smsUri.startsWith('sms:+12019715152?body='));
	});

	test('SMS - Single number as number', () => {
		const smsUri = txms.sms(12019715152, hexMessage, 'mainnet');
		assert.ok(smsUri.startsWith('sms:+12019715152?body='));
	});

	test('SMS - Multiple numbers as array', () => {
		const smsUri = txms.sms(['+12019715152', '+12014835939'], hexMessage, 'mainnet');
		assert.ok(smsUri.startsWith('sms:+12019715152,+12014835939?body='));
	});

	test('SMS - Default number with boolean true', () => {
		const smsUri = txms.sms(true, hexMessage, 'mainnet');
		assert.ok(smsUri.startsWith('sms:+12019715152?body='));
	});

	test('SMS - Invalid number format', () => {
		assert.throws(() => {
			txms.sms('2019715152', hexMessage, 'mainnet');
		}, /Invalid number format/);
	});

	test('SMS - No number provided', () => {
		const smsUri = txms.sms(false, hexMessage, 'mainnet');
		assert.ok(smsUri.startsWith('sms:?body='));
	});

	test('SMS - Encoding hex message', () => {
		const smsUri = txms.sms('+12019715152', hexMessage, 'mainnet', true);
		assert.ok(smsUri.startsWith('sms:+12019715152?body='));
	});

	test('SMS - No encoding, only URL encode', () => {
		const smsUri = txms.sms('+12019715152', hexMessage, 'mainnet', false);
		assert.ok(smsUri.includes(encodeURIComponent(hexMessage)));
	});

	test('MMS - Single number as string', () => {
		const mmsUri = txms.mms('+12019715152', hexMessage, 'mainnet');
		assert.ok(mmsUri.startsWith('mms:+12019715152?body='));
	});

	test('MMS - Single number as number', () => {
		const mmsUri = txms.mms(12019715152, hexMessage, 'mainnet');
		assert.ok(mmsUri.startsWith('mms:+12019715152?body='));
	});

	test('MMS - Multiple numbers as array', () => {
		const mmsUri = txms.mms(['+12019715152', '+12014835939'], hexMessage, 'mainnet');
		assert.ok(mmsUri.startsWith('mms:+12019715152,+12014835939?body='));
	});

	test('MMS - Default number with boolean true', () => {
		const mmsUri = txms.mms(true, hexMessage, 'mainnet');
		assert.ok(mmsUri.startsWith('mms:+12019715152?body='));
	});

	test('MMS - Invalid number format', () => {
		assert.throws(() => {
			txms.mms('2019715152', hexMessage, 'mainnet');
		}, /Invalid number format/);
	});

	test('MMS - No number provided', () => {
		const mmsUri = txms.mms(false, hexMessage, 'mainnet');
		assert.ok(mmsUri.startsWith('mms:?body='));
	});

	test('MMS - Encoding hex message', () => {
		const mmsUri = txms.mms('+12019715152', hexMessage, 'mainnet', true);
		assert.ok(mmsUri.startsWith('mms:+12019715152?body='));
	});

	test('MMS - No encoding, only URL encode', () => {
		const mmsUri = txms.mms('+12019715152', hexMessage, 'mainnet', false);
		assert.ok(mmsUri.includes(encodeURIComponent(hexMessage)));
	});
});

// Download Message Tests
describe('Download Message Tests', () => {
	// Node.js environment test
	test('Should download message file in Node.js environment', async () => {
		const hex = samples.valid[0].hex;

		// Define the output directory
		const outputDir = 'test/output';

		// Download message to the test/output directory
		const filename = await txms.downloadMessage(hex, 'nodejs testdata', outputDir);
		assert.match(filename, new RegExp(`${outputDir}/nodejs-testdata\\.txms\\.txt$`));  // Ensure the file was saved in the output directory
		assert.ok(fs.existsSync(filename));  // Check if the file actually exists
	});

	// Simulate the browser environment using jsdom
	test('Should download message file in simulated browser environment', async () => {
		// Create a new JSDOM instance, which simulates a browser environment
		const { window } = new JSDOM();
		global.window = window;
		global.document = window.document;
		global.Blob = window.Blob;
		global.URL = window.URL;

		const hex = samples.valid[0].hex;

		// Ensure the filename does not conflict with Node.js test
		const filename = await txms.downloadMessage(hex, 'browser-testdata', outputDir);

		// Assert that the filename is correct (no path since it's a browser simulation)
		assert.match(filename, /browser-testdata\.txms\.txt$/);

		// Clean up the global variables after the test is done
		delete global.window;
		delete global.document;
		delete global.Blob;
		delete global.URL;
	});
});

describe('CLI Tests', () => {
	test('Should display version', () => {
		const packageJsonPath = path.join(__dirname, '../package.json');
		const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
		const version = packageJson.version;
		const result = spawnSync('node', [txmsPath, '--version']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(result.stdout.toString(), version);
	});

	test('Should encode a value', () => {
		const hexValue = samples.valid[0].hex;
		const result = spawnSync('node', [txmsPath, `--encode=${hexValue}`]);
		assert.strictEqual(result.status, 0);
		assert.ok(result.stdout.toString().trim().length > 0);
	});

	test('Should decode a value', () => {
		const encodedValue = samples.valid[0].data;
		const result = spawnSync('node', [txmsPath, `-d="${encodedValue}"`]);
		assert.strictEqual(result.status, 0);
		assert.ok(result.stdout.toString().trim().startsWith('0x'));
	});

	test('Should return endpoints', () => {
		const result = spawnSync('node', [txmsPath, '--getendpoint=1', '--countries=global,sk']);
		const stdout = result.stdout.toString();
		assert.strictEqual(result.status, 0);
		assert.match(stdout, /^global:\+[\d,]+/);
	});

	test('Should handle invalid input', () => {
		const invalidhex = samples.invalid[0].hex;
		const result = spawnSync('node', [txmsPath, `--encode=${invalidhex}`]);
		assert.notStrictEqual(result.status, 0);
		assert.match(result.stderr.toString(), /Not a hex format/);
	});

	test('Should download message file in Node.js environment with specified output path', async () => {
		const hexValue = samples.valid[0].hex;
		const result = spawnSync('node', [txmsPath, '--download', `--encode=${hexValue}`, `-o=${outputDir}`]);
		assert.strictEqual(result.status, 0);
		assert.match(result.stdout.toString(), /^TxMS file was downloaded as ".*f8d880f38d00\.txms\.txt"\./);
		assert.ok(fs.existsSync(outputDir + '/f8d880f38d00.txms.txt'));
	});

	test('Should download message file in Node.js environment with specified output path and filename', async () => {
		const hexValue = samples.valid[0].hex;
		const result = spawnSync('node', [txmsPath, '--download', `--encode=${hexValue}`, `-o=${outputDir}`, '-f=cli-testdata']);
		assert.strictEqual(result.status, 0);
		assert.match(result.stdout.toString(), /^TxMS file was downloaded as ".*cli-testdata\.txms\.txt"\./);
		assert.ok(fs.existsSync(outputDir + '/cli-testdata.txms.txt'));
	});

	test('Should encode with piping', () => {
		const hexValue = samples.valid[0].hex;
		const echo = spawnSync('echo', [hexValue]);
		const result = spawnSync('node', [txmsPath, '--encode'], {
			input: echo.stdout
		});
		assert.strictEqual(result.status, 0);
		assert.strictEqual(result.stdout.toString(), samples.valid[0].data);
	});

	test('Should decode with piping', () => {
		const dataValue = samples.valid[0].data;
		const echo = spawnSync('echo', [dataValue]);
		const result = spawnSync('node', [txmsPath, '--decode'], {
			input: echo.stdout
		});
		assert.strictEqual(result.status, 0);
		assert.strictEqual(result.stdout.toString().trim(), samples.valid[0].hex);
	});

	test('Should count length', () => {
		const hexValue = samples.valid[0].hex;
		const result = spawnSync('node', [txmsPath, `--encode=${hexValue}`, '--count']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(parseInt(result.stdout.toString(), 10), samples.valid[0].length);
	});

	test('Should count amount of SMS', () => {
		const hexValue = samples.valid[0].hex;
		const result = spawnSync('node', [txmsPath, `--encode=${hexValue}`, '--count=sms']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(parseInt(result.stdout.toString(), 10), samples.valid[0].sms);
	});

	test('Should count amount of MMS', () => {
		const hexValue = samples.valid[0].hex;
		const result = spawnSync('node', [txmsPath, `--encode=${hexValue}`, '-ct=mms']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(parseInt(result.stdout.toString(), 10), samples.valid[0].mms);
	});

	test('Should count with piping', () => {
		const hexValue = samples.valid[0].hex;
		const echo = spawnSync('echo', [hexValue]);
		const result = spawnSync('node', [txmsPath, '--encode', '--count'], {
			input: echo.stdout
		});
		assert.strictEqual(result.status, 0);
		assert.strictEqual(parseInt(result.stdout.toString(), 10), samples.valid[0].length);
	});

	test('Should compose SMS link with piping', () => {
		const hexValue = samples.valid[0].hex;
		const echo = spawnSync('echo', [hexValue]);
		const result = spawnSync('node', [txmsPath, '--encode', '-s'], {
			input: echo.stdout
		});
		assert.strictEqual(result.status, 0);
		assert.match(result.stdout.toString(), /^sms:\+12019715152\?body=/);
	});

	test('Should print help text', () => {
		const result = spawnSync('node', [txmsPath, '--help']);
		assert.strictEqual(result.status, 0);
		assert.match(result.stdout.toString(), /^\n\x1B\[1mUsage:\x1B\[0m txms \x1B\[38;5;214m\[options\]\x1B\[0m/);
	});
});
