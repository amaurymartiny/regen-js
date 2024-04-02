/**
* This file and any referenced files were automatically generated by @cosmology/telescope@1.5.2
* DO NOT MODIFY BY HAND. Instead, download the latest proto files for your chain
* and run the transpile command or yarn proto command to regenerate this bundle.
*/


// Copyright (c) 2016, Daniel Wirtz  All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:

// * Redistributions of source code must retain the above copyright
//   notice, this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright
//   notice, this list of conditions and the following disclaimer in the
//   documentation and/or other materials provided with the distribution.
// * Neither the name of its author, nor the names of its contributors
//   may be used to endorse or promote products derived from this software
//   without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// ---

// Code generated by the command line utilities is owned by the owner
// of the input file used when generating it. This code is not
// standalone and requires a support library to be linked with it. This
// support library is itself covered by the above license.

import { utf8Length, utf8Read, utf8Write } from "./utf8";
import {
  int64ToString,
  readInt32,
  readUInt32,
  uInt64ToString,
  varint32read,
  varint64read,
  writeVarint32,
  writeVarint64,
  int64FromString,
  int64Length,
  writeFixed32,
  writeByte,
  zzDecode,
  zzEncode,
} from "./varint";

export enum WireType {
  Varint = 0,

  Fixed64 = 1,

  Bytes = 2,

  Fixed32 = 5,
}

// Reader
export interface IBinaryReader {
  buf: Uint8Array;
  pos: number;
  type: number;
  len: number;
  tag(): [number, WireType, number];
  skip(length?: number): this;
  skipType(wireType: number): this;
  uint32(): number;
  int32(): number;
  sint32(): number;
  fixed32(): number;
  sfixed32(): number;
  int64(): bigint;
  uint64(): bigint;
  sint64(): bigint;
  fixed64(): bigint;
  sfixed64(): bigint;
  float(): number;
  double(): number;
  bool(): boolean;
  bytes(): Uint8Array;
  string(): string;
}

export class BinaryReader implements IBinaryReader {
  buf: Uint8Array;
  pos: number;
  type: number;
  len: number;

  assertBounds(): void {
    if (this.pos > this.len) throw new RangeError("premature EOF");
  }

  constructor(buf?: ArrayLike<number>) {
    this.buf = buf ? new Uint8Array(buf) : new Uint8Array(0);
    this.pos = 0;
    this.type = 0;
    this.len = this.buf.length;
  }

  tag(): [number, WireType, number] {
    const tag = this.uint32(),
      fieldNo = tag >>> 3,
      wireType = tag & 7;
    if (fieldNo <= 0 || wireType < 0 || wireType > 5)
      throw new Error(
        "illegal tag: field no " + fieldNo + " wire type " + wireType
      );
    return [fieldNo, wireType, tag];
  }

  skip(length?: number) {
    if (typeof length === "number") {
      if (this.pos + length > this.len) throw indexOutOfRange(this, length);
      this.pos += length;
    } else {
      do {
        if (this.pos >= this.len) throw indexOutOfRange(this);
      } while (this.buf[this.pos++] & 128);
    }
    return this;
  }

