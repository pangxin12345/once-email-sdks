# \DefaultAPI

All URIs are relative to *https://api.once-email.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateInbox**](DefaultAPI.md#CreateInbox) | **Post** /v1/inboxes | Create one temporary test inbox
[**DeleteInbox**](DefaultAPI.md#DeleteInbox) | **Delete** /v1/inboxes/{inboxId} | Delete an owned inbox and its messages
[**DownloadAttachment**](DefaultAPI.md#DownloadAttachment) | **Get** /v1/inboxes/{inboxId}/messages/{uid}/attachments/{cid} | Download one attachment from an owned received message
[**GetMessage**](DefaultAPI.md#GetMessage) | **Get** /v1/inboxes/{inboxId}/messages/{uid} | Read one received message
[**ListMessages**](DefaultAPI.md#ListMessages) | **Get** /v1/inboxes/{inboxId}/messages | List received message summaries



## CreateInbox

> Inbox CreateInbox(ctx).IdempotencyKey(idempotencyKey).Execute()

Create one temporary test inbox

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	idempotencyKey := "idempotencyKey_example" // string | Stable key for safely retrying inbox creation; valid while the created inbox remains available (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.CreateInbox(context.Background()).IdempotencyKey(idempotencyKey).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.CreateInbox``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateInbox`: Inbox
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.CreateInbox`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateInboxRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **string** | Stable key for safely retrying inbox creation; valid while the created inbox remains available | 

### Return type

[**Inbox**](Inbox.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteInbox

> DeleteInbox(ctx, inboxId).Execute()

Delete an owned inbox and its messages

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	inboxId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.DefaultAPI.DeleteInbox(context.Background(), inboxId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.DeleteInbox``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**inboxId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteInboxRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

 (empty response body)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DownloadAttachment

> string DownloadAttachment(ctx, inboxId, uid, cid).Execute()

Download one attachment from an owned received message

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	inboxId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	uid := int64(789) // int64 | 
	cid := "cid_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.DownloadAttachment(context.Background(), inboxId, uid, cid).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.DownloadAttachment``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DownloadAttachment`: string
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.DownloadAttachment`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**inboxId** | **string** |  | 
**uid** | **int64** |  | 
**cid** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiDownloadAttachmentRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------




### Return type

**string**

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/octet-stream, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetMessage

> Message GetMessage(ctx, inboxId, uid).Execute()

Read one received message

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	inboxId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	uid := int64(789) // int64 | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.GetMessage(context.Background(), inboxId, uid).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.GetMessage``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetMessage`: Message
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.GetMessage`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**inboxId** | **string** |  | 
**uid** | **int64** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetMessageRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------



### Return type

[**Message**](Message.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListMessages

> []MessageSummary ListMessages(ctx, inboxId).Since(since).Cursor(cursor).PageSize(pageSize).Execute()

List received message summaries

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
    "time"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	inboxId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	since := time.Now() // time.Time | Return messages received strictly after this instant (optional)
	cursor := "cursor_example" // string | Opaque continuation cursor returned in X-Next-Cursor (optional)
	pageSize := int32(56) // int32 |  (optional) (default to 50)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.ListMessages(context.Background(), inboxId).Since(since).Cursor(cursor).PageSize(pageSize).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.ListMessages``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListMessages`: []MessageSummary
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.ListMessages`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**inboxId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiListMessagesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **since** | **time.Time** | Return messages received strictly after this instant | 
 **cursor** | **string** | Opaque continuation cursor returned in X-Next-Cursor | 
 **pageSize** | **int32** |  | [default to 50]

### Return type

[**[]MessageSummary**](MessageSummary.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

