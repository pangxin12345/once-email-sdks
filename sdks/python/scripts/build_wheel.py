#!/usr/bin/env python3
import argparse
import base64
import csv
import hashlib
import io
import zipfile
from pathlib import Path

NAME = "once_email"
VERSION = "0.1.0.dev2"
DIST_INFO = f"{NAME}-{VERSION}.dist-info"
STAMP = (2026, 8, 15, 0, 0, 0)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output-dir", required=True)
    args = parser.parse_args()
    source = Path(args.source)
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    target = output / f"{NAME}-{VERSION}-py3-none-any.whl"
    files = {}
    for path in sorted((source / NAME).glob("*.py")):
        files[f"{NAME}/{path.name}"] = path.read_bytes()
    files[f"{DIST_INFO}/METADATA"] = (f"Metadata-Version: 2.3\nName: once-email\nVersion: {VERSION}\n"
                                              "Summary: Private candidate Python client for the Once Email Developer API\n"
                                              "Requires-Python: >=3.11\n").encode()
    files[f"{DIST_INFO}/WHEEL"] = b"Wheel-Version: 1.0\nGenerator: once-email-stdlib-builder\nRoot-Is-Purelib: true\nTag: py3-none-any\n"
    files[f"{DIST_INFO}/top_level.txt"] = b"once_email\n"
    rows = []
    for name, data in files.items():
        digest = base64.urlsafe_b64encode(hashlib.sha256(data).digest()).rstrip(b"=").decode()
        rows.append((name, f"sha256={digest}", str(len(data))))
    record_name = f"{DIST_INFO}/RECORD"
    rows.append((record_name, "", ""))
    buffer = io.StringIO(newline="")
    csv.writer(buffer, lineterminator="\n").writerows(rows)
    files[record_name] = buffer.getvalue().encode()
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name in sorted(files):
            info = zipfile.ZipInfo(name, STAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, files[name])
    print(target)

if __name__ == "__main__":
    main()
