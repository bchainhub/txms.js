# TxMS.js

![TxMS logo](https://corecdn.info/mark/144/txms.png)
> Official TxMS logo

TxMS converts binary data into a sequence of printable characters through a process known as [binary-to-text encoding](https://en.wikipedia.org/wiki/Binary-to-text_encoding). It can also reverse the operation by decoding text containing encoded transactions into its original hexadecimal format. For SMS processing, TxMS uses UTF-16 big-endian (UTF-16BE) encoding to ensure that binary data is handled and interpreted correctly.

## List of Providers

Choose the provider that is most reliable for your needs and region.

[Open the TxMS Status page](https://txms.info)

You can find the open-source server processor at [DataLayerHost/txms-server](https://github.com/DataLayerHost/txms-server).

## How Does It Work?

This tool converts hexadecimal data to UTF-16 big-endian (UTF-16BE) encoding and vice versa.

### What Are UTF-16 and Endianness?

UTF-16 is a character encoding that can encode all 1,112,064 valid Unicode code points.

Big-endian is an order in which the "big end" (most significant value in the sequence) is stored first at the lowest storage address.

In contrast, little-endian is an order where the "little end" (least significant value in the sequence) is stored first.

| Byte Index    | 0  | 1  |
|---------------|----|----|
| Big-Endian    | 12 | 34 |
| Little-Endian | 34 | 12 |

## Practical Use

### Disadvantage 1

An SMS can encode 160 7-bit characters into 140 bytes. However, not all characters use a single character position. Certain characters in GSM 03.38 require an escape character, including `|, ^, {, }, €, [, ~, ]`, and `\`.

For Unicode SMS, we are limited to 70 characters (or 67 in multipart SMS).

### Disadvantage 2

Most providers do not accept invisible control characters, unused code points, or any type of invisible separator. They replace these with the character `�` (`U+FFFD`), which makes the transaction invalid.

### Advantage 1

Modern providers and phones support UCS-2 (a now-defunct character encoding), which has been replaced by UTF-16 big-endian (UTF-16BE).

### Advantage 2

To prevent the rejection of certain characters, we prefix them with a tilde `~` character ([007E](https://codepoints.net/U+007E)), followed by the 2+2 hex digits converted to Unicode characters.

Each pair of hexadecimal digits receives the `01` prefix.

For example:

1. We receive the hex `09CA`, which is not a valid Unicode character in [Bengali](https://codepoints.net/bengali).
2. We split it into two 2+2 parts.
3. We prefix the first half with `01`, resulting in `0109`, which is converted to [ĉ](https://codepoints.net/U+0109).
4. We prefix the second part with `01`, resulting in `01CA`, which is converted to [Ǌ](https://codepoints.net/U+01CA).
5. The converted characters are prefixed with a `~` tilde.
6. The result is the `~ĉǊ` string.

### Transaction Splitting

To divide transactions in the data feed, use the [line feed](https://codepoints.net/U+000A) character. In scripts, this is usually represented by `\n` or `\r`, depending on the operating system.

### Outcome

Based on these findings, you should be capable of sending CORE transactions (or any others) encoded in UTF-16BE on modern networks and phones through SMS.

Notes:

- In some instances, you may need to swap the buffer from little-endian to big-endian.
- Base62 is a great tool for converting UTF-16 characters into ASCII.
- We exclude certain characters from the UTF-16 Basic Multilingual Plane:
  - tilde `~` character ([007E](https://codepoints.net/U+007E))
  - replacement character `�` ([FFFD](https://codepoints.net/U+FFFD))
  - control, format, unassigned, private-use, and surrogate characters
  - space characters, including line, paragraph, and space separators

### Expectations

Core Blockchain transactions should fit into 2–3 SMS messages.

#### Sending TxMS vs. Hexadecimal Data

Although TxMS depends on UTF-16, it is shorter and slightly more efficient than plain hexadecimal data in SMS messages.

The resulting messages can differ significantly in length.

Native systems that support UTF-16 generally provide the best results.

## SMS Functionality

The `sms` function supports multiple numbers. You can provide an array of numbers, each of which is validated individually. Valid numbers are joined with a comma (`,`) to form the SMS endpoint.

- If the number is `true`, the default number for the mainnet (1) will be used.
- If the number is a string, it must be formatted as `+` followed by digits.
- If the number is an array, each element will be checked for validity.
- An optional `encodeMessage` parameter (default: `true`) allows you to encode the message using `encodeURIComponent` and an internal `encode` function. If set to `false`, the message will only be encoded using `encodeURIComponent`.

## Installation

### Using NPM

```bash
npm i txms.js
```

### Using Yarn

```bash
yarn add txms.js
```

## Usage

### Importing

#### ES Module Syntax (Recommended for Modern JavaScript/TypeScript)

```typescript
import txms from 'txms.js';
let encoded = txms.encode(hex);
let decoded = txms.decode(string);
let number = txms.getNumber('US');
```

#### Browser-Safe Number Pools

Applications that only need the maintained TxMS number pools can use the
browser-safe `txms.js/numbers` entry point. It excludes encoding, file download,
and other runtime code from the bundle.

```typescript
import { countries } from 'txms.js/numbers';

const mainnetNumbers = countries.xcb;
const devinNumbers = countries.xab;
```

The exported `countries` object includes every registered network pool. `xcb`
contains Core Mainnet numbers and `xab` contains Devin testnet numbers.

#### CommonJS Syntax (Legacy Support)

```javascript
var txms = require('txms.js').default;
var encoded = txms.encode(hex);
var decoded = txms.decode(string);
```

#### Dual Compatibility

The library is designed to be compatible with both module systems, so you can choose the import style that best fits your project. Whether you’re working in a modern ES module environment or maintaining legacy CommonJS code, txms.js can be seamlessly integrated.

### Functions

- `encode(hex: string): string` — Convert hex transaction into UTF-16BE.
- `decode(data: string): string` — Convert UTF-16BE into hex transaction.
- `count(data: string, type: 'sms' | 'mms'): number` — Count the number of characters/SMS/MMS needed for the transaction.
- `getEndpoint(network?: number | string, countriesList?: string | Array<string>): { [key: string]: Array<string> }` — Get an object of SMS endpoints (phone numbers) per country.
- `txms.getNumber(iso3166A2?: string, returnNone?: boolean, network?: number | string): string | null` — Get the most suitable number for a country, falling back by shared calling code, organization membership, and then the global number.
- `sms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string` — Create an SMS URI based on the provided parameters.
- `mms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string` — Create an MMS URI based on the provided parameters.
- `downloadMessage(hex: string | string[], optionalFilename?: string, optionalPath?: string): Promise<string>` — Download the encoded content as a `.txms.txt` file in your working directory. You can provide one hexadecimal transaction or an array of transactions. When multiple transactions are provided without a custom filename, `.batch` is added before the file extension.

Note: The `downloadMessage` function is asynchronous and returns a Promise. You can use the `await` keyword to wait for the Promise to resolve. The function downloads the encoded content as a `.txms.txt` or `.batch.txms.txt` file in your working directory. You can optionally provide a filename as the second parameter. It is designed for Node.js and browser environments, but not for downloading a large number of files. If you prefer to implement your own download flow, use the `encode` function and save the result to a file.

### Parameters

- `hex` = hexadecimal representation of a transaction without the `0x` prefix. If the prefix is present, it is removed.
- `data` = UTF-16BE data.
- `network` (default: `xcb`) = Blockchain pool name or an alias such as `mainnet`, `devin`, `1`, or `3`.
- `countriesList` (default: all) = one or more ISO 3166-1 alpha-2 country codes.
- `number` = boolean, string, number, or array of these, representing the phone number(s) for the SMS.
- `message` = the SMS message content.
- `encodeMessage` (default: `true`) = whether to encode the message before using `encodeURIComponent`.
- `platform` = the platform to use for the SMS URI. Supported values are `ios` and `global`; the default is `global`. `ios` uses `&body=`, while `global` uses `?body=`.
- `optionalFilename` = the optional filename for the downloaded file suffixed with `.txms.txt`. Filename is slugified.
- `optionalPath` = the optional path for the downloaded file. If not provided, the file will be saved in the working directory.

### Selecting the Most Suitable Number

`txms.getNumber` accepts a case-insensitive ISO 3166-1 alpha-2 country code:

```typescript
import txms from 'txms.js';

txms.getNumber('US');                  // Direct mainnet match
txms.getNumber('CA');                  // May use a US number because both use +1
txms.getNumber('SK');                  // May use another available EU number
txms.getNumber('ZZ', true);            // null instead of the global fallback
txms.getNumber('US', false, 'devin');  // Select from the XAB/testnet pool
txms.getNumber('US', false, 'xcb');    // XCB alias: mainnet (default)
txms.getNumber('US', false, 'xab');    // XAB alias: Devin/testnet
```

When no country is supplied, the global number is returned. For a supplied country, selection follows this order:

1. Direct country match.
2. A country sharing the same international calling code.
3. The largest available country in the same supported organization, using
   the population-priority order maintained by the library.
4. The network's global number, or `null` when `returnNone` is `true`.

Number pools are maintained separately in `src/numbers-pool/xcb.ts` for mainnet and `src/numbers-pool/xab.ts` for testnet.

## CLI

### CLI Installation

```bash
npm i -g txms.js
```

### Getting started

```bash
txms {type}={value}
```

Types:

- `--version` (`-v`) - Get the version of the library.
- `--encode` (`-e`) - Encode the hexadecimal transaction.
- `--decode` (`-d`) - Decode the UTF-16BE transaction.
- `--count` (`-ct`) - Count the characters or messages required for the transaction. Supported count types are `sms` and `mms`. The `encode` command is required.
- `--getendpoint` (`-g`) - Get the SMS/MMS endpoint for the network and country.
- `--getnumber` (`-gn`) - Get the most suitable number for an optional ISO 3166-1 alpha-2 country code.
- `--network` (`-n`) - Select the blockchain number pool. The default is `xcb`.
- `--return-none` - Return `null` instead of the global fallback when no suitable number is available.
- `--sms` - Create an SMS URI based on the provided parameters.
- `--mms` - Create an MMS URI based on the provided parameters.
- `--download` (`-dl`) - Download the encoded content as a `.txms.txt` file in your working directory. The `encode` command is required.
- `--help` (`-h`) - Show help. (Only for TTY mode.)

Examples:

```bash
txms --getnumber=CA
txms --getnumber=US --network=xab
txms --getnumber=ZZ --return-none
txms --getnumber
```

### Piping

```bash
echo {value} | txms {type}={value1}
```

## Extending Aliases and Countries

The default `txms` object exposes extendable `aliases` and `countries` collections, allowing you to add new networks and countries as needed.

### Extending Aliases

To add a new alias for a network, use `txms.addAlias`:

```typescript
import txms from 'txms.js';

// Add a short alias for another pool when needed
txms.addAlias('2', 'teth');
```

Aliases point to canonical blockchain pool names. Existing compatibility aliases resolve `mainnet` and `1` to `xcb`, while `devin` and `3` resolve to `xab`.

### Extending Countries

To add new country codes and phone numbers for a specific network, use `txms.addCountry`:

```typescript
import txms from 'txms.js';

// Create/update ETH and TETH number pools
txms.addCountry('eth', 'gb', ['+441234567890']);
txms.addCountry('teth', 'gb', ['+441234567891']);
```

This associates each country and phone number directly with its blockchain pool. New pool names do not need numeric network IDs.

These utility functions make it easy to customize `txms.js` to support additional networks and countries based on your needs.

## Tests

Unit tests are included and can be executed with the command `yarn test` or `npm run test`.

GitHub automatically tests commits pushed to the repository.

Contributions and extensions to our test cases are welcome.

### Test wallets

We use Core Blockchain Devin (testnet) wallets for testing.

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

## Server processors

You can deploy your own server to process the SMS/MMS messages.

DataLayer offers an [open-source server](https://github.com/DataLayerHost/txms-server) for processing SMS and MMS messages.

## Pricing considerations

The service is free to use, but you may incur charges from your mobile provider.

Prices may vary depending on the provider and the country.

In Slovakia, for example, the worldwide price is EUR 0.06 per SMS. A two- or three-part SMS corresponding to one transaction may cost EUR 0.12–0.18.

This gives TxMS a slight advantage because it typically requires two or three messages and is more efficient than hexadecimal encoding.

### MMS

If you need to send a larger transaction, you can use MMS (Multimedia Messaging Service).

MMS is better suited for larger files and Blockchain transactions.

One MMS has 1,600 characters. The MMS text limit is 5,000 characters, and an MMS object has a limit of 2,048 KB.

To send MMS, you can use two options:

- Place the content in a text document (`text/plain`) with the `.txms.txt` extension and send it to the same number. Transactions can be separated by newlines, and multiple `txms` files can be included in one MMS.
- Place one or more transactions in the message body and send it to the same number. Transactions can be separated by newlines.

MMS costs about the same as SMS in Slovakia. However, the smartphone must have MMS enabled, and the data is stored on a third-party server.

Warning: MMS documents are stored on the server and remain available for download for a limited time.

## Contributions

You're welcome to contribute in any capacity.

We welcome:

- Forking [this repository](https://github.com/bchainhub/txms.js/fork)
- Starring [this repository](https://github.com/bchainhub/txms.js/stargazers)
- Opening a [pull request](https://github.com/bchainhub/txms.js/pulls)
- Creating your own [SMS endpoint](#sms-endpoint)
- Sending us some Øres / ₡ores: [cb7147879011ea207df5b35a24ca6f0859dcfb145999](https://blockindex.net/address/cb7147879011ea207df5b35a24ca6f0859dcfb145999)

### To Contribute, Please Follow These Steps

1. [Fork the repository](https://github.com/bchainhub/txms.js/fork).
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push your changes.
6. [Open a pull request](https://github.com/bchainhub/txms.js/pulls).

Please ensure your code is well-documented and follows the project's coding standards.

## License

Licensed under the [CORE](LICENSE) License.
