//#!node

var String_random = require("./String_random.js").String_random;
//var list = [
//	// JA
//	/(J[A-S][0-9]|7[KLMN][0-9]|8[J-N][0-9])[A-Z]{3}(\/[0-9])?/,
//	// UK
//	/M[01356][A-Z]{3}/,
//	/2E[01][A-Z]{3}/,
//	/G[123456780][A-Z]{2,3}/
//];
//
//var re = list.map(function (i) { return i.source }).join('|');
//
//console.log(String_random(re));

var CALLSIGN_DATA = [
	[/^A[A-L]/i, 'United States', ''],
	[/^A[M-O]/i, 'Spain', ''],
	[/^A[P-S]/i, 'Pakistan', ''],
	[/^A[T-W]/i, 'India', ''],
	[/^AX/i, 'Australia', ''],
	[/^A[Y-Z]/i, 'Argentina', ''],
	[/^A2/i, 'Botswana', ''],
	[/^A3/i, 'Tonga', ''],
	[/^A4/i, 'Oman', ''],
	[/^A5/i, 'Bhutan', ''],
	[/^A6/i, 'United Arab Emirates', ''],
	[/^A7/i, 'Qatar', ''],
	[/^A8/i, 'Liberia', ''],
	[/^A9/i, 'Bahrain', ''],

	[/^B[M-OPQUVWX]/i, 'Taiwan', ''],
	[/^B/i, 'China', ''],

	[/^C[A-E]/i, 'Chile', ''],
	[/^C[F-K]/i, 'Canada', ''],
	[/^C[L-M]/i, 'Cuba', ''],
	[/^CN/i, 'Morocco', ''],
	[/^CO/i, 'Cuba', ''],
	[/^CP/i, 'Bolivia', ''],
	[/^C[Q-U]/i, 'Portugal', ''],
	[/^C[V-X]/i, 'Uruguay', ''],
	[/^C[Y-Z]/i, 'Canada', ''],
	[/^C2/i, 'Nauru', ''],
	[/^C3/i, 'Andorra', ''],
	[/^C4/i, 'Cyprus', ''],
	[/^C5/i, 'The Gambia', ''],
	[/^C6/i, 'Bahamas', ''],
	[/^C7/i, 'World Meteorological Organization', ''],
	[/^C[8-9]/i, 'Mozambique', ''],

	[/^D[A-R]/i, 'Germany', ''],
	[/^D[S-T]/i, 'South Korea', ''],
	[/^D[U-Z]/i, 'Philippines', ''],
	[/^D[2-3]/i, 'Angola', ''],
	[/^D4/i, 'Cape Verde', ''],
	[/^D5/i, 'Liberia', ''],
	[/^D6/i, 'Comoros', ''],
	[/^D[7-9]/i, 'South Korea', ''],

	[/^E[A-H]/i, 'Spain', ''],
	[/^E[I-J]/i, 'Ireland', ''],
	[/^EK/i, 'Armenia', ''],
	[/^EL/i, 'Liberia', ''],
	[/^E[M-O]/i, 'Ukraine', ''],
	[/^E[P-Q]/i, 'Iran', ''],
	[/^ER/i, 'Moldova', ''],
	[/^ES/i, 'Estonia', ''],
	[/^ET/i, 'Ethiopia', ''],
	[/^E[U-W]/i, 'Belarus', ''],
	[/^EX/i, 'Kyrgyzstan', ''],
	[/^EY/i, 'Tajikistan', ''],
	[/^EZ/i, 'Turkmenistan', ''],
	[/^E2/i, 'Thailand', ''],
	[/^E3/i, 'Eritrea', ''],
	[/^E4/i, 'Palestinian Authority', ''],
	[/^E5/i, 'Cook Islands', ''],
	[/^E7/i, 'Bosnia and Herzegovina', ''],

	[/^F/i, 'France', ''],

	[/^G/i, 'United Kingdom', ''],

	[/^HA/i, 'Hungary', ''],
	[/^HB(0|3Y|L)/i, 'Liechtenstein', ''],
	[/^HB/i, 'Switzerland', ''],
	[/^H[C-D]/i, 'Ecuador', ''],
	[/^HE/i, 'Switzerland', ''],
	[/^HF/i, 'Poland', ''],
	[/^HG/i, 'Hungary', ''],
	[/^HH/i, 'Haiti', ''],
	[/^HI/i, 'Dominican Republic', ''],
	[/^H[J-K]/i, 'Colombia', ''],
	[/^HL/i, 'South Korea', ''],
	[/^HM/i, 'North Korea', ''],
	[/^HN/i, 'Iraq', ''],
	[/^H[O-P]/i, 'Panama', ''],
	[/^H[Q-R]/i, 'Honduras', ''],
	[/^HS/i, 'Thailand', ''],
	[/^HT/i, 'Nicaragua', ''],
	[/^HU/i, 'El Salvador', ''],
	[/^HV/i, 'Vatical City', ''],
	[/^H[W-Y]/i, 'France', ''],
	[/^HZ/i, 'Saudi Arabia', ''],
	[/^H2/i, 'Cyprus', ''],
	[/^H3/i, 'Panama', ''],
	[/^H4/i, 'Solomon Island', ''],
	[/^H[6-7]/i, 'Nicaaragua', ''],
	[/^H[8-9]/i, 'Panama', ''],

	[/^I/i, 'Italy', ''],

	[/^JD/i, 'Japan', 'Ogasawara'],
	[/^8[J-N]/i, 'Japan', 'Special Station'],
	[/^(J[A-S]1|[7][KLMN])/i, 'Japan', 'Tokyo, Kanagawa, Chiba, Saitama, Gumma, Tochigi, Ibaraki, Yamanashi'],
	[/^J[A-S]2/i, 'Japan', 'Aichi, Shizuoka, Gifu, Mie'],
	[/^J[A-S]3/i, 'Japan', 'Osaka, Hyogo, Kyoto, Nara, Shiga, Wakayama'],
	[/^J[A-S]4/i, 'Japan', 'Okayama, Hiroshima, Yamaguchi, Tottori, Shimane'],
	[/^J[A-S]5/i, 'Japan', 'Kagawa, Ehime, Kouchi, Tokushima'],
	[/^J[RS]6/i, 'Japan', 'Okinawa'],
	[/^J[A-S]6/i, 'Japan', 'Fukuoka, Shiga, Nagasaki, Kumamoto, Oita, Miyazaki, Kagoshima, Okinawa'],
	[/^J[A-S]7/i, 'Japan', 'Miyagi, Fukushima, Iwate, Aomori, Akita, Yamagata'],
	[/^J[A-S]8/i, 'Japan', 'Hokkaido'],
	[/^J[A-S]9/i, 'Japan', 'Ishikawa, Fukui, Toyama'],
	[/^J[A-S]0/i, 'Japan', 'Nagano, Niigata'],
	[/^J[A-S]/i, 'Japan', ''],

	[/^J[T-V]/i, 'Mongolia', ''],
	[/^J[W-X]/i, 'Norway', ''],
	[/^JY/i, 'Jordan', ''],
	[/^JZ/i, 'Indonesia', ''],
	[/^J2/i, 'Djibouti', ''],
	[/^J3/i, 'Grenada', ''],
	[/^J4/i, 'Greece', ''],
	[/^J5/i, 'Guinea-Bissau', ''],
	[/^J6/i, 'Saint Lucia', ''],
	[/^J7/i, 'Dominica', ''],
	[/^J8/i, 'Saint Vincent and the Grenadines', ''],

	[/^K/i, 'United States', ''],

	[/^L[A-N]/i, 'Norway', ''],
	[/^L[O-W]/i, 'Argentina', ''],
	[/^LX/i, 'Luxembourg', ''],
	[/^LY/i, 'Lithuania', ''],
	[/^LZ/i, 'Bulgaria', ''],
	[/^L[2-9]/i, 'Argentina', ''],

	[/^M/i, 'United Kingdom', ''],

	[/^N/i, 'United States', ''],

	[/^O[A-C]/i, 'Peru', ''],
	[/^OD/i, 'Lebanon', ''],
	[/^OE/i, 'Austria', ''],
	[/^O[F-J]/i, 'Finland', ''],
	[/^O[K-L]/i, 'Czech Republic', ''],
	[/^OM/i, 'Slovakia', ''],
	[/^O[N-T]/i, 'Belgium', ''],
	[/^O[U-Z]/i, 'Denmark', ''],

	[/^P[A-I]/i, 'Netherlands', ''],
	[/^PJ/i, 'Netherlands - Former Netherlands Antilles', ''],
	[/^P[K-O]/i, 'Indonesia', ''],
	[/^P[P-Y]/i, 'Brazil', ''],
	[/^PZ/i, 'Suriname', ''],
	[/^P2/i, 'Papua New Guinea', ''],
	[/^P3/i, 'Cyprus', ''],
	[/^P4/i, 'Aruba', ''],
	[/^P[5-9]/i, 'North Korea', ''],

	[/^R/i, 'Russia', ''],

	[/^S[A-M]/i, 'Sweden', ''],
	[/^S[N-R]/i, 'Poland', ''],
	[/^SS[A-M]/i, 'Egypt', ''],
	[/^(SS[N-Z]|ST[A-Z])/i, 'Sudan', ''],
	[/^SU/i, 'Egypt', ''],
	[/^S[V-Z]/i, 'Greece', ''],
	[/^S[2-3]/i, 'Bangladesh', ''],
	[/^S5/i, 'Slovenia', ''],
	[/^S6/i, 'Singapore', ''],
	[/^S7/i, 'Seychelles', ''],
	[/^S8/i, 'South Africa', ''],
	[/^S9/i, '', ''],

	[/^T[A-C]/i, 'Turkey', ''],
	[/^TD/i, 'Guatemala', ''],
	[/^TE/i, 'Costa Rica', ''],
	[/^TF/i, 'Iceland', ''],
	[/^TG/i, 'Guatemala', ''],
	[/^TH/i, 'France', ''],
	[/^TI/i, 'Costa Rica', ''],
	[/^TJ/i, 'Cameroon', ''],
	[/^TK/i, 'France', ''],
	[/^TL/i, 'Central African Republic', ''],
	[/^TM/i, 'France', ''],
	[/^TN/i, 'Congo', ''],
	[/^T[O-Q]/i, 'France', ''],
	[/^TR/i, 'Gabon', ''],
	[/^TS/i, 'Tunisia', ''],
	[/^TT/i, 'Chad', ''],
	[/^TU/i, 'Cote dlvoire', ''],
	[/^T[V-X]/i, 'France', ''],
	[/^TY/i, 'Benin', ''],
	[/^TZ/i, 'Mali', ''],
	[/^T2/i, 'Tuvalu', ''],
	[/^T3/i, 'Kiribati', ''],
	[/^T4/i, 'Cuba', ''],
	[/^T5/i, 'Somalia', ''],
	[/^T6/i, 'Afghanistan', ''],
	[/^T7/i, 'San Marino', ''],
	[/^T8/i, 'Palau', ''],

	[/^U[A-I]/i, 'Russia', ''],
	[/^U[J-M]/i, 'Uzbekistan', ''],
	[/^U[N-Q]/i, 'Kazakhstan', ''],
	[/^U[R-Z]/i, 'Ukraine', ''],

	[/^V[A-G]/i, 'Canada', ''],
	[/^V[H-N]/i, 'Australia', ''],
	[/^VO/i, 'Canada', ''],
	[/^V[P-Q]/i, 'United Kingdom', ''],
	[/^VR/i, 'Hong Kong', ''],
	[/^VS/i, 'United Kingdom', ''],
	[/^V[T-W]/i, 'India', ''],
	[/^V[X-Y]/i, 'Canada', ''],
	[/^VZ/i, 'Australia', ''],
	[/^V2/i, 'Antigua and Barbuda', ''],
	[/^V3/i, 'Belize', ''],
	[/^V4/i, 'Saint Kitts and Nevis', ''],
	[/^V5/i, 'Namibia', ''],
	[/^V6/i, 'Micronesia, Federated States of', ''],
	[/^V7/i, 'Marshal Islands', ''],
	[/^V8/i, 'Brunei', ''],

	[/^W/i, 'United States', ''],

	[/^X[A-I]/i, 'Mexico', ''],
	[/^X[J-O]/i, 'Canada', ''],
	[/^XP/i, 'Denmark', ''],
	[/^X[Q-R]/i, 'Chile', ''],
	[/^XS/i, 'People\' Republic of China', ''],
	[/^XT/i, 'Burkina Faso', ''],
	[/^XU/i, 'Cambodia', ''],
	[/^XV/i, 'Vietnam', ''],
	[/^XW/i, 'Laos', ''],
	[/^XX/i, 'Macao', ''],
	[/^X[Y-Z]/i, 'Burma', ''],

	[/^YA/i, 'Afghanistan', ''],
	[/^Y[B-H]/i, 'Indonesia', ''],
	[/^YI/i, 'Iraq', ''],
	[/^YJ/i, 'Vanuatu', ''],
	[/^YK/i, 'Syria', ''],
	[/^YL/i, 'Latvia', ''],
	[/^YM/i, 'Turkey', ''],
	[/^YN/i, 'Nicaragua', ''],
	[/^Y[O-R]/i, 'Romania', ''],
	[/^YS/i, 'El Salvador', ''],
	[/^Y[T-U]/i, 'Serbia', ''],
	[/^Y[V-Y]/i, 'Venezuela', ''],
	[/^Y[2-9]/i, 'Germany', ''],

	[/^ZA/i, 'Albania', ''],
	[/^Z[B-J]/i, 'United Kingdom', ''],
	[/^Z[K-M]/i, 'New Zealand', ''],
	[/^Z[N-O]/i, 'United Kingdom', ''],
	[/^ZP/i, 'Paraguay', ''],
	[/^ZQ/i, 'United Kingdom', ''],
	[/^Z[R-U]/i, 'South Africa', ''],
	[/^Z[V-Z]/i, 'Brazil', ''],
	[/^Z2/i, 'Zimbabwe', ''],
	[/^Z3/i, 'Republic of Macedonia', ''],
	[/^Z8/i, 'South Sudan', ''],

	[/^2/i, 'United Kingdom', ''],

	[/^3A/i, 'Monaco', ''],
	[/^3B/i, 'Mauritius', ''],
	[/^3C/i, 'Equatorial Guinea', ''],
	[/^3[A-M]/i, 'Swaziland', ''],
	[/^3[N-Z]/i, 'Fiji', ''],
	[/^3[E-F]/i, 'Panama', ''],
	[/^3G/i, 'Chile', ''],
	[/^3[H-U]/i, 'People\'s Republic of China', ''],
	[/^3V/i, 'Tunisia', ''],
	[/^3W/i, 'Vietnam', ''],
	[/^3X/i, 'Guinea', ''],
	[/^3Y/i, 'Norway', ''],
	[/^3Z/i, 'Poland', ''],

	[/^4[A-C]/i, 'Mexico', ''],
	[/^4[D-I]/i, 'Philippines', ''],
	[/^4[J-K]/i, 'Azerbaijan', ''],
	[/^4L/i, 'Georgia', ''],
	[/^4M/i, 'Venezuela', ''],
	[/^4O/i, 'Montenegro', ''],
	[/^4[P-S]/i, 'Sri Lanka', ''],
	[/^4T/i, 'Peru', ''],
	[/^4U/i, 'United Nations', ''],
	[/^4V/i, 'Haiti', ''],
	[/^4W/i, 'East Timor', ''],
	[/^4X/i, 'Israel', ''],
	[/^4Y/i, 'International Civil Aviation Organization', ''],
	[/^4Z/i, 'Israel', ''],

	[/^5A/i, 'Libya', ''],
	[/^5B/i, 'Cyprus', ''],
	[/^5[C-G]/i, 'Morocco', ''],
	[/^5[H-I]/i, 'Tanzania', ''],
	[/^5[J-K]/i, 'Colombia', ''],
	[/^5[L-M]/i, 'Liberia', ''],
	[/^5[N-O]/i, 'Nigeria', ''],
	[/^5[P-Q]/i, 'Denmark', ''],
	[/^5[R-S]/i, 'Madagascar', ''],
	[/^5T/i, 'Mauritania', ''],
	[/^5U/i, 'Niger', ''],
	[/^5V/i, 'Togo', ''],
	[/^5W/i, 'Western Samoa', ''],
	[/^5X/i, 'Uganda', ''],
	[/^5[Y-Z]/i, 'Kenya', ''],

	[/^6[A-B]/i, 'Egypt', ''],
	[/^6C/i, 'Syria', ''],
	[/^6[D-J]/i, 'Mexico', ''],
	[/^6[K-N]/i, 'South Korea', ''],
	[/^6O/i, 'Somalia', ''],
	[/^6[P-S]/i, 'Pakistan', ''],
	[/^6[T-U]/i, 'Sudan', ''],
	[/^6[V-W]/i, 'Senegal', ''],
	[/^6X/i, 'Madagascar', ''],
	[/^6Y/i, 'Jamaica', ''],
	[/^6Z/i, 'Liberia', ''],

	[/^7[A-I]/i, 'Indonesia', ''],
	[/^7[J-N]/i, 'Japan', ''],
	[/^7O/i, 'Yemen', ''],
	[/^7P/i, 'Lesotho', ''],
	[/^7Q/i, 'Malawi', ''],
	[/^7R/i, 'Algeria', ''],
	[/^7S/i, 'Sweden', ''],
	[/^7[T-Y]/i, 'Algeria', ''],
	[/^7Z/i, 'Saudi Arabia', ''],

	[/^8[A-I]/i, 'Indonesia', ''],
	[/^8[J-N]/i, 'Japan', ''],
	[/^8O/i, 'Botswana', ''],
	[/^8P/i, 'Barbados', ''],
	[/^8Q/i, 'Maldives', ''],
	[/^8R/i, 'Guyana', ''],
	[/^8S/i, 'Sweden', ''],
	[/^8[T-Y]/i, 'India', ''],
	[/^8Z/i, 'Saudi Arabia', ''],

	[/^9A/i, 'Croatia', ''],
	[/^9[B-D]/i, 'Iran', ''],
	[/^9[E-F]/i, 'Ethiopia', ''],
	[/^9G/i, 'Ghana', ''],
	[/^9H/i, 'Malta', ''],
	[/^9[I-J]/i, 'Zambia', ''],
	[/^9K/i, 'Kuwait', ''],
	[/^9L/i, 'Sierra Leone', ''],
	[/^9M/i, 'Malaysia', ''],
	[/^9N/i, 'Nepal', ''],
	[/^9[O-T]/i, 'Democratic Republic of the Congo', ''],
	[/^9U/i, 'Burundi', ''],
	[/^9V/i, 'Singapore', ''],
	[/^9W/i, 'Malaysia', ''],
	[/^9X/i, 'Rwanda', ''],
	[/^9[Y-Z]/i, 'Trinidad and Tobago', '']
];

var prefix = CALLSIGN_DATA[Math.floor(CALLSIGN_DATA.length * Math.random())];
var re = prefix[0].source + '[0-9][A-Z]{2,3}';

var isPortable = Math.random() < 0.3;
isPortable = 1;
if (isPortable) {
	if (0) {
		re = '(' + CALLSIGN_DATA.filter(function (i) { return i[1] !== prefix[1] && !i[2] }).map(function (i) { return i[0].source }).join('|') + ')/' + re;
	} else {
		re = re + '/([0-9]|(' + CALLSIGN_DATA.filter(function (i) { return i[1] === prefix[1] && !i[2] }).map(function (i) { return i[0].source }).join('|') + ')[0-9])';
	}
}

console.log(String_random(re));
