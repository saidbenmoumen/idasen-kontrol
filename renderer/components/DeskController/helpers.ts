export const bufferToNum = (buff: any) => new Uint16Array(buff)[0];

export const posToCm = (pos: number):number => Number((((381 / 3815) * pos + 612.13) / 10).toFixed(2))

export const hexStrToArray = (hexString: string) => {
  let decimals = [];
  for (let i = 0; i < hexString.length; i += 2) {
    decimals.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(decimals);
};
