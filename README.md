# TxMS.js

![TxMS logo](https://corecdn.info/badge/svg/128/txms.svg)
> Official TxMS logo

TxMS is a tool designed for converting binary data into a sequence of printable characters, following a process known as [Binary-to-text encoding](https://en.wikipedia.org/wiki/Binary-to-text_encoding). This tool also enables the reverse operation, where text containing encoded transactions is decoded back into its original hexadecimal format. For SMS processing, TxMS utilizes the UTF-16 Big Endian (UTF-16BE) encoding standard to ensure proper handling and interpretation of the binary data.

## List of Providers

Choose the provider that is most reliable for your needs and region.

[Open the TxMS Status page](https://txms.info)

You can find the open-source server processor at [DataLayerHost/txms-server](https://github.com/DataLayerHost/txms-server).

## How Does It Work?

This tool is used for converting HEX encoding to UTF-16 Big Endian (UTF-16BE) and vice versa.

### What Are UTF-16 and (Big, Little) Endian?

UTF-16 is a character encoding that can encode all 1,112,064 valid Unicode code points.

Big-endian is an order in which the "big end" (most significant value in the sequence) is stored first at the lowest storage address.

In contrast, little-endian is an order where the "little end" (least significant value in the sequence) is stored first.

| Byte Index  | 0  | 1  |
|-------------|----|----|
| Big-Endian  | 12 | 34 |
| Little-Endian | 34 | 12 |

## Practical Use

### Disadvantage 1

An SMS can encode 160 7-bit characters into 140 bytes. However, not all characters represent a single character. Certain characters in GSM 03.38 require an escape character, such as: `|, ^, {, }, €, [, ~, ]` and `\`.

For Unicode SMS, we are limited to 70 characters (or 67 in multipart SMS).

### Disadvantage 2

Most providers do not accept invisible control characters, unused code points, or any type of invisible separator. They replace these with the character `�` (`U+FFFD`), which makes the transaction invalid.

### Advantage 1

Modern providers and phones support UCS-2 (a now-defunct character encoding), which has been replaced with UTF-16 Big Endian (UTF-16BE).

### Advantage 2

To prevent the rejection of certain characters, we prefix them with a tilde `~` character ([007E](https://codepoints.net/U+007E)), followed by the 2+2 hex digits converted to Unicode characters.

Both 2 hex digits receive the `01` prefix.

For example:

1. We receive the hex `09CA`, which is not a valid Unicode character in [Bengali](https://codepoints.net/bengali).
2. We split it into two 2+2 parts.
3. We prefix the first half with `01`, resulting in `0109`, which is converted to [ĉ](https://codepoints.net/U+0109).
4. We prefix the second part with `01`, resulting in `01CA`, which is converted to [Ǌ](https://codepoints.net/U+01CA).
5. The converted characters are prefixed with a `~` tilde.
6. The result is the `~ĉǊ` string.

### Transaction Splitting

To divide transactions in the data feed, use the [Line feed](https://codepoints.net/U+000A) character. In scripts, this is usually referred to as `\n` or `\r`, depending on the OS.

### Outcome

Based on these findings, you should be capable of sending CORE transactions (or any others) encoded in UTF-16BE on modern networks and phones through SMS.

Notes:

- In some instances, you may need to swap the buffer from Little Endian to Big Endian.
- Base62 is a great tool for converting UTF-16 characters into ASCII.
- We exclude certain characters from the UTF-16 Basic Multilingual Plane:
  - tilde `~` character ([007E](https://codepoints.net/U+007E))
  - replacement character `�` ([FFFD](https://codepoints.net/U+FFFD))
  - Control, Format, Unassigned, Private use, Surrogate characters
  - Space characters - Line separator, Paragraph separator, Space separator

### Expectations

Core Blockchain transactions should be packed into 2-3 SMS messages.

#### Sending TxMS vs HEX

TxMS, while dependent on UTF-16, is shorter, making it slightly more efficient than plain HEX in the context of SMS.

However, there is a significant difference in the length of the messages.

In native systems that support UTF-16, you will always achieve the best or most competitive results.

## SMS Functionality

The `sms` function has been extended to support multiple numbers. You can now provide an array of numbers, and each will be validated individually. Valid numbers will be concatenated with a comma `,` to form the SMS endpoint.

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
```

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
- `sms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string` — Create an SMS URI based on the provided parameters.
- `mms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean, platform?: string): string` — Create an MMS URI based on the provided parameters.
- `downloadMessage(hex: string | string[], optionalFilename?: string, optionalPath?: string): Promise<string>` — Download a file with the encoded content as `.txms.txt` file in your working directory. You can provide one hex transaction or an array of transactions (`.batch` will be prepended to suffix if batch is chosen and optional name not defined).

Note: The `downloadMessage` function is asynchronous and returns a Promise. You can use the `await` keyword to wait for the Promise to resolve. The function will download a file with the encoded content as a `(.batch).txms.txt` file in your working directory. You can optionally provide a filename as the second parameter. It is designed to be used in Node.js environments as well as Browser. It is not designed to download high amount of files. if you prefer to do your own download flow, you can use the `encode` function and save the result to a file.

### Parameters

- `hex` = hexadecimal representation of transaction without 0x prefix. (If a prefix is present, it is removed.)
- `data` = UTF-16BE data.
- `network` (default: 1) = ID of Core Blockchain network or its name (such as: mainnet, devin).
- `countriesList` (default: all) = ISO 3166 Alpha-2 country/ies code/s.
- `number` = boolean, string, number, or array of these, representing the phone number(s) for the SMS.
- `message` = the SMS message content.
- `encodeMessage` (default: `true`) = whether to encode the message before using `encodeURIComponent`.
- `platform` = the platform to use for the SMS URI. Currently supported: `ios`, `global`. Default: `global`. `ios` uses the `&body=`, while `global` uses the `?` for `?body=` parameter.
- `optionalFilename` = the optional filename for the downloaded file suffixed with `.txms.txt`. Filename is slugified.
- `optionalPath` = the optional path for the downloaded file. If not provided, the file will be saved in the working directory.

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
- `--encode` (`-e`) - Encode the HEX transaction.
- `--decode` (`-d`) - Decode the UTF-16BE transaction.
- `--count` (`-ct`) - Count the number of characters needed for the transaction. You can choose type of count: `sms`, `mms`. (To perform a count, you need to provide `encode` command.)
- `--getendpoint` (`-g`) - Get the SMS/MMS endpoint for the network and country.
- `--sms` - Create an SMS URI based on the provided parameters.
- `--mms` - Create an MMS URI based on the provided parameters.
- `--download` (`-dl`) - Boolean value to download a file with the encoded content as `.txms.txt` file in your working directory. (To download a file, you need to provide `encode` command.)
- `--help` (`-h`) - Show help. (Only for TTY mode.)

### Piping

```bash
echo {value} | txms {type}={value1}
```

## Extending Aliases and Countries

The `aliases` and `countries` objects in `txms.js` are designed to be extendable, allowing you to add new networks and countries as needed.

### Extending Aliases

To add a new alias for a network, you can use the `addAlias` function:

```typescript
import { addAlias } from 'txms.js';

// Add a new alias
addAlias('testnet', 2);
```

This will allow you to use testnet as an alias for the network with ID `2`.

### Extending Countries

To add new country codes and phone numbers for a specific network, use the addCountry function:

```typescript
import { addCountry } from 'txms.js';

// Add new country codes and phone numbers for the testnet
addCountry(2, 'uk', ['+441234567890']);
```

This will associate the UK country code (`'uk'`) and the phone number `+441234567890` with the network ID `2`.

These utility functions make it easy to customize `txms.js` to support additional networks and countries based on your needs.

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

## Server processors

You can deploy your own server to process the SMS/MMS messages.

DataLayer is offering [open-source server](https://github.com/DataLayerHost/txms-server) processor for SMS and MMS messages.

## Pricing considerations

The service is free to use, but you may incur charges from your mobile provider.

Prices may vary depending on the provider and the country.

In Slovakia, for example, the price is 0.06 EUR (worldwide) per SMS. This can be 0.12 - 0.18 EUR for a 2,3-part SMS which corresponds to one transaction.

This is placing TxMS in slight preference (2 or 3 messages), because it is more efficient than HEX (3 messages).

### MMS

If you need to send a larger transaction, you can use MMS (Multimedia Messaging Service).

MMS is better suited for larger files and Blockchain transactions.

One MMS has 1600 characters. The MMS text limit is 5000 characters. MMS object has a limit of 2048 KB.

To send MMS, you can use two options:

- You can place the content as text document (text/plain) with extension `.txms.txt` and send it to the same number. Each transaction can be divided with new line. You can place multiple `txms` files into one MMS.
- Place transaction(s) in the text message body and send it to the same number. Each transaction can be divided with new line.

MMS has about the same price as SMS (in Slovakia), but the downside is that smartphone should have enabled the MMS service and the data are stored on 3rd party server.

Warning: MMS documents are stored on the server and available to download for certain period of time.

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
