# TXMS.js

This is the Beta `β` version of the project. Please, report all the bugs in [issues](/issues).

## List of providers

You can choose most reliable provider for you and your region.

[Open the TXMS Status page](https://txms.info)

## How does it work?

This tool using for conversion encoding UTF-16 Big Endian (UTF-16BE).

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

In Unicode SMS we are limited to 70 characters (or 67 in multipart SMS).

### Negative №2

Most of providers are not accepting `invisible control characters and unused code points`; `any kind of invisible separator` and they are replacing them with the character `�` `U+FFFD`.

This will make the transaction invalid.

### Positive №1

Modern providers and phones are supporting UCS-2 (a now-defunct character encoding), which is replaced with UTF-16 Big Endian (UTF-16BE).

### Positive №2

To avoid non-acceptance of certain characters, we are prefixing them with a tilde `~` character ([007E](https://codepoints.net/U+007E)) following the 2+2 hex digits converted to Unicode characters.

Both 2 hex digits will get the `01` prefix.

For example:
1. We are getting hex `09CA`, which is not a valid Unicode character in [Bengali](https://codepoints.net/bengali).
1. We are splitting it into two parts 2+2.
1. First half we are prefixing with `01` and we are getting `0109`, which will be converted to [ĉ](https://codepoints.net/U+0109).
1. Second part we are prefixing with `01` and we are getting `01CA`, which will be converted to [Ǌ](https://codepoints.net/U+01CA).
1. Converted characters we are prefixing with `~` tilde.
1. As a result we are getting `~ĉǊ` string.

### Splitting Tx

For dividing the transactions in the data feed you must use [Line feed](https://codepoints.net/U+000A) character. In script normally referred to as `\n` or `\r` depending on the OS.

### Result

Based on these findings you should be able to send CORE transactions (or any other) encoded by UTF-16BE in modern networks and phones with SMS.

Notes:
- In some cases, you need to swap the buffer from Little Endian to Big endian.
- Base62 is one of the best tools to convert UTF-16 characters into ASCII.
- We are excluding characters from UTF-16 Basic Multilingual Plane:
   - tilde `~` character ([007E](https://codepoints.net/U+007E))
   - replacement `�` character ([FFFD](https://codepoints.net/U+FFFD))
   - Control, Format, Unassigned, Private use, Surrogate characters
   - Space characters - Line separator, Paragraph separator, Space separator

### Expectations

Core Blockchain transactions should be packed into 2-3 SMS messages.

#### Sending TXMS vs HEX

TXMS is shorter but dependent on UTF-16, which makes it with plain HEX comparison slightly better in the SMS use case.

But there is a big difference in the length of the message.

In native systems, which are supporting UTF-16 you will get always the best or most competitive results.

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
import txms from 'txms.js';
let encoded = txms.encode(hex);
let decoded = txms.decode(string);
```

or

```js
var txms = require('txms.js');
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
- `network` (default: 1) = ID of Core Blockchain network or its name (such as: mainnet, devin).
- `countriesList` (default: all) = ISO 3166 Alpha-2 country/ies code/s.

## Tests

Unit tests are included and can be executed with the command `yarn test` or `npm run test`.

GitHub is automatically testing the commits into the source code.

Feel free to contribute and extend our test cases.

### Test wallets

We are using the Core Blockchain - Devin (testnet) wallets for tests.

## Additional services

We can send an SMS back with the status and we are streaming success/fail statuses into the database.

If you need an API endpoint or receive an SMS back to the sender's number, feel free to contact us.

## SMS endpoint

You can use our defined endpoints or create your service.

To deliver the best results we are checking the online status of the service with the [uptime checker](https://github.com/gatestatus/txms).

Follow the steps:
- Test your service.
- Please, return the [200 "OK"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) status code on the `yoururl.tld/ping` endpoint.
- Raise the [Listing request](https://github.com/gatestatus/txms/issues/new/choose).

## Security

This is not encrypting tool, but a conversion. All people can read your signed transaction, but don't worry they can do it in any case on Blockchain.

You should be safe. Don't stream your private key or any sensitive data that you want to protect.

## Contributions

Feel free to contribute in any way.

We appreciate:
- Fork [this repository](/fork)
- Open [pull request](/pulls)
- Create your own [SMS endpoint](#sms-endpoint)
- Send us some Øres / ₡ores: [cb7147879011ea207df5b35a24ca6f0859dcfb145999](https://blockindex.net/address/cb7147879011ea207df5b35a24ca6f0859dcfb145999)
- Star this repository

## Author

[CRYPTO ▪ HUB](https://www.github.com/cryptohub-digital) // [@raisty](https://www.github.com/raisty)

## Epigram

> 「Cryptoni Confidimus」

## License

Licensed under the [CORE](LICENSE) License.
