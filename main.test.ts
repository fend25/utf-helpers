import {describe, expect, test} from 'vitest'
import {UtfHelpers, HexString, Utf8, Utf16} from './index'

const Strings = {
  abc: 'abc',
  flower: '🌷',
  flower_a: '🌷a',
  a_flower_b: 'a🌷b',
  fooBarBazQux: 'Foo © bar 𝌆 baz ☃ qux',
  allInOnce: 'Test кириллица Эй, жлоб! Где туз? Прячь юных съёмщиц в шкаф. Καλησπέρα घर बनाने वाला สัปดาห์ 人 人 綾波 レイ 井ノ上 たきな喫茶リコリコ',
  rtl: 'abc 123 АбВгД Καλησπέρα יש שבעה ימים يكتب',
  emoji: '👨🏼‍👩🏼‍👧🏼‍👧🏼',
}

const U8NumberArrays: { [K in keyof typeof Strings]: number[] } = {
  abc: [0x61, 0x62, 0x63],
  flower: [0xF0, 0x9F, 0x8C, 0xB7],
  flower_a: [0xF0, 0x9F, 0x8C, 0xB7, 0x61],
  a_flower_b: [0x61, 0xF0, 0x9F, 0x8C, 0xB7, 0x62],
  fooBarBazQux: [0x46, 0x6F, 0x6F, 0x20, 0xC2, 0xA9, 0x20, 0x62, 0x61, 0x72, 0x20, 0xF0, 0x9D, 0x8C, 0x86, 0x20, 0x62, 0x61, 0x7A, 0x20, 0xE2, 0x98, 0x83, 0x20, 0x71, 0x75, 0x78],
  allInOnce: [0x54, 0x65, 0x73, 0x74, 0x20, 0xD0, 0xBA, 0xD0, 0xB8, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xBB, 0xD0, 0xBB, 0xD0, 0xB8, 0xD1, 0x86, 0xD0, 0xB0, 0x20, 0xD0, 0xAD, 0xD0, 0xB9, 0x2C, 0x20, 0xD0, 0xB6, 0xD0, 0xBB, 0xD0, 0xBE, 0xD0, 0xB1, 0x21, 0x20, 0xD0, 0x93, 0xD0, 0xB4, 0xD0, 0xB5, 0x20, 0xD1, 0x82, 0xD1, 0x83, 0xD0, 0xB7, 0x3F, 0x20, 0xD0, 0x9F, 0xD1, 0x80, 0xD1, 0x8F, 0xD1, 0x87, 0xD1, 0x8C, 0x20, 0xD1, 0x8E, 0xD0, 0xBD, 0xD1, 0x8B, 0xD1, 0x85, 0x20, 0xD1, 0x81, 0xD1, 0x8A, 0xD1, 0x91, 0xD0, 0xBC, 0xD1, 0x89, 0xD0, 0xB8, 0xD1, 0x86, 0x20, 0xD0, 0xB2, 0x20, 0xD1, 0x88, 0xD0, 0xBA, 0xD0, 0xB0, 0xD1, 0x84, 0x2E, 0x20, 0xCE, 0x9A, 0xCE, 0xB1, 0xCE, 0xBB, 0xCE, 0xB7, 0xCF, 0x83, 0xCF, 0x80, 0xCE, 0xAD, 0xCF, 0x81, 0xCE, 0xB1, 0x20, 0xE0, 0xA4, 0x98, 0xE0, 0xA4, 0xB0, 0x20, 0xE0, 0xA4, 0xAC, 0xE0, 0xA4, 0xA8, 0xE0, 0xA4, 0xBE, 0xE0, 0xA4, 0xA8, 0xE0, 0xA5, 0x87, 0x20, 0xE0, 0xA4, 0xB5, 0xE0, 0xA4, 0xBE, 0xE0, 0xA4, 0xB2, 0xE0, 0xA4, 0xBE, 0x20, 0xE0, 0xB8, 0xAA, 0xE0, 0xB8, 0xB1, 0xE0, 0xB8, 0x9B, 0xE0, 0xB8, 0x94, 0xE0, 0xB8, 0xB2, 0xE0, 0xB8, 0xAB, 0xE0, 0xB9, 0x8C, 0x20, 0xE4, 0xBA, 0xBA, 0x20, 0xE4, 0xBA, 0xBA, 0x20, 0xE7, 0xB6, 0xBE, 0xE6, 0xB3, 0xA2, 0x20, 0xE3, 0x83, 0xAC, 0xE3, 0x82, 0xA4, 0x20, 0xE4, 0xBA, 0x95, 0xE3, 0x83, 0x8E, 0xE4, 0xB8, 0x8A, 0x20, 0xE3, 0x81, 0x9F, 0xE3, 0x81, 0x8D, 0xE3, 0x81, 0xAA, 0xE5, 0x96, 0xAB, 0xE8, 0x8C, 0xB6, 0xE3, 0x83, 0xAA, 0xE3, 0x82, 0xB3, 0xE3, 0x83, 0xAA, 0xE3, 0x82, 0xB3],
  rtl: [0x61, 0x62, 0x63, 0x20, 0x31, 0x32, 0x33, 0x20, 0xD0, 0x90, 0xD0, 0xB1, 0xD0, 0x92, 0xD0, 0xB3, 0xD0, 0x94, 0x20, 0xCE, 0x9A, 0xCE, 0xB1, 0xCE, 0xBB, 0xCE, 0xB7, 0xCF, 0x83, 0xCF, 0x80, 0xCE, 0xAD, 0xCF, 0x81, 0xCE, 0xB1, 0x20, 0xD7, 0x99, 0xD7, 0xA9, 0x20, 0xD7, 0xA9, 0xD7, 0x91, 0xD7, 0xA2, 0xD7, 0x94, 0x20, 0xD7, 0x99, 0xD7, 0x9E, 0xD7, 0x99, 0xD7, 0x9D, 0x20, 0xD9, 0x8A, 0xD9, 0x83, 0xD8, 0xAA, 0xD8, 0xA8],
  emoji: [0xf0, 0x9f, 0x91, 0xa8, 0xf0, 0x9f, 0x8f, 0xbc, 0xe2, 0x80, 0x8d, 0xf0, 0x9f, 0x91, 0xa9, 0xf0, 0x9f, 0x8f, 0xbc, 0xe2, 0x80, 0x8d, 0xf0, 0x9f, 0x91, 0xa7, 0xf0, 0x9f, 0x8f, 0xbc, 0xe2, 0x80, 0x8d, 0xf0, 0x9f, 0x91, 0xa7, 0xf0, 0x9f, 0x8f, 0xbc],
}

