/*
 * Countries in each group share the same international calling code.
 * Only shared codes are listed because countries with a unique code cannot
 * provide a same-prefix fallback.
 */
export const callingCodeGroups: readonly (readonly string[])[] = [
	['ag', 'ai', 'as', 'bb', 'bm', 'bs', 'ca', 'dm', 'do', 'gd', 'gu', 'jm', 'kn', 'ky', 'lc', 'mp', 'ms', 'pr', 'sx', 'tc', 'tt', 'us', 'vc', 'vg', 'vi'],
	['kz', 'ru'],
	['it', 'va'],
	['gb', 'gg', 'im', 'je'],
	['no', 'sj'],
	['ax', 'fi'],
	['bl', 'gp', 'mf'],
	['bq', 'cw'],
	['au', 'cc', 'cx'],
	['re', 'yt'],
	['eh', 'ma'],
];

/*
 * Organization membership is deliberately data-driven so it can be updated
 * without changing the number-selection algorithm. Groups are checked in the
 * order below and countries in pool order win within a matching group.
 */
export const organizationGroups: readonly (readonly string[])[] = [
	// European Union
	['at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'es', 'se'],
	// ASEAN
	['bn', 'kh', 'id', 'la', 'my', 'mm', 'ph', 'sg', 'th', 'tl', 'vn'],
	// Gulf Cooperation Council
	['bh', 'kw', 'om', 'qa', 'sa', 'ae'],
	// Mercosur
	['ar', 'bo', 'br', 'py', 'uy'],
	// South Asian Association for Regional Cooperation
	['af', 'bd', 'bt', 'in', 'mv', 'np', 'pk', 'lk'],
	// Caribbean Community
	['ag', 'bs', 'bb', 'bz', 'dm', 'gd', 'gy', 'ht', 'jm', 'ms', 'kn', 'lc', 'vc', 'sr', 'tt'],
	// African Union
	['dz', 'ao', 'bj', 'bw', 'bf', 'bi', 'cv', 'cm', 'cf', 'td', 'km', 'cg', 'cd', 'ci', 'dj', 'eg', 'gq', 'er', 'sz', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'rw', 'eh', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'ss', 'sd', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw'],
];
