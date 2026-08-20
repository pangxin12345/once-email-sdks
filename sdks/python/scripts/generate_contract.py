#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path

SCHEMAS = ("Attachment", "Inbox", "MessageSummary", "Message")

def python_type(schema: dict) -> str:
    kind = schema.get("type")
    if isinstance(kind, list):
        actual = [item for item in kind if item != "null"]
        if len(actual) != 1 or len(actual) == len(kind):
            raise ValueError("unsupported nullable schema")
        return python_type({**schema, "type": actual[0]}) + " | None"
    if "$ref" in schema:
        return schema["$ref"].rsplit("/", 1)[-1]
    if kind == "string": return "str"
    if kind == "integer": return "int"
    if kind == "boolean": return "bool"
    if kind == "array": return f"list[{python_type(schema['items'])}]"
    raise ValueError("unsupported OpenAPI type")

def render(source: Path) -> str:
    raw = source.read_bytes()
    contract = json.loads(raw)
    operations = {}
    for path, methods in contract["paths"].items():
        for method, operation in methods.items():
            if method not in {"get", "post", "delete"}: continue
            operation_id = operation.get("operationId")
            if not operation_id: raise ValueError("operationId required")
            success = [int(code) for code in operation["responses"] if code.isdigit() and 200 <= int(code) < 300]
            if len(success) != 1: raise ValueError("one success status required")
            operations[operation_id] = {"method": method.upper(), "path": path, "success": success[0]}
    expected = {"createInbox", "listMessages", "getMessage", "downloadAttachment", "deleteInbox"}
    if set(operations) != expected: raise ValueError("operation set changed")
    lines = ["# Generated from the repository OpenAPI. Do not edit.", "from typing import TypedDict", "",
             f"OPENAPI_VERSION = {contract['info']['version']!r}",
             f"CONTRACT_SHA256 = {hashlib.sha256(raw).hexdigest()!r}",
             f"OPERATIONS = {operations!r}", ""]
    schemas = contract["components"]["schemas"]
    error_codes = schemas["ApiError"]["properties"]["code"].get("enum")
    if not isinstance(error_codes, list) or not all(isinstance(code, str) for code in error_codes):
        raise ValueError("stable error code enum required")
    lines.extend([f"ERROR_CODES = frozenset({error_codes!r})", ""])
    definitions = {name: {"required": schemas[name].get("required", []), "properties": schemas[name]["properties"]} for name in SCHEMAS}
    lines.extend([f"SCHEMA_DEFINITIONS = {definitions!r}", ""])
    for name in SCHEMAS:
        schema = schemas[name]
        required = set(schema.get("required", []))
        if set(schema["properties"]) != required:
            raise ValueError(f"{name} optional fields are not supported")
        fields = ", ".join(f"{field!r}: {python_type(value)}" for field, value in schema["properties"].items())
        lines.append(f"{name} = TypedDict({name!r}, {{{fields}}})")
        lines.append("")
    return "\n".join(lines)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    Path(args.output).write_text(render(Path(args.source)), encoding="utf-8")

if __name__ == "__main__":
    main()