const U16NumberArrays: { [K in keyof typeof Strings]: number[] } = {
  abc: [0x61, 0x62, 0x63],
  flower: [0xd83c, 0xdf37],
  flower_a: [0xd83c, 0xdf37, 0x61],
  a_flower_b: [0x61, 0xd83c, 0xdf37, 0x62],
  fooBarBazQux: [0x46, 0x6f, 0x6f, 0x20, 0xa9, 0x20, 0x62, 0x61, 0x72, 0x20, 0xd834, 0xdf06, 0x20, 0x62, 0x61, 0x7a, 0x20, 0x2603, 0x20, 0x71, 0x75, 0x78],
  allInOnce: [0x54, 0x65, 0x73, 0x74, 0x20, 0x43a, 0x438, 0x440, 0x438, 0x43b, 0x43b, 0x438, 0x446, 0x430, 0x20, 0x42d, 0x439, 0x2c, 0x20, 0x436, 0x43b, 0x43e, 0x431, 0x21, 0x20, 0x413, 0x434, 0x435, 0x20, 0x442, 0x443, 0x437, 0x3f, 0x20, 0x41f, 0x440, 0x44f, 0x447, 0x44c, 0x20, 0x44e, 0x43d, 0x44b, 0x445, 0x20, 0x441, 0x44a, 0x451, 0x43c, 0x449, 0x438, 0x446, 0x20, 0x432, 0x20, 0x448, 0x43a, 0x430, 0x444, 0x2e, 0x20, 0x39a, 0x3b1, 0x3bb, 0x3b7, 0x3c3, 0x3c0, 0x3ad, 0x3c1, 0x3b1, 0x20, 0x918, 0x930, 0x20, 0x92c, 0x928, 0x93e, 0x928, 0x947, 0x20, 0x935, 0x93e, 0x932, 0x93e, 0x20, 0xe2a, 0xe31, 0xe1b, 0xe14, 0xe32, 0xe2b, 0xe4c, 0x20, 0x4eba, 0x20, 0x4eba, 0x20, 0x7dbe, 0x6ce2, 0x20, 0x30ec, 0x30a4, 0x20, 0x4e95, 0x30ce, 0x4e0a, 0x20, 0x305f, 0x304d, 0x306a, 0x55ab, 0x8336, 0x30ea, 0x30b3, 0x30ea, 0x30b3],
  rtl: [0x61, 0x62, 0x63, 0x20, 0x31, 0x32, 0x33, 0x20, 0x410, 0x431, 0x412, 0x433, 0x414, 0x20, 0x39a, 0x3b1, 0x3bb, 0x3b7, 0x3c3, 0x3c0, 0x3ad, 0x3c1, 0x3b1, 0x20, 0x5d9, 0x5e9, 0x20, 0x5e9, 0x5d1, 0x5e2, 0x5d4, 0x20, 0x5d9, 0x5de, 0x5d9, 0x5dd, 0x20, 0x64a, 0x643, 0x62a, 0x628],
  emoji: [0xd83d, 0xdc68, 0xd83c, 0xdffc, 0x200d, 0xd83d, 0xdc69, 0xd83c, 0xdffc, 0x200d, 0xd83d, 0xdc67, 0xd83c, 0xdffc, 0x200d, 0xd83d, 0xdc67, 0xd83c, 0xdffc],
}


