

# ApiError


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**code** | [**CodeEnum**](#CodeEnum) |  |  |
|**message** | **String** |  |  |
|**retryable** | **Boolean** |  |  |



## Enum: CodeEnum

| Name | Value |
|---- | -----|
| INVALID_REQUEST | &quot;invalid_request&quot; |
| AUTHENTICATION_REQUIRED | &quot;authentication_required&quot; |
| ACCESS_DENIED | &quot;access_denied&quot; |
| NOT_FOUND | &quot;not_found&quot; |
| IDEMPOTENCY_IN_PROGRESS | &quot;idempotency_in_progress&quot; |
| RESPONSE_TOO_LARGE | &quot;response_too_large&quot; |
| RATE_LIMITED | &quot;rate_limited&quot; |
| SERVICE_UNAVAILABLE | &quot;service_unavailable&quot; |
| INTERNAL_ERROR | &quot;internal_error&quot; |



