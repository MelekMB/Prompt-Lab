#!/usr/bin/env python3
import struct, zlib, sys, os

def make_png(path, w, h, r, g, b):
    def chunk(name, data):
        crc = zlib.crc32(name + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + name + data + struct.pack(">I", crc)
    ihdr_data = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    raw_rows = b"".join(b"\x00" + bytes([r, g, b] * w) for _ in range(h))
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr_data))
        f.write(chunk(b"IDAT", zlib.compress(raw_rows)))
        f.write(chunk(b"IEND", b""))

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "icon-src.png"
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    make_png(out, 512, 512, 192, 57, 43)
    print(f"Created icon source: {out}")