const keys = Object.keys(Strings) as Array<keyof typeof Strings>
const HexUtf8Strings = Object.entries(U8NumberArrays).reduce((acc, [key, arr]) => {
  acc[key as keyof typeof Strings] = '0x' + Buffer.from(arr).toString('hex')
  return acc
}, {} as { [K in keyof typeof Strings]: string })

const U8Arrays = Object.entries(U8NumberArrays).reduce((acc, [key, arr]) => {
  acc[key as keyof typeof Strings] = Uint8Array.from(arr)
  return acc
}, {} as { [K in keyof typeof Strings]: Uint8Array })

const U16Arrays = Object.entries(U16NumberArrays).reduce((acc, [key, arr]) => {
  acc[key as keyof typeof Strings] = Uint16Array.from(arr)
  return acc
}, {} as { [K in keyof typeof Strings]: Uint16Array })


const hexStringTestData: Array<{ hex: string, num: number[], u8a: Uint8Array }> = [
  {
    hex: '0xf09f91a8f09f8fbce2808df09f91a9f09f8fbce2808df09f91a7f09f8fbce2808df09f91a7f09f8fbc',
    num: U8NumberArrays.emoji,
    u8a: U8Arrays.emoji,
  },
  {hex: '0x', num: [] as number[], u8a: new Uint8Array(0),},
  {hex: '', num: [] as number[], u8a: new Uint8Array(0),},
  {hex: '1', num: [16], u8a: Uint8Array.from([16]),},
  {hex: 'aa', num: [0xaa], u8a: Uint8Array.from([0xaa]),},
  {hex: '0x009', num: [0, 0x90], u8a: Uint8Array.from([0, 0x90]),},
  {hex: '0xf', num: [0xf0], u8a: Uint8Array.from([0xf0]),},
]


describe('string', () => {
  test.concurrent('imports', () => {
    expect(UtfHelpers.HexString).toBe(HexString)
    expect(UtfHelpers.Utf8).toBe(Utf8)
    expect(UtfHelpers.Utf16).toBe(Utf16)
  })

  test.concurrent('HexString', () => {
    for (let example of hexStringTestData) {
      let hex = (example.hex.length % 2 === 0) ? example.hex : example.hex + '0'

      if (example.hex.startsWith('0x')) {
        expect(UtfHelpers.HexString.fromArray(example.num)).toEqual(hex)
        expect(UtfHelpers.HexString.fromU8a(example.u8a)).toEqual(hex)

        hex = hex.slice(2)

        expect(UtfHelpers.HexString.toArray(hex)).toEqual(example.num)
        expect(UtfHelpers.HexString.toU8a(hex)).toEqual(example.u8a)
      } else {
        expect(UtfHelpers.HexString.toArray(hex)).toEqual(example.num)
        expect(UtfHelpers.HexString.toU8a(hex)).toEqual(example.u8a)

        hex = '0x' + hex

        expect(UtfHelpers.HexString.fromArray(example.num)).toEqual(hex)
        expect(UtfHelpers.HexString.fromU8a(example.u8a)).toEqual(hex)
      }
    }
  })

  test.concurrent('Utf8', () => {
    for (let key of keys) {
      expect(UtfHelpers.Utf8.stringToU8a(Strings[key])).toEqual(U8Arrays[key])
      expect(UtfHelpers.Utf8.u8aToString(U8Arrays[key])).toEqual(Strings[key])

      expect(UtfHelpers.Utf8.stringToNumberArray(Strings[key])).toEqual(U8NumberArrays[key])
      expect(UtfHelpers.Utf8.numberArrayToString(U8Arrays[key])).toEqual(Strings[key])

      expect(UtfHelpers.Utf8.stringToHexString(Strings[key])).toEqual(HexUtf8Strings[key])
      expect(UtfHelpers.Utf8.hexStringToString(HexUtf8Strings[key])).toEqual(Strings[key])

      expect(UtfHelpers.Utf8.lengthInBytes(Strings[key])).toEqual(U8Arrays[key].length)
    }
  })

  test.concurrent('Utf16', () => {
    for (let key of keys) {
      expect(UtfHelpers.Utf16.stringToU16a(Strings[key])).toEqual(U16Arrays[key])
      expect(UtfHelpers.Utf16.u16aToString(U16Arrays[key])).toEqual(Strings[key])

      expect(UtfHelpers.Utf16.stringToNumberArray(Strings[key])).toEqual(U16NumberArrays[key])
      expect(UtfHelpers.Utf16.numberArrayToString(U16NumberArrays[key])).toEqual(Strings[key])

      expect(UtfHelpers.Utf16.lengthInBytes(Strings[key])).toEqual(U16NumberArrays[key].length)
    }
  })
})
