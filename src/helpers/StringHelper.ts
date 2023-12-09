export function removeControlCharacters(str: string) {
  return str.replace(/[\x00-\x08\x0B-\x1F]/g, '');
}
