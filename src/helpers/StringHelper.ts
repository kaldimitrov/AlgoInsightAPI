export function removeControlCharacters(str: string) {
  return str.replace(/[\x00-\x08\x0B-\x1F]/g, '');
}

export function addLogInformation(str: string, logLevel: string, time: string) {
  return str.replace(/\n(?!$)/g, `\n[${logLevel} ${time}]: `);
}
