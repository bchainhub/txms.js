# TXMS.js

<img src="https://corecdn.info/badge/svg/128/txms.svg" width="128"/>

## List of Providers

Choose the provider most reliable for your needs and region.

[Open the TXMS Status page](https://txms.info)

## How Does It Work?

This tool is used for converting HEX encoding to UTF-16 Big Endian (UTF-16BE).

### What Are UTF-16 and (Big, Little) Endian?

UTF-16 is a character encoding that can encode all 1,112,064 valid Unicode code points.

Big-endian is an order in which the "big end" (most significant value in the sequence) is stored first at the lowest storage address.

In contrast, little-endian is an order where the "little end" (least significant value in the sequence) is stored first.

Byte Index | 0 | 1
--- | --- | ---
Big-Endian | 12 | 34
Little-Endian | 34 | 12

## Practical Use

### Disadvantage 1

An SMS can encode 160 7-bit characters into 140 bytes. However, not all characters represent 1 character. Certain characters in GSM 03.38 require an escape character, such as: `|, ^, {, }, €, [, ~, ]` and `\`.

For Unicode SMS, we are limited to 70 characters (or 67 in multipart SMS).

### Disadvantage 2

Most providers do not accept `invisible control characters and unused code points` or `any type of invisible separator`. They replace these with the character `�` `U+FFFD`, which makes the transaction invalid.

### Advantage 1

Modern providers and phones support UCS-2 (a now-defunct character encoding), which has been replaced with UTF-16 Big Endian (UTF-16BE).

### Advantage 2

To prevent the rejection of certain characters, we prefix them with a tilde `~` character ([007E](https://codepoints.net/U+007E)), followed by the 2+2 hex digits converted to Unicode characters.

Both 2 hex digits receive the `01` prefix.

For example:
1. We receive hex `09CA`, which is not a valid Unicode character in [Bengali](https://codepoints.net/bengali).
1. We split it into two 2+2 parts.
1. We prefix the first half with `01`, resulting in `0109`, which is converted to [ĉ](https://codepoints.net/U+0109).
1. We prefix the second part with `01`, resulting in `01CA`, which is converted to [Ǌ](https://codepoints.net/U+01CA).
1. The converted characters are prefixed with a `~` tilde.
1. The result is the `~ĉǊ` string.

### Transaction Splitting

To divide transactions in the data feed, use the [Line feed](https://codepoints.net/U+000A) character. In scripts, this is usually referred to as `\n` or `\r`, depending on the OS.

### Outcome

Based on these findings, you should be capable of sending CORE transactions (or any others) encoded by UTF-16BE on modern networks and phones through SMS.

Notes:
- In some instances, you may need to swap the buffer from Little Endian to Big Endian.
- Base62 is a great tool for converting UTF-16 characters into ASCII.
- We exclude characters from the UTF-16 Basic Multilingual Plane:
   - tilde `~` character ([007E](https://codepoints.net/U+007E))
   - replacement ` ` character ([FFFD](https://codepoints.net/U+FFFD))
   - Control, Format, Unassigned, Private use, Surrogate characters
   - Space characters - Line separator, Paragraph separator, Space separator

### Expectations

Core Blockchain transactions should be packed into 2-3 SMS messages.

#### Sending TXMS vs HEX

TXMS, while dependent on UTF-16, is shorter, making it slightly more efficient than plain HEX in the context of SMS.

However, there is a significant difference in the length of the messages.

In native systems that support UTF-16, you will always achieve the best or most competitive results.

## Installation

### Using NPM

```sh
npm i txms.js
```

### Using Yarn

```sh
yarn add txms.js
```

## Usage

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

- `hex` = hexadecimal representation of transaction without 0x prefix. (If a prefix is present, it is removed.)
- `data` = UTF-16BE data
- `network` (default: 1) = ID of Core Blockchain network or its name (such as: mainnet, devin).
- `countriesList` (default: all) = ISO 3166 Alpha-2 country/ies code/s.

## CLI

### Installation

```bash
npm i -g txms.js
```

### Getting started

```bash
$ txms {type} {value} {location}
```

- type: `encode` (`e`), `decode` (`d`), `getendpoint` (`g`)
- value: message; network for getendpoint
- location: ISO 3166 Alpha-2 country/ies code/s for getendpoint

### Piping

```bash
$ echo {value} | txms {type} {location}
```

## Tests

Unit tests are included and can be executed with the command `yarn test` or `npm run test`.

GitHub automatically tests the commits into the source code.

Contributions and extensions to our test cases are welcome.

### Test wallets

We use the Core Blockchain - Devin (testnet) wallets for tests.

## Additional Services

We can send an SMS back with the status and stream success/failure statuses into the database.

If you need an API endpoint or want to receive an SMS back to the sender's number, please contact us.

## SMS Endpoint

You can use our predefined endpoints or create your own service.

To provide the best results, we check the online status of the service with the [uptime checker](https://github.com/gatestatus/txms).

Follow these steps:
- Test your service.
- Return the [200 "OK"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) status code at the `yoururl.tld/ping` endpoint.
- Submit a [Listing request](https://github.com/gatestatus/txms/issues/new?template=list.yml).

## Security

This tool doesn't encrypt, it converts. Therefore, anyone can read your signed transaction, but don't worry as they could do this on the Blockchain anyway.

Stay safe. Do not broadcast your private key or any sensitive data you wish to safeguard.

## Contributions

You're welcome to contribute in any capacity.

We welcome:
- Forking [this repository](https://github.com/cryptohub-digital/txms.js/fork)
- Opening a [pull request](https://github.com/cryptohub-digital/txms.js/pulls)
- Creating your own [SMS endpoint](#sms-endpoint)
- Sending us some Øres / ₡ores: [cb7147879011ea207df5b35a24ca6f0859dcfb145999](https://blockindex.net/address/cb7147879011ea207df5b35a24ca6f0859dcfb145999)
- Starring this repository

## Author

[CRYPTO ▪ HUB](https://www.github.com/cryptohub-digital)

## Motto

> 「Cryptoni Confidimus」

## License

Licensed under the [CORE](LICENSE) License.
