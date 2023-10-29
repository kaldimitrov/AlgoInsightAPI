import * as fs from 'fs';

export function getFileContent(filePath: string, placeholder?: string, replacement?: string) {
  try {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');
    if (!placeholder) {
      return fileContent;
    }

    return fileContent.replace(placeholder, replacement);
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
}
