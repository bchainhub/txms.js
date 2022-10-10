# TXMS.js

This is Beta `β` version of the project. Please, report all the bugs in [issues](/issues).

## How does it work?

This tool is using for conversion encoding UTF-16 Big Endian (UTF-16BE).

### What is UTF-16 and (Big, Little) Endian?

UTF-16 is a character encoding capable of encoding all 1,112,064 valid code points of Unicode.

Big-endian is an order in which the "big end" (most significant value in the sequence) is stored first, at the lowest storage address.

Little-endian is an order in which the "little end" (least significant value in the sequence) is stored first.

Byte Index | 0 | 1
--- | --- | ---
Big-Endian | 12 | 34
Little-Endian | 34 | 12

## Practical use

### Negative №1

SMS can encode 160 7-bit characters into 140 bytes, but even that not all characters represent 1 character. Certain characters in GSM 03.38 require an escape character, such as: `|, ^, {, }, €, [, ~, ]` and `\`.

In Unicode SMS we are limited to 70 characters (or 67 in multipart sms).

### Negative №2

Most of providers are not accepting `invisible control characters and unused code points`; `any kind of invisible separator` and replacing they are them with character `�` `U+FFFD`.

This will make transaction invalid.

### Positive №1

Modern providers and phones are supporting UCS-2 (is a now defunct character encoding), which is replaced with UTF-16 Big Endian (UTF-16BE).

### Positive №2

To avoid non-acceptance of certain characters, we are prefixing them with tilde `~` character ([007E](https://codepoints.net/U+007E)) following the 2+2 hex digits converted to Unicode characters.

Both 2 hex digits will get `01` prefix.

For example:
1. We are getting hex `09CA`, which is not valid Unicode character in [Bengali](https://codepoints.net/bengali).
1. We are splitting it into two parts 2+2.
1. First half we are prefixing with `01` and we are getting `0109`, which will be converted to [ĉ](https://codepoints.net/U+0109).
1. Second part we are prefixing with `01` and we are getting `01CA`, which will be converted to [Ǌ](https://codepoints.net/U+01CA).
1. Converted characters we are prefixing with `~` tilde.
1. As result we are getting `~ĉǊ` string.

### Result

Based on this findings you should be able to send CORE transaction (or any other) encoded by UTF-16BE in the modern networks and phones with SMS.

Notes:
- In some cases you need to swap buffer from Little Endian to Big endian.
- Base62 is one of the best tool to convert UTF-16 characters into ASCII.
- We are excluding characters from UTF-16 Basic Multilingual Plane:
   - tilde `~` character ([007E](https://codepoints.net/U+007E))
   - replacement `�` character ([FFFD](https://codepoints.net/U+FFFD))
   - Control, Format, Unassigned, Private use, Surrogate characters
   - Space characters - Line separator, Paragraph separator, Space separator

### Expectations

Core Blockchain transaction should be packed into 2-3 SMS messages.

#### Sending TXMS vs HEX

TXMS is shorter but dependent on UTF-16, which makes it with plain HEX comparison slightly better in SMS usecase.

But there is big difference about length of message.

In native systems, which are supporting UTF-16 you will get always best or competitive results.

## Installation

### Using NPM

```sh
npm i txms.js
```

### Using Yarn

```sh
yarn add txms.js
```

## Use

### Importing

```js
import txms from '@cryptohub/txms.js';
let encoded = txms.encode(hex);
let decoded = txms.decode(string);
```

or

```js
var txms = require('@cryptohub/txms.js');
var encoded = txms.encode(hex);
var decoded = txms.decode(string);
```

### Functions

- `encode(hex: string): string` — Convert hex transaction into UTF-16BE.
- `decode(data: string): string` — Convert UTF-16BE into hex transaction.
- `getEndpoint(network?: number | string, countriesList?: string | Array<string>): { [key: string]: Array<string> }` — Get object of SMS endpoints (phone numbers) per country.

### Parameters

- `hex` = hexadecimal representation of transaction without 0x prefix. (Even prefix is inserted, it is cutting it.)
- `data` = UTF-16BE data
- `network` (default: 1) = ID of Core Blockchain network or it's name (such as: mainnet, devin).
- `countriesList` (default: all) = ISO 3166 Alpha-2 country/ies code/s.

## Tests

Unit tests are included and can be executed with the command `yarn test` or `npm run test`.

GitHub is automatically testing the commits into the source code.

Feel free to contribute and extend our test cases.

### Test wallets

We are using the Core Blockchain - Devin (testnet) wallets for tests.

## Additional services

We are able send SMS back with status and we are streaming success/fail statuses into the database.

If you need API endpoint or receiving SMS back to sender's number, feel free to contact us.

## SMS endpoint

You can use our defined endpoints or create your own service.

To deliver the best results we are checking the online status of the service.

Follow the steps:
- Test your service.
- Please, return the [200 "OK"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) status code on the `yoururl.tld/ping` endpoint.
- Raise the [Issue](/issues) with:
   - Crypto, network operating;
   - Service phone number;
   - Region (ISO 3166 Alpha-2 country/ies code/s);
   - URL;
   - Declare, that you are not collecting the personal data;
   - Free or paid(membership) service.

## Security

This is not encrypting tool, but conversion. All people can read your signed transaction, but don't worry they can do it in any case on Blockchain.

You should be basically safe. Don't stream your private key or any sensitive data that you want to protect.

## Contributions

Feel free to contribute in any way.

We appreciate:
- Fork [this repository](/fork)
- Open [pull request](/pulls)
- Create your own [SMS endpoint](#sms-endpoint)
- Send us some Øres / ₡ores: [cb7147879011ea207df5b35a24ca6f0859dcfb145999](https://blockindex.net/address/cb7147879011ea207df5b35a24ca6f0859dcfb145999)
- Star this repository

## Author

CRYPTO ▪ HUB (@cryptohub-digital) // @raisty

## Epigram

> 「Cryptoni Confidimus」

## License

Licensed under the [CORE](LICENSE) License.
