#!/usr/bin/env python3
import json
import os
import re
import stat
import sys

TOP = {"schemaVersion", "runId", "flowType", "environment", "result", "errorCode", "stages", "cleanup", "versions"}
STAGE = {"name", "startedAt", "endedAt", "durationMs", "result", "retryCount", "candidateCount", "valueFound"}
ERRORS = {None, "CONFIG_INVALID", "AUTHORIZATION_REJECTED", "TRIGGER_FAILED", "WAIT_TIMEOUT", "AMBIGUOUS_MESSAGE", "EXTRACTION_FAILED", "ASSERTION_FAILED", "API_UNAVAILABLE", "CLEANUP_FAILED"}
STAGE_NAMES = {"inbox-create", "target-trigger", "message-wait", "message-read", "otp-extract", "adapter-assert", "cleanup"}
VERSION_KEYS = {"cli", "configSchema", "apiContract"}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", re.I)
DATE_TIME = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$")
VERSION = re.compile(r"^[0-9A-Za-z.-]{1,40}$")

def fail():
    print("invalid report", file=sys.stderr)
    raise SystemExit(1)

if len(sys.argv) != 2:
    fail()
try:
    info = os.lstat(sys.argv[1])
    if not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode) or info.st_size < 2 or info.st_size > 65536:
        fail()
    with open(sys.argv[1], "r", encoding="utf-8") as handle:
        value = json.load(handle)
    raw = json.dumps(value, separators=(",", ":"))
    if "@" in raw or "http://" in raw or "https://" in raw or re.search(r"oe_live_[A-Za-z0-9_-]+", raw):
        fail()
    if not isinstance(value, dict) or not set(value).issubset(TOP) or not {"schemaVersion", "runId", "flowType", "environment", "result", "stages", "cleanup"}.issubset(value):
        fail()
    if value["schemaVersion"] != 1 or value["flowType"] != "email-otp" or value["environment"] not in {"local", "test", "staging"} or value["result"] not in {"passed", "failed"} or value.get("errorCode") not in ERRORS:
        fail()
    if not isinstance(value["runId"], str) or not UUID.fullmatch(value["runId"]):
        fail()
    if not isinstance(value["stages"], list) or len(value["stages"]) > 12:
        fail()
    for stage in value["stages"]:
        if not isinstance(stage, dict) or not set(stage).issubset(STAGE) or not {"name", "startedAt", "endedAt", "durationMs", "result"}.issubset(stage):
            fail()
        if stage["name"] not in STAGE_NAMES or stage["result"] not in {"passed", "failed", "skipped"}:
            fail()
        if not isinstance(stage["startedAt"], str) or not DATE_TIME.fullmatch(stage["startedAt"]) or not isinstance(stage["endedAt"], str) or not DATE_TIME.fullmatch(stage["endedAt"]):
            fail()
        if not isinstance(stage["durationMs"], int) or isinstance(stage["durationMs"], bool) or not 0 <= stage["durationMs"] <= 600000:
            fail()
        for count in ("retryCount", "candidateCount"):
            if count in stage and (not isinstance(stage[count], int) or isinstance(stage[count], bool) or not 0 <= stage[count] <= 100):
                fail()
        if "valueFound" in stage and not isinstance(stage["valueFound"], bool):
            fail()
    cleanup = value["cleanup"]
    if not isinstance(cleanup, dict) or set(cleanup) != {"attempted", "result"} or not isinstance(cleanup["attempted"], bool) or cleanup["result"] not in {"cleaned", "failed", "not-created"}:
        fail()
    versions = value.get("versions", {})
    if not isinstance(versions, dict) or not set(versions).issubset(VERSION_KEYS) or any(not isinstance(item, str) or not VERSION.fullmatch(item) for item in versions.values()):
        fail()
except (OSError, UnicodeError, json.JSONDecodeError, TypeError, ValueError):
    fail()
print("valid")