  skipType(wireType: number) {
    switch (wireType) {
      case WireType.Varint:
        this.skip();
        break;
      case WireType.Fixed64:
        this.skip(8);
        break;
      case WireType.Bytes:
        this.skip(this.uint32());
        break;
      case 3:
        while ((wireType = this.uint32() & 7) !== 4) {
          this.skipType(wireType);
        }
        break;
      case WireType.Fixed32:
        this.skip(4);
        break;

      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
  }

  uint32(): number {
    return varint32read.bind(this)();
  }

  int32(): number {
    return this.uint32() | 0;
  }

  sint32(): number {
    const num = this.uint32();
    return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
  }

  fixed32(): number {
    const val = readUInt32(this.buf, this.pos);
    this.pos += 4;
    return val;
  }

  sfixed32(): number {
    const val = readInt32(this.buf, this.pos);
    this.pos += 4;
    return val;
  }

  int64(): bigint {
    const [lo, hi] = varint64read.bind(this)();
    return BigInt(int64ToString(lo, hi));
  }

  uint64(): bigint {
    const [lo, hi] = varint64read.bind(this)();
    return BigInt(uInt64ToString(lo, hi));
  }

  sint64(): bigint {
    let [lo, hi] = varint64read.bind(this)();
    // zig zag
    [lo, hi] = zzDecode(lo, hi);
    return BigInt(int64ToString(lo, hi));
  }

  fixed64(): bigint {
    const lo = this.sfixed32();
    const hi = this.sfixed32();
    return BigInt(uInt64ToString(lo, hi));
  }
  sfixed64(): bigint {
    const lo = this.sfixed32();
    const hi = this.sfixed32();
    return BigInt(int64ToString(lo, hi));
  }

  float(): number {
    throw new Error("float not supported");
  }

  double(): number {
    throw new Error("double not supported");
  }

  bool(): boolean {
    const [lo, hi] = varint64read.bind(this)();
    return lo !== 0 || hi !== 0;
  }

  bytes(): Uint8Array {
    const len = this.uint32(),
      start = this.pos;
    this.pos += len;
    this.assertBounds();
    return this.buf.subarray(start, start + len);
  }

  string(): string {
    const bytes = this.bytes();
    return utf8Read(bytes, 0, bytes.length);
  }
}

// Writer
export interface IBinaryWriter {
  len: number;
  head: IOp;
  tail: IOp;
  states: State | null;
  finish(): Uint8Array;
  fork(): IBinaryWriter;
  reset(): IBinaryWriter;
  ldelim(): IBinaryWriter;
  tag(fieldNo: number, type: WireType): IBinaryWriter;
  uint32(value: number): IBinaryWriter;
  int32(value: number): IBinaryWriter;
  sint32(value: number): IBinaryWriter;
  int64(value: string | number | bigint): IBinaryWriter;
  uint64: (value: string | number | bigint) => IBinaryWriter;
  sint64(value: string | number | bigint): IBinaryWriter;
  fixed64(value: string | number | bigint): IBinaryWriter;
  sfixed64: (value: string | number | bigint) => IBinaryWriter;
  bool(value: boolean): IBinaryWriter;
  fixed32(value: number): IBinaryWriter;
  sfixed32: (value: number) => IBinaryWriter;
  float(value: number): IBinaryWriter;
  double(value: number): IBinaryWriter;
  bytes(value: Uint8Array): IBinaryWriter;
  string(value: string): IBinaryWriter;
}

interface IOp {
  len: number;
  next?: IOp;
  proceed(buf: Uint8Array | number[], pos: number): void;
}

class Op<T> implements IOp {
  fn?: ((val: T, buf: Uint8Array | number[], pos: number) => void) | null;
  len: number;
  val: T;
  next?: IOp;

  constructor(
    fn:
      | ((
          val: T,
          buf: Uint8Array | number[],
          pos: number
        ) => void | undefined | null)
      | null,
    len: number,
    val: T
  ) {
    this.fn = fn;
    this.len = len;
    this.val = val;
  }

  proceed(buf: Uint8Array | number[], pos: number) {
    if (this.fn) {
      this.fn(this.val, buf, pos);
    }
  }
}

class State {
  head: IOp;
  tail: IOp;
  len: number;
  next: State | null;

  constructor(writer: BinaryWriter) {
    this.head = writer.head;
    this.tail = writer.tail;
    this.len = writer.len;
    this.next = writer.states;
  }
}

export class BinaryWriter implements IBinaryWriter {
  len = 0;
  head: IOp;
  tail: IOp;
  states: State | null;

  constructor() {
    this.head = new Op(null, 0, 0);
    this.tail = this.head;
    this.states = null;
  }

  static create() {
    return new BinaryWriter();
  }

  static alloc(size: number): Uint8Array | number[] {
    if (typeof Uint8Array !== "undefined") {
      return pool(
        (size) => new Uint8Array(size),
        Uint8Array.prototype.subarray
      )(size);
    } else {
      return new Array(size);
    }
  }

  private _push<T>(
    fn: (val: T, buf: Uint8Array | number[], pos: number) => void,
    len: number,
    val: T
  ) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
  }

  finish(): Uint8Array {
    let head = this.head.next,
      pos = 0;
    const buf = BinaryWriter.alloc(this.len);
    while (head) {
      head.proceed(buf, pos);
      pos += head.len;
      head = head.next;
    }
    return buf as Uint8Array;
  }

  fork(): BinaryWriter {
    this.states = new State(this);
    this.head = this.tail = new Op(null, 0, 0);
    this.len = 0;
    return this;
  }

