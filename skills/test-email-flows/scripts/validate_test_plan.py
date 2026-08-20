#!/usr/bin/env python3
import json
import os
import stat
import sys

ALLOWED = {"schemaVersion", "command", "result", "environment", "targetCount", "commandArgumentCount", "authorizationEvidencePresent"}

def fail():
    print("invalid plan", file=sys.stderr)
    raise SystemExit(1)

if len(sys.argv) != 2:
    fail()
try:
    info = os.lstat(sys.argv[1])
    if not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode) or info.st_size < 2 or info.st_size > 16384:
        fail()
    with open(sys.argv[1], "r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict) or set(value) != ALLOWED:
        fail()
    if value != {"schemaVersion": 1, "command": "plan", "result": "passed", "environment": value.get("environment"),
                 "targetCount": 1, "commandArgumentCount": value.get("commandArgumentCount"), "authorizationEvidencePresent": True}:
        fail()
    if value["environment"] not in {"local", "test", "staging"}:
        fail()
    if not isinstance(value["commandArgumentCount"], int) or isinstance(value["commandArgumentCount"], bool) or not 1 <= value["commandArgumentCount"] <= 32:
        fail()
except (OSError, UnicodeError, json.JSONDecodeError, TypeError, ValueError):
    fail()
print("valid")
