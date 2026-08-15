import { addAlias, addCountry, aliases, countries, getNetworkKey, getNumber } from './numbers.js';

export type SMSParseResult =
	| { success: true; transactionId: string }
	| { success: false; reason: string };

export interface Transport {
	aliases: Record<string, string>;
	countries: Record<string, { [key: string]: string[] }>;
	addAlias(name: string, network: number | string): void;
	addCountry(network: number | string, countryCode: string, phoneNumbers: string[]): void;
	encode(hex: string): string;
	decode(data: string): string;
	count(hex: string, type?: 'sms' | 'mms' | true): number;
	getEndpoint(network?: number | string, countriesList?: string | Array<string>): { [key: string]: Array<string> };
	getNumber(iso3166A2?: string, returnNone?: boolean, network?: number | string): string | null;
	parseSMS(number: string | number, text: string): SMSParseResult | null;
	sms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string;
	mms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string;
	generateMessageUri(type: 'sms' | 'mms', number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string;
	downloadMessage(hex: string | string[], optionalFilename?: string, optionalPath?: string): Promise<string>;
}

export interface Error extends globalThis.Error {
	code?: number;
}

function slugify(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

const txms: Transport = {
	aliases,
	countries,

	addAlias(name: string, network: number | string): void {
		addAlias(name, network);
	},

	addCountry(network: number | string, countryCode: string, phoneNumbers: string[]): void {
		addCountry(network, countryCode, phoneNumbers);
	},

	encode(hex: string): string {
		let data = '';
		if (hex.substring(0, 2).toLowerCase() === '0x') {
			hex = hex.substring(2);
		}
		const hextest = /^[0-9a-fA-F]+$/;
		if (!hextest.test(hex)) {
			const errorHex = new Error('Not a hex format');
			(errorHex as Error).code = 415;
			throw errorHex;
		}
		if (hex.length % 4 !== 0) {
			hex = '0'.repeat(4 - (hex.length % 4)) + hex;
		}
		for (let j = 0; j < hex.length; j += 4) {
			let hexchar = hex.substring(j, j + 4);
			let character = String.fromCharCode(parseInt(hexchar, 16));
			data += character.replace(/\p{C}|\p{Z}|\ufffd|\u007e/u, '~' + String.fromCharCode(parseInt('01' + hexchar.slice(0, 2), 16)) + String.fromCharCode(parseInt('01' + hexchar.slice(2, 4), 16)));
		}
		return data;
	},

	decode(data: string): string {
		let hex = '';
		let l;
		for (l = 0; l < data.length; l++) {
			if (data[l] === '~') {
				hex += ('00' + data.charCodeAt(l + 1).toString(16)).slice(-2) + ('00' + data.charCodeAt(l + 2).toString(16)).slice(-2);
				l = l + 2;
			} else {
				hex += ('0000' + data.charCodeAt(l).toString(16)).slice(-4);
			}
		}
		return '0x' + hex.replace(/^0+/, '');
	},

	count(hex: string, type?: 'sms' | 'mms' | true): number {
		// Encode the hex string to the message
		const message = this.encode(hex);

		// If type is not provided, return the length of the message in characters
		if (!type) {
			return message.length;
		}

		// SMS calculation logic
		if (type === 'sms') {
			// UTF-16 encoding, so the character limit is 70 characters for a single SMS
			const singleSmsLimit = 70;
			const multipartSmsLimit = 67;  // Character limit per SMS in a concatenated message

			if (message.length <= singleSmsLimit) {
				// Fits within a single SMS
				return 1;
			} else {
				// Calculate the number of segments required for a multipart SMS
				return Math.ceil(message.length / multipartSmsLimit);
			}
		}

		// MMS calculation logic
		if (type === 'mms') {
			// Assume a typical size limit of 300 KB for MMS (this may vary by carrier)
			const mmsSizeLimit = 300 * 1024; // 300 KB in bytes
			// Estimate size of the message in bytes (UTF-16, so each character is 2 bytes)
			const messageSizeInBytes = message.length * 2;

			if (messageSizeInBytes <= mmsSizeLimit) {
				return 1;
			} else {
				return Math.ceil(messageSizeInBytes / mmsSizeLimit);
			}
		}

		return message.length;
	},

	getEndpoint(network?: number | string, countriesList?: string | Array<string>): { [key: string]: Array<string> } {
		let requestedList: Array<string> | undefined;
		if (countriesList instanceof Array) {
			requestedList = countriesList;
		} else if (typeof countriesList === 'string') {
			requestedList = [countriesList];
		}

		const networkKey = getNetworkKey(network);

		if (!requestedList) {
			return countries[networkKey];
		} else {
			let endpoints: { [key: string]: string[] } = {};
			for (let n = 0; n < requestedList.length; n++) {
				const countryCode = requestedList[n].toLowerCase();
				if (countries[networkKey] && countries[networkKey][countryCode]) {
					endpoints[countryCode] = countries[networkKey][countryCode];
				}
			}
			return endpoints;
		}
	},

	getNumber(iso3166A2?: string, returnNone: boolean = false, network?: number | string): string | null {
		return getNumber(iso3166A2, returnNone, network);
	},

	parseSMS(number: string | number, text: string): SMSParseResult | null {
		const normalizedNumber = String(number).replace(/\D/g, '');
		if (!normalizedNumber || !Object.values(countries).some(pool =>
			Object.values(pool).some(phoneNumbers =>
				phoneNumbers.some(phoneNumber => phoneNumber.replace(/\D/g, '') === normalizedNumber)))) {
			return null;
		}

		const successMatch = /^OK\s+TxID:\s*(\S+)\s*$/.exec(text);
		if (successMatch) {
			return { success: true, transactionId: successMatch[1] };
		}

		const failureMatch = /^Failed:\s*(.+?)\s*$/.exec(text);
		if (failureMatch) {
			return { success: false, reason: failureMatch[1] };
		}

		return null;
	},

	sms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage: boolean = true, platform: string = 'global'): string {
		return this.generateMessageUri('sms', number, message, network, encodeMessage, platform);
	},

	mms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage: boolean = true, platform: string = 'global'): string {
		return this.generateMessageUri('mms', number, message, network, encodeMessage, platform);
	},

