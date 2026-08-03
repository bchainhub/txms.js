import xcb from './numbers-pool/xcb.js';
import xab from './numbers-pool/xab.js';
import { callingCodeGroups, organizationGroups } from './numbers-pool/routing.js';

export const aliases: Record<string, string> = {
	'1': 'xcb',
	'mainnet': 'xcb',
	'xcb': 'xcb',
	'3': 'xab',
	'devin': 'xab',
	'xab': 'xab',
};

export const countries: Record<string, { [key: string]: string[] }> = {
	'xcb': xcb,
	'xab': xab,
};

export function addAlias(name: string, network: number | string): void {
	aliases[name.toLowerCase()] = getNetworkKey(network);
}

export function addCountry(network: number | string, countryCode: string, phoneNumbers: string[]): void {
	const networkKey = getNetworkKey(network);
	if (!countries[networkKey]) {
		countries[networkKey] = {};
	}
	countries[networkKey][countryCode.toLowerCase()] = phoneNumbers;
}

export function getNetworkKey(network?: number | string): string {
	if (network === undefined) {
		return 'xcb';
	}
	const normalizedNetwork = network.toString().toLowerCase();
	return aliases[normalizedNetwork] ?? normalizedNetwork;
}

function getRelatedNumber(pool: { [key: string]: string[] }, countryCode: string, groups: readonly (readonly string[])[]): string | null {
	const group = groups.find(countryGroup => countryGroup.includes(countryCode));
	if (!group) {
		return null;
	}

	for (const availableCountry of group) {
		if (availableCountry !== countryCode && pool[availableCountry]?.[0]) {
			return pool[availableCountry][0];
		}
	}
	return null;
}

export function getNumber(iso3166A2?: string, returnNone: boolean = false, network?: number | string): string | null {
	const pool = countries[getNetworkKey(network)];
	if (!pool) {
		return null;
	}

	if (!iso3166A2) {
		return pool.global?.[0] ?? null;
	}

	const countryCode = iso3166A2.trim().toLowerCase() === 'uk' ? 'gb' : iso3166A2.trim().toLowerCase();
	const directNumber = pool[countryCode]?.[0];
	if (directNumber) {
		return directNumber;
	}

	const prefixNumber = getRelatedNumber(pool, countryCode, callingCodeGroups);
	if (prefixNumber) {
		return prefixNumber;
	}

	const organizationNumber = getRelatedNumber(pool, countryCode, organizationGroups);
	if (organizationNumber) {
		return organizationNumber;
	}

	return returnNone ? null : pool.global?.[0] ?? null;
}
