import fs from 'node:fs';
import path from 'node:path';

export function writeMessageFile(filename: string, encodedMessage: string, optionalPath?: string): string {
	const outputPath = optionalPath ? path.join(optionalPath, filename) : filename;
	const directory = path.dirname(outputPath);

	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}

	fs.writeFileSync(outputPath, encodedMessage);
	return outputPath;
}
