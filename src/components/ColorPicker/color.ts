const INT_HEX_MAP = { 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F' };
const HEX_INT_MAP = { A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 };
const to16 = (value: number) => {
  value = Math.min(Math.round(value), 255);
  const high = Math.floor(value / 16);
  const low = value % 16;
  return '' + (INT_HEX_MAP[high] || high) + (INT_HEX_MAP[low] || low);
};
export const rgb2hex = (r: number, g: number, b: number) => {
  if (isNaN(r) || isNaN(g) || isNaN(b)) return;

  return '#' + to16(r) + to16(g) + to16(b);
};
export const hex2rgb = (hex: string) => {
  const hexStr = hex.substring(1);
  const result = [0, 0, 0];
  for (let i = 0; i < 6; i = i + 2) {
    const high = (HEX_INT_MAP[hexStr[i].toUpperCase()] || +hexStr[i]) * 16;
    const low = HEX_INT_MAP[hexStr[i + 1].toUpperCase()] || +hexStr[i + 1];
    result[i / 2] = high + low;
  }
  return {
    r: result[0],
    g: result[1],
    b: result[2],
    color: `rgb(${result[0]},${result[1]},${result[2]})`
  };
};

export const getRgba = (str: string) => {
  if (str.indexOf('rgba(') === 0) {
    const s = str
      .slice(5, str.length - 1)
      .replace(/\s/g, '')
      .split(',')
      .map((a: string) => Number(a));
    return { r: s[0], g: s[1], b: s[2], a: s[3], color: `rgba(${s[0]},${s[1]},${s[2]},${s[3]})` };
  } else if (str.indexOf('rgb(') === 0) {
    const s = str
      .slice(4, str.length - 1)
      .replace(/\s/g, '')
      .split(',')
      .map((a: string) => parseInt(a));
    return { r: s[0], g: s[1], b: s[2], a: 1, color: `rgba(${s[0]},${s[1]},${s[2]},1)` };
  } else if (str.indexOf('#') === 0) {
    let res;
    if (str.length === 7) res = str;
    else if (str.length === 4) res = `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`;
    else if (str.length === 3) res = `#${str[1]}${str[1]}${str[1]}${str[2]}${str[2]}${str[2]}`;
    if (res) {
      const c = hex2rgb(res);
      return { ...c, a: 1, color: `rgba(${c.r},${c.g},${c.b},1)` };
    }
  }
};

export const rgb2hsv = (r: number, g: number, b: number) => {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = 0,
    s: number = 0;
  let v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100, h1: h, s1: s, v1: v };
};
