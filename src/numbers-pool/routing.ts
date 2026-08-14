/*
 * Countries in each group share the same international calling code.
 * Only shared codes are listed because countries with a unique code cannot
 * provide a same-prefix fallback.
 */
export const callingCodeGroups: readonly (readonly string[])[] = [
	['us', 'ca', 'do', 'pr', 'jm', 'tt', 'bs', 'bb', 'lc', 'gd', 'vc', 'ag', 'vi', 'ky', 'bm', 'gu', 'kn', 'dm', 'sx', 'tc', 'vg', 'mp', 'as', 'ai', 'ms'],
	['ru', 'kz'],
	['it', 'va'],
	['gb', 'gg', 'im', 'je'],
	['no', 'sj'],
	['fi', 'ax'],
	['gp', 'mf', 'bl'],
	['bq', 'cw'],
	['au', 'cc', 'cx'],
	['re', 'yt'],
	['ma', 'eh'],
];

/*
 * Organization membership is deliberately data-driven so it can be updated
 * without changing the number-selection algorithm. Countries within each
 * organization are ordered by population, largest first. This makes a number
 * serving a larger population the deterministic fallback when several member
 * countries have numbers available.
 */
export const europeanUnionGroups: readonly (readonly string[])[] = [
	['de', 'fr', 'it', 'es', 'pl', 'ro', 'nl', 'be', 'cz', 'pt', 'se', 'gr', 'hu', 'at', 'bg', 'dk', 'fi', 'sk', 'ie', 'hr', 'lt', 'si', 'lv', 'ee', 'cy', 'lu', 'mt'],
];

// European Free Trade Association members, ordered by population.
export const europeanFreeTradeAssociationGroups: readonly (readonly string[])[] = [
	['ch', 'no', 'is', 'li'],
];

// Non-EU European Economic Area members, ordered by population.
export const europeanEconomicAreaGroups: readonly (readonly string[])[] = [
	['no', 'is', 'li'],
];

// Western Balkans Six, ordered by population.
export const westernBalkansSixGroups: readonly (readonly string[])[] = [
	['rs', 'al', 'ba', 'mk', 'xk', 'me'],
];

export const organizationGroups: readonly (readonly string[])[] = [
	// ASEAN
	['id', 'ph', 'vn', 'th', 'mm', 'my', 'kh', 'la', 'sg', 'tl', 'bn'],
	// Gulf Cooperation Council
	['sa', 'ae', 'om', 'kw', 'qa', 'bh'],
	// Mercosur
	['br', 'ar', 'bo', 'py', 'uy'],
	// South Asian Association for Regional Cooperation
	['in', 'pk', 'bd', 'af', 'lk', 'np', 'bt', 'mv'],
	// Caribbean Community
	['ht', 'jm', 'tt', 'gy', 'sr', 'bz', 'bs', 'bb', 'lc', 'gd', 'vc', 'ag', 'dm', 'kn', 'ms'],
	// African Union
	['ng', 'et', 'eg', 'cd', 'tz', 'za', 'ke', 'ug', 'sd', 'dz', 'ao', 'ma', 'gh', 'mz', 'mg', 'ci', 'cm', 'ne', 'bf', 'ml', 'mw', 'zm', 'td', 'so', 'sn', 'zw', 'gn', 'rw', 'bj', 'bi', 'tn', 'ss', 'tg', 'sl', 'ly', 'cg', 'lr', 'cf', 'mr', 'er', 'na', 'gm', 'bw', 'ga', 'ls', 'gw', 'gq', 'mu', 'sz', 'dj', 'km', 'cv', 'st', 'sc', 'eh'],
];