	generateMessageUri(type: 'sms' | 'mms', number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage: boolean = true, platform: string = 'global'): string {
		let endpoint: string | undefined;
		const networkKey = getNetworkKey(network);

		if (number === true) {
			endpoint = countries[networkKey].global[0];
		} else if (typeof number === 'number') {
			endpoint = `+${number}`;
		} else if (typeof number === 'string') {
			if (/^\+\d+$/.test(number)) {
				endpoint = number;
			} else {
				throw new Error('Invalid number format');
			}
		} else if (Array.isArray(number)) {
			const validNumbers = number.map(num => {
				if (typeof num === 'number') {
					return `+${num}`;
				} else if (typeof num === 'string' && /^\+\d+$/.test(num)) {
					return num;
				} else {
					throw new Error(`Invalid number format: ${num}`);
				}
			});
			endpoint = validNumbers.join(',');
		}

		let encodedMessage = '';
		if (message) {
			if (encodeMessage) {
				encodedMessage = encodeURIComponent(this.encode(message));
			} else {
				encodedMessage = encodeURIComponent(message);
			}
		}

		return endpoint ? `${type}:${endpoint}${encodedMessage ? `${platform === 'ios' ? '&' : '?'}body=${encodedMessage}` : ''}` : `${type}:${platform === 'ios' ? '&' : '?'}body=${encodedMessage}`;
	},

	async downloadMessage(hex: string | string[], optionalFilename?: string, optionalPath?: string): Promise<string> {
		// If hex is an array, join the encoded messages with newlines
		const encodedMessage = Array.isArray(hex)
			? hex.map(h => this.encode(h)).join('\n')
			: this.encode(hex);

		let filename: string;
		// Use the first hex string for filename derivation, regardless of array or string input
		const cleanedHex = (Array.isArray(hex) ? hex[0] : hex).toLowerCase().startsWith('0x')
			? (Array.isArray(hex) ? hex[0] : hex).slice(2)
			: (Array.isArray(hex) ? hex[0] : hex);
		if (cleanedHex.length < 12) {
			filename = cleanedHex;
		} else {
			const first6 = cleanedHex.slice(0, 6);
			const last6 = cleanedHex.slice(-6);
			filename = `${first6}${last6}`;
		}

		// If the input is an array with more than one item and no optional filename, append .batch
		if (Array.isArray(hex) && hex.length > 1 && !optionalFilename) {
			filename = `${filename}.batch`;
		}

		// Final filename composition
		if (optionalFilename) {
			filename = `${slugify(optionalFilename)}.txms.txt`;
		} else {
			filename = `${filename}.txms.txt`;
		}

		/* eslint-disable no-undef */
		if (typeof window !== 'undefined' && typeof Blob !== 'undefined' && typeof document !== 'undefined') {
			// Browser environment
			// If an optional path is provided, prepend it to the filename (simulate a path structure)
			const fullFilename = optionalPath ? `${optionalPath}/${filename}` : filename;

			const blob = new Blob([encodedMessage], { type: 'text/plain;charset=utf-16' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = fullFilename;
			document.body.appendChild(link);  // Append link to body
			link.click();                     // Trigger download
			document.body.removeChild(link);  // Clean up
			return fullFilename;  // Return the "path/filename" (simulated for the browser)
		} else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
			/*
			 * Keep the Node-only filesystem implementation behind an opaque dynamic
			 * import. Browser and edge bundlers can then consume the root `txms.js`
			 * entry without attempting to resolve Node's `fs` and `path` modules.
			 */
			const nodeWriterModule = './node-writer.js';
			const { writeMessageFile } = await import(nodeWriterModule);
			return writeMessageFile(filename, encodedMessage, optionalPath);
		} else {
			throw new Error('Unsupported environment');
		}
		/* eslint-enable no-undef */
	}
};

export default txms;
