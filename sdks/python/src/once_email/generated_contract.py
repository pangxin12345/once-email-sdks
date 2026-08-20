# Generated from the repository OpenAPI. Do not edit.
from typing import TypedDict

OPENAPI_VERSION = '0.5.0-private-beta'
CONTRACT_SHA256 = '4755ddcae155e4bb16d3ec4bd685f0a0dcc61d5f6d53b2e924ac0435d642573a'
OPERATIONS = {'createInbox': {'method': 'POST', 'path': '/v1/inboxes', 'success': 201}, 'listMessages': {'method': 'GET', 'path': '/v1/inboxes/{inboxId}/messages', 'success': 200}, 'getMessage': {'method': 'GET', 'path': '/v1/inboxes/{inboxId}/messages/{uid}', 'success': 200}, 'downloadAttachment': {'method': 'GET', 'path': '/v1/inboxes/{inboxId}/messages/{uid}/attachments/{cid}', 'success': 200}, 'deleteInbox': {'method': 'DELETE', 'path': '/v1/inboxes/{inboxId}', 'success': 204}}

ERROR_CODES = frozenset(['invalid_request', 'authentication_required', 'access_denied', 'not_found', 'idempotency_in_progress', 'response_too_large', 'rate_limited', 'service_unavailable', 'internal_error'])

SCHEMA_DEFINITIONS = {'Attachment': {'required': ['id', 'fileName', 'size', 'mimeType', 'cid'], 'properties': {'id': {'type': 'integer'}, 'fileName': {'type': 'string'}, 'size': {'type': 'integer', 'format': 'int64', 'minimum': 0}, 'mimeType': {'type': 'string'}, 'cid': {'type': 'string'}}}, 'Inbox': {'required': ['id', 'address', 'expiresAt', 'serverTime'], 'properties': {'id': {'type': 'string', 'format': 'uuid'}, 'address': {'type': 'string', 'format': 'email'}, 'expiresAt': {'type': 'string', 'format': 'date-time'}, 'serverTime': {'type': 'string', 'format': 'date-time'}}}, 'MessageSummary': {'required': ['uid', 'subject', 'from', 'receivedAt', 'attachmentsCount'], 'properties': {'uid': {'type': 'integer', 'format': 'int64'}, 'subject': {'type': 'string'}, 'from': {'type': 'string'}, 'receivedAt': {'type': ['string', 'null'], 'format': 'date-time'}, 'attachmentsCount': {'type': 'integer', 'minimum': 0}}}, 'Message': {'required': ['uid', 'subject', 'from', 'receivedAt', 'attachmentsCount', 'bodyPreview', 'bodyHtml', 'attachments'], 'properties': {'uid': {'type': 'integer', 'format': 'int64'}, 'subject': {'type': 'string'}, 'from': {'type': 'string'}, 'receivedAt': {'type': ['string', 'null'], 'format': 'date-time'}, 'attachmentsCount': {'type': 'integer', 'minimum': 0}, 'bodyPreview': {'type': 'string', 'maxLength': 262144, 'description': 'At most 262144 UTF-8 bytes'}, 'bodyHtml': {'type': 'string', 'maxLength': 2097152, 'description': 'At most 2097152 UTF-8 bytes'}, 'attachments': {'type': 'array', 'maxItems': 100, 'items': {'$ref': '#/components/schemas/Attachment'}}}}}

Attachment = TypedDict('Attachment', {'id': int, 'fileName': str, 'size': int, 'mimeType': str, 'cid': str})

Inbox = TypedDict('Inbox', {'id': str, 'address': str, 'expiresAt': str, 'serverTime': str})

MessageSummary = TypedDict('MessageSummary', {'uid': int, 'subject': str, 'from': str, 'receivedAt': str | None, 'attachmentsCount': int})

Message = TypedDict('Message', {'uid': int, 'subject': str, 'from': str, 'receivedAt': str | None, 'attachmentsCount': int, 'bodyPreview': str, 'bodyHtml': str, 'attachments': list[Attachment]})
