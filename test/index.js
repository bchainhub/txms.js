import { test, describe } from 'node:test';
import { spawnSync } from 'child_process';
import assert from 'node:assert/strict';
import path from 'path';
import { JSDOM } from 'jsdom';
import txms from '../dist/index.js';
import { countries } from 'txms.js/numbers';
import samples from './samples.json' with { type: 'json' };
import fs, { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const txmsPath = path.resolve(__dirname, '../bin/txms');
const outputDir = path.resolve(__dirname, './output');

test('Exports browser-safe number pools', () => {
	assert.ok(countries.xcb.global.length > 0);
	assert.ok(countries.xab.global.length > 0);
});

test('Exports the XCB mainnet country numbers', () => {
	assert.deepStrictEqual(countries.xcb.au, ['+61485883792']);
	assert.deepStrictEqual(countries.xcb.gb, ['+447893984933']);
	assert.deepStrictEqual(countries.xcb.nl, ['+3197058019443']);
	assert.deepStrictEqual(countries.xcb.th, ['+66830551102']);
});

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

describe('Number Selection Tests', () => {
	test('Returns the mainnet global number when no country is provided', () => {
		assert.strictEqual(txms.getNumber(), '+12019715152');
	});

	test('Returns a direct country match without case sensitivity', () => {
		assert.strictEqual(txms.getNumber('US'), '+12019715152');
	});

	test('Falls back to a country with the same calling-code prefix', () => {
		assert.strictEqual(txms.getNumber('ca'), '+12019715152');
	});

	test('Falls back to a country in the same organization', () => {
		const originalCzechNumbers = txms.countries.xcb.cz;
		const originalNetherlandsNumbers = txms.countries.xcb.nl;
		delete txms.countries.xcb.nl;
		txms.addCountry(1, 'CZ', ['+420123456789']);
		try {
			assert.strictEqual(txms.getNumber('sk'), '+420123456789');
		} finally {
			if (originalCzechNumbers) {
				txms.countries.xcb.cz = originalCzechNumbers;
			} else {
				delete txms.countries.xcb.cz;
			}
			txms.countries.xcb.nl = originalNetherlandsNumbers;
		}
	});

	test('Prefers the largest available country in an organization', () => {
		const originalGermanNumbers = txms.countries.xcb.de;
		const originalFrenchNumbers = txms.countries.xcb.fr;
		txms.addCountry(1, 'FR', ['+33123456789']);
		txms.addCountry(1, 'DE', ['+49123456789']);
		try {
			assert.strictEqual(txms.getNumber('sk'), '+49123456789');
		} finally {
			if (originalGermanNumbers) {
				txms.countries.xcb.de = originalGermanNumbers;
			} else {
				delete txms.countries.xcb.de;
			}
			if (originalFrenchNumbers) {
				txms.countries.xcb.fr = originalFrenchNumbers;
			} else {
				delete txms.countries.xcb.fr;
			}
		}
	});

	test('Falls back from an EEA country to an available EU number', () => {
		assert.strictEqual(txms.getNumber('is'), '+3197058019443');
	});

	test('Checks EEA numbers before EU numbers', () => {
		const originalNorwegianNumbers = txms.countries.xcb.no;
		txms.addCountry(1, 'NO', ['+4712345678']);
		try {
			assert.strictEqual(txms.getNumber('is'), '+4712345678');
		} finally {
			if (originalNorwegianNumbers) txms.countries.xcb.no = originalNorwegianNumbers;
			else delete txms.countries.xcb.no;
		}
	});

	test('Falls back from an EFTA country through EEA to EU', () => {
		const originalNorwegianNumbers = txms.countries.xcb.no;
		txms.addCountry(1, 'NO', ['+4712345678']);
		try {
			assert.strictEqual(txms.getNumber('ch'), '+4712345678');
		} finally {
			if (originalNorwegianNumbers) txms.countries.xcb.no = originalNorwegianNumbers;
			else delete txms.countries.xcb.no;
		}
		assert.strictEqual(txms.getNumber('ch'), '+3197058019443');
	});

	test('Falls back from a WB6 country through WB6 to EU', () => {
		const originalSerbianNumbers = txms.countries.xcb.rs;
		txms.addCountry(1, 'RS', ['+381123456789']);
		try {
			assert.strictEqual(txms.getNumber('al'), '+381123456789');
		} finally {
			if (originalSerbianNumbers) txms.countries.xcb.rs = originalSerbianNumbers;
			else delete txms.countries.xcb.rs;
		}
		assert.strictEqual(txms.getNumber('al'), '+3197058019443');
	});

	test('Falls back to global or null according to returnNone', () => {
		assert.strictEqual(txms.getNumber('zz'), '+12019715152');
		assert.strictEqual(txms.getNumber('zz', true), null);
	});

	test('Can select from the testnet pool', () => {
		assert.strictEqual(txms.getNumber('us', false, 'devin'), '+12014835939');
	});

	test('Supports XCB and XAB network aliases', () => {
		assert.strictEqual(txms.getNumber('us', false, 'xcb'), '+12019715152');
		assert.strictEqual(txms.getNumber('us', false, 'xab'), '+12014835939');
	});

	test('Supports extensible blockchain pool names', () => {
		txms.addCountry('teth', 'global', ['+441234567890']);
		txms.addCountry('teth', 'gb', ['+441234567890']);
		assert.strictEqual(txms.getNumber('gb', false, 'teth'), '+441234567890');
		delete txms.countries.teth;
	});
});

// SMS/MMS Tests
describe('SMS/MMS Tests', () => {
	test('Parses transaction responses only from configured numbers', () => {
		assert.deepStrictEqual(
			txms.parseSMS('+1 (201) 971-5152', 'OK TxID: 0xabc123'),
			{ success: true, transactionId: '0xabc123' },
		);
		assert.deepStrictEqual(
			txms.parseSMS('+12019715152', 'Failed: Nonce too low.'),
			{ success: false, reason: 'Nonce too low.' },
		);
		assert.strictEqual(txms.parseSMS('+19999999999', 'OK TxID: 0xabc123'), null);
		assert.strictEqual(txms.parseSMS('+12019715152', 'Unrelated message'), null);
	});

	test('Parses responses from numbers added to a custom pool', () => {
		txms.addCountry('custom-sms', 'global', ['+18005550199']);
		assert.deepStrictEqual(
			txms.parseSMS('+18005550199', 'Failed: Custom provider error'),
			{ success: false, reason: 'Custom provider error' },
		);
	});

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
		global.URL.createObjectURL = () => 'blob:txms-test';
		window.HTMLAnchorElement.prototype.click = () => {};

		try {
			const hex = samples.valid[0].hex;

			// Ensure the filename does not conflict with Node.js test
			const filename = await txms.downloadMessage(hex, 'browser-testdata', outputDir);

			// Assert that the filename is correct (no path since it's a browser simulation)
			assert.match(filename, /browser-testdata\.txms\.txt$/);
		} finally {
			// Clean up the global variables after the test is done
			delete global.window;
			delete global.document;
			delete global.Blob;
			delete global.URL;
		}
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

	test('Should return the most suitable number', () => {
		const result = spawnSync('node', [txmsPath, '--getnumber=CA']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(result.stdout.toString(), '+12019715152');
	});

	test('Should return the global number when no country is provided', () => {
		const result = spawnSync('node', [txmsPath, '--getnumber']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(result.stdout.toString(), '+12019715152');
	});

	test('Should select a blockchain number pool', () => {
		const result = spawnSync('node', [txmsPath, '-gn=US', '-n=xab']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(result.stdout.toString(), '+12014835939');
	});

	test('Should return null when the global fallback is disabled', () => {
		const result = spawnSync('node', [txmsPath, '--getnumber=ZZ', '--return-none']);
		assert.strictEqual(result.status, 0);
		assert.strictEqual(result.stdout.toString(), 'null');
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
