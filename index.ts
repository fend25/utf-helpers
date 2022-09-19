export const HexString = {
  fromArray: (bytes: number[] | Uint8Array) => {
    if (!(bytes instanceof Uint8Array) && !Array.isArray(bytes)) {
      throw new Error(`HexString.fromArray: passed bytes obj is not an Array or Uint8Array: ${typeof bytes}, ${bytes}`)
    }
    const arr = bytes instanceof Uint8Array ? Array.from(bytes) : bytes
    return '0x' + arr.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  },
  fromU8a: (bytes: number[] | Uint8Array) => HexString.fromArray(bytes),
  toArray(hexString: string): number[] {
    if (typeof hexString !== 'string') {
      throw new Error(`HexString.toArray: passed string is not a string: ${typeof hexString}`)
    }

    const str: string = hexString.startsWith('0x') ? hexString.slice(2) : hexString
    const pairs: RegExpMatchArray = str.match(/.{1,2}/g) || []
    return pairs.map((byte) => parseInt(byte, 16))
  },
  toU8a: (hexString: string): Uint8Array => Uint8Array.from(HexString.toArray(hexString)),
}


export const Utf8 = {
  stringToU8a(str: string): Uint8Array {
    const u8a = new Uint8Array(Utf8.lengthInBytes(str))

    let offset = 0
    const start = offset
    let c1: number = 0 // character 1
    let c2: number = 0 // character 2

    let i = 0

    while (i < str.length) {
      c1 = str.charCodeAt(i)
      if (c1 < 128) {
        u8a[offset++] = c1
      } else if (c1 < 2048) {
        u8a[offset++] = c1 >> 6 | 192
        u8a[offset++] = c1 & 63 | 128
      } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = str.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
        c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF)
        ++i
        u8a[offset++] = c1 >> 18 | 240
        u8a[offset++] = c1 >> 12 & 63 | 128
        u8a[offset++] = c1 >> 6 & 63 | 128
        u8a[offset++] = c1 & 63 | 128
      } else {
        u8a[offset++] = c1 >> 12 | 224
        u8a[offset++] = c1 >> 6 & 63 | 128
        u8a[offset++] = c1 & 63 | 128
      }

      i += 1
    }
    const diff = offset - start

    return u8a
  },
  stringToNumberArray(str: string): number[] {
    return Array.from(Utf8.stringToU8a(str))
  },
  u8aToString(u8a: Uint8Array): string {
    let start = 0
    let end = u8a.length

    if (end - start < 1) {
      return ""
    }

    let str = ""

    let i = start

    while (i < end) {
      const t = u8a[i++]
      if (t <= 0x7F) {
        str += String.fromCharCode(t);
      } else if (t >= 0xC0 && t < 0xE0) {
        str += String.fromCharCode((t & 0x1F) << 6 | u8a[i++] & 0x3F)
      } else if (t >= 0xE0 && t < 0xF0) {
        str += String.fromCharCode((t & 0xF) << 12 | (u8a[i++] & 0x3F) << 6 | u8a[i++] & 0x3F)
      } else if (t >= 0xF0) {
        const t2 = ((t & 7) << 18 | (u8a[i++] & 0x3F) << 12 | (u8a[i++] & 0x3F) << 6 | u8a[i++] & 0x3F) - 0x10000
        str += String.fromCharCode(0xD800 + (t2 >> 10))
        str += String.fromCharCode(0xDC00 + (t2 & 0x3FF))
      }
    }

    return str
  },
  numberArrayToString(arr: number[] | Uint8Array): string {
    return Utf8.u8aToString(Uint8Array.from(arr))
  },
  stringToHexString(str: string): string {
    return HexString.fromU8a(Utf8.stringToU8a(str))
  },
  hexStringToString(hexString: string): string {
    return Utf8.u8aToString(HexString.toU8a(hexString))
  },
  lengthInBytes(str: string): number {
    let len = 0
    let c = 0

    let i = 0

    while (i < str.length) {
      c = str.charCodeAt(i) as number
      if (c < 128) {
        len += 1
      } else if (c < 2048) {
        len += 2
      } else if ((c & 0xFC00) === 0xD800 && ((str.charCodeAt(i + 1) as number) & 0xFC00) === 0xDC00) {
        ++i
        len += 4
      } else {
        len += 3
      }

      i += 1
    }
    return len
  },
}


export const Utf16 = {
  stringToU16a(str: string): Uint16Array {
    const u16arr = new Uint16Array(Utf16.lengthInBytes(str))

    let i = 0

    while (i < str.length) {
      let cp = str.codePointAt(i) as number

      if (cp <= 0xFFFF) {
        u16arr[i++] = cp
      } else {
        cp -= 0x10000
        u16arr[i++] = (cp >> 10) + 0xD800
        u16arr[i++] = (cp % 0x400) + 0xDC00
      }
    }
    return u16arr
  },
  stringToNumberArray(str: string): number[] {
    return Array.from(Utf16.stringToU16a(str))
  },
  numberArrayToString(arr: number[] | Uint16Array) {
    let i = 0
    const len = arr.length
    let s = ''

    while (i < len - 1) {
      const c1 = arr[i]
      const c2 = arr[i + 1]

      if (c1 >= 0xD800 && c1 <= 0xDFFF) {
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
          s += String.fromCodePoint((c1 - 0xD800) * 0x400 + c2 - 0xDC00 + 0x10000)
          i += 2
        } else {
          throw new Error(`invalid UTF16 sequence: first u16 is ${c1}, second u16 is ${c2}`)
        }
      } else {
        s += String.fromCodePoint(c1)
        i += 1
      }
    }

    if (i < len) {
      s += String.fromCodePoint(arr[len - 1])
    }

    return s
  },
  u16aToString(arr: number[] | Uint16Array): string {
    return Utf16.numberArrayToString(arr)
  },
  lengthInBytes(str: string): number {
    let i = 0

    while (i < str.length) {
      i += (str.codePointAt(i) as number <= 0xFFFF) ? 1 : 2
    }

    return i
  },
}

export const UtfHelpers = {
  HexString,
  Utf8,
  Utf16,
}