  reset(): BinaryWriter {
    if (this.states) {
      this.head = this.states.head;
      this.tail = this.states.tail;
      this.len = this.states.len;
      this.states = this.states.next;
    } else {
      this.head = this.tail = new Op(null, 0, 0);
      this.len = 0;
    }
    return this;
  }

  ldelim(): BinaryWriter {
    const head = this.head,
      tail = this.tail,
      len = this.len;
    this.reset().uint32(len);
    if (len) {
      this.tail.next = head.next; // skip noop
      this.tail = tail;
      this.len += len;
    }
    return this;
  }

  tag(fieldNo: number, type: WireType): BinaryWriter {
    return this.uint32(((fieldNo << 3) | type) >>> 0);
  }

  uint32(value: number): BinaryWriter {
    this.len += (this.tail = this.tail.next =
      new Op(
        writeVarint32,
        (value = value >>> 0) < 128
          ? 1
          : value < 16384
          ? 2
          : value < 2097152
          ? 3
          : value < 268435456
          ? 4
          : 5,
        value
      )).len;
    return this;
  }

  int32(value: number): BinaryWriter {
    return value < 0
      ? this._push(writeVarint64, 10, int64FromString(value.toString())) // 10 bytes per spec
      : this.uint32(value);
  }

  sint32(value: number): BinaryWriter {
    return this.uint32(((value << 1) ^ (value >> 31)) >>> 0);
  }

  int64(value: string | number | bigint): BinaryWriter {
    const { lo, hi } = int64FromString(value.toString());
    return this._push(writeVarint64, int64Length(lo, hi), { lo, hi });
  }

  // uint64 is the same with int64
  uint64 = BinaryWriter.prototype.int64;

  sint64(value: string | number | bigint): BinaryWriter {
    let { lo, hi } = int64FromString(value.toString());
    // zig zag
    [lo, hi] = zzEncode(lo, hi);
    return this._push(writeVarint64, int64Length(lo, hi), { lo, hi });
  }

  fixed64(value: string | number | bigint): BinaryWriter {
    const { lo, hi } = int64FromString(value.toString());
    return this._push(writeFixed32, 4, lo)._push(writeFixed32, 4, hi);
  }

  // sfixed64 is the same with fixed64
  sfixed64 = BinaryWriter.prototype.fixed64;

  bool(value: boolean): BinaryWriter {
    return this._push(writeByte, 1, value ? 1 : 0);
  }

  fixed32(value: number): BinaryWriter {
    return this._push(writeFixed32, 4, value >>> 0);
  }

  // sfixed32 is the same with fixed32
  sfixed32 = BinaryWriter.prototype.fixed32;

  float(value: number): BinaryWriter {
    throw new Error("float not supported" + value);
  }

  double(value: number): BinaryWriter {
    throw new Error("double not supported" + value);
  }

  bytes(value: Uint8Array): BinaryWriter {
    const len = value.length >>> 0;
    if (!len) return this._push(writeByte, 1, 0);
    return this.uint32(len)._push(writeBytes, len, value);
  }

  string(value: string): BinaryWriter {
    const len = utf8Length(value);
    return len
      ? this.uint32(len)._push(utf8Write, len, value)
      : this._push(writeByte, 1, 0);
  }
}

function writeBytes(
  val: Uint8Array | number[],
  buf: Uint8Array | number[],
  pos: number
) {
  if (typeof Uint8Array !== "undefined") {
    (buf as Uint8Array).set(val, pos);
  } else {
    for (let i = 0; i < val.length; ++i) buf[pos + i] = val[i];
  }
}

function pool(
  alloc: (size: number) => Uint8Array,
  slice: (begin?: number, end?: number) => Uint8Array,
  size?: number
): (size: number) => Uint8Array {
  const SIZE = size || 8192;
  const MAX = SIZE >>> 1;
  let slab: Uint8Array | null = null;
  let offset = SIZE;
  return function pool_alloc(size): Uint8Array {
    if (size < 1 || size > MAX) return alloc(size);
    if (offset + size > SIZE) {
      slab = alloc(SIZE);
      offset = 0;
    }
    const buf: Uint8Array = slice.call(slab, offset, (offset += size));
    if (offset & 7)
      // align to 32 bit
      offset = (offset | 7) + 1;
    return buf;
  };
}

function indexOutOfRange(reader: BinaryReader, writeLength?: number) {
  return RangeError(
    "index out of range: " +
      reader.pos +
      " + " +
      (writeLength || 1) +
      " > " +
      reader.len
  );
}
