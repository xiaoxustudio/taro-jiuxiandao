// eslint-disable-next-line import/prefer-default-export
export function UUID(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  // eslint-disable-next-line no-bitwise
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  // eslint-disable-next-line no-bitwise
  buffer[8] = (buffer[8] & 0x3f) | 0x80;
  return Array.from(buffer)
    .map((byte, index) => {
      if ([4, 6, 8, 10].includes(index))
        return `-${byte.toString(16).padStart(2, '0')}`;
      return byte.toString(16).padStart(2, '0');
    })
    .join('')
    .replace(/-/g, '')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}
