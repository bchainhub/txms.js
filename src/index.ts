export interface Transport {
	encode(hex: string): string;
	decode(data: string): string;
	getEndpoint(network?: number | string, countriesList?: string | Array<string>): { [key: string]: Array<string> };
	sms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string;
	mms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string;
	generateMessageUri(type: 'sms' | 'mms', number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string;
}

export interface Error extends globalThis.Error {
	code?: number;
}

export const aliases: { [key: string]: number } = {
	'mainnet': 1,
	'devin': 3,
};

export const countries: Record<string, { [key: string]: string[] }> = {
	'1': {
		'global': ['+12019715152'],
		'us': ['+12019715152'],
	},
	'3': {
		'global': ['+12014835939'],
		'us': ['+12014835939'],
	},
};

export function addAlias(name: string, id: number): void {
	aliases[name] = id;
}

export function addCountry(networkId: number | string, countryCode: string, phoneNumbers: string[]): void {
	const networkKey = networkId.toString();
	if (!countries[networkKey]) {
		countries[networkKey] = {};
	}
	countries[networkKey][countryCode] = phoneNumbers;
}

const txms: Transport = {
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
		while (hex.length % 4 !== 0) {
			hex = '0' + hex;
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
				hex += ('000' + data.charCodeAt(l + 1).toString(16)).slice(-2) + ('000' + data.charCodeAt(l + 2).toString(16)).slice(-2);
				l = l + 2;
			} else {
				hex += ((l === 0 ? '' : '000') + data.charCodeAt(l).toString(16)).slice(-4);
			}
		}
		return '0x' + hex;
	},

	getEndpoint(network?: number | string, countriesList?: string | Array<string>): { [key: string]: Array<string> } {
		let requestedList: Array<string> | undefined;
		if (countriesList instanceof Array) {
			requestedList = countriesList;
		} else if (typeof countriesList === 'string') {
			requestedList = [countriesList];
		}

		let netw: number;
		if (!network) {
			netw = 1;
		} else if (typeof network === 'string') {
			netw = aliases[network.toLowerCase()];
		} else {
			netw = network;
		}

		if (!requestedList) {
			return countries[netw];
		} else {
			let endpoints: { [key: string]: string[] } = {};
			for (let n = 0; n < requestedList.length; n++) {
				endpoints[requestedList[n]] = countries[netw][requestedList[n]];
			}
			return endpoints;
		}
	},

	sms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage: boolean = true, platform: string = 'global'): string {
		return this.generateMessageUri('sms', number, message, network, encodeMessage, platform);
	},

	mms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage: boolean = true, platform: string = 'global'): string {
		return this.generateMessageUri('mms', number, message, network, encodeMessage, platform);
	},

	generateMessageUri(type: 'sms' | 'mms', number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage: boolean = true, platform: string = 'global'): string {
		let endpoint: string | undefined;
		let netw: number;
		if (!network || network === 1 || network === 'mainnet') {
			netw = 1;
		} else if (typeof network === 'string') {
			netw = aliases[network.toLowerCase()];
		} else {
			netw = network;
		}

		if (number === true) {
			endpoint = countries[netw].global[0];
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
	}
};

export default txms;
