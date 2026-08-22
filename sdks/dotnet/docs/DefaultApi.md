# OnceEmail.Sdk.Api.DefaultApi

All URIs are relative to *https://api.once-email.com*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**CreateInbox**](DefaultApi.md#createinbox) | **POST** /v1/inboxes | Create one temporary test inbox |
| [**DeleteInbox**](DefaultApi.md#deleteinbox) | **DELETE** /v1/inboxes/{inboxId} | Delete an owned inbox and its messages |
| [**DownloadAttachment**](DefaultApi.md#downloadattachment) | **GET** /v1/inboxes/{inboxId}/messages/{uid}/attachments/{cid} | Download one attachment from an owned received message |
| [**GetMessage**](DefaultApi.md#getmessage) | **GET** /v1/inboxes/{inboxId}/messages/{uid} | Read one received message |
| [**ListMessages**](DefaultApi.md#listmessages) | **GET** /v1/inboxes/{inboxId}/messages | List received message summaries |

<a id="createinbox"></a>
# **CreateInbox**
> Inbox CreateInbox (string? idempotencyKey = null)

Create one temporary test inbox

### Example
```csharp
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using OnceEmail.Sdk.Api;
using OnceEmail.Sdk.Client;
using OnceEmail.Sdk.Model;

namespace Example
{
    public class CreateInboxExample
    {
        public static void Main()
        {
            Configuration config = new Configuration();
            config.BasePath = "https://api.once-email.com";
            // Configure Bearer token for authorization: bearerApiKey
            config.AccessToken = Environment.GetEnvironmentVariable("ONCE_EMAIL_API_KEY");

            // create instances of HttpClient, HttpClientHandler to be reused later with different Api classes
            HttpClient httpClient = new HttpClient();
            HttpClientHandler httpClientHandler = new HttpClientHandler();
            var apiInstance = new DefaultApi(httpClient, config, httpClientHandler);
            var idempotencyKey = "idempotencyKey_example";  // string? | Stable key for safely retrying inbox creation; valid while the created inbox remains available (optional) 

            try
            {
                // Create one temporary test inbox
                Inbox result = apiInstance.CreateInbox(idempotencyKey);
                Debug.WriteLine("Request completed; sensitive fields withheld");
            }
            catch (ApiException  e)
            {
                Debug.Print("Exception when calling DefaultApi.CreateInbox: " + e.Message);
                Debug.Print("Status Code: " + e.ErrorCode);
                Debug.Print(e.StackTrace);
            }
        }
    }
}
```

#### Using the CreateInboxWithHttpInfo variant
This returns an ApiResponse object which contains the response data, status code and headers.

```csharp
try
{
    // Create one temporary test inbox
    ApiResponse<Inbox> response = apiInstance.CreateInboxWithHttpInfo(idempotencyKey);
    Debug.Write("Status Code: " + response.StatusCode);
    Debug.Write("Response Headers: " + response.Headers);
    Debug.Write("Response Body: " + response.Data);
}
catch (ApiException e)
{
    Debug.Print("Exception when calling DefaultApi.CreateInboxWithHttpInfo: " + e.Message);
    Debug.Print("Status Code: " + e.ErrorCode);
    Debug.Print(e.StackTrace);
}
```

### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **idempotencyKey** | **string?** | Stable key for safely retrying inbox creation; valid while the created inbox remains available | [optional]  |

### Return type

[**Inbox**](Inbox.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Inbox created |  * Cache-Control -  <br>  |
| **401** | Missing or invalid API key |  -  |
| **403** | Inactive subscription, frozen account, or resource ownership failure |  -  |
| **409** | A matching creation request is still in progress |  * Retry-After -  <br>  |
| **429** | Rate or monthly allowance exceeded |  * Retry-After -  <br>  |
| **503** | Required dependency unavailable |  * Retry-After -  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a id="deleteinbox"></a>
# **DeleteInbox**
> void DeleteInbox (Guid inboxId)

Delete an owned inbox and its messages

### Example
```csharp
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using OnceEmail.Sdk.Api;
using OnceEmail.Sdk.Client;
using OnceEmail.Sdk.Model;

namespace Example
{
    public class DeleteInboxExample
    {
        public static void Main()
        {
            Configuration config = new Configuration();
            config.BasePath = "https://api.once-email.com";
            // Configure Bearer token for authorization: bearerApiKey
            config.AccessToken = Environment.GetEnvironmentVariable("ONCE_EMAIL_API_KEY");

            // create instances of HttpClient, HttpClientHandler to be reused later with different Api classes
            HttpClient httpClient = new HttpClient();
            HttpClientHandler httpClientHandler = new HttpClientHandler();
            var apiInstance = new DefaultApi(httpClient, config, httpClientHandler);
            var inboxId = "inboxId_example";  // Guid | 

            try
            {
                // Delete an owned inbox and its messages
                apiInstance.DeleteInbox(inboxId);
            }
            catch (ApiException  e)
            {
                Debug.Print("Exception when calling DefaultApi.DeleteInbox: " + e.Message);
                Debug.Print("Status Code: " + e.ErrorCode);
                Debug.Print(e.StackTrace);
            }
        }
    }
}
```

#### Using the DeleteInboxWithHttpInfo variant
This returns an ApiResponse object which contains the response data, status code and headers.

```csharp
try
{
    // Delete an owned inbox and its messages
    apiInstance.DeleteInboxWithHttpInfo(inboxId);
}
catch (ApiException e)
{
    Debug.Print("Exception when calling DefaultApi.DeleteInboxWithHttpInfo: " + e.Message);
    Debug.Print("Status Code: " + e.ErrorCode);
    Debug.Print(e.StackTrace);
}
```

### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **inboxId** | **Guid** |  |  |

### Return type

void (empty response body)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Inbox deleted; repeating the delete for the same owned inbox is safe |  * Cache-Control -  <br>  |
| **400** | Invalid request |  -  |
| **401** | Missing or invalid API key |  -  |
| **403** | Inactive subscription, frozen account, or resource ownership failure |  -  |
| **404** | Resource missing or expired |  -  |
| **429** | Rate or monthly allowance exceeded |  * Retry-After -  <br>  |
| **503** | Required dependency unavailable |  * Retry-After -  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a id="downloadattachment"></a>
# **DownloadAttachment**
> string DownloadAttachment (Guid inboxId, long uid, string cid)

Download one attachment from an owned received message

### Example
```csharp
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using OnceEmail.Sdk.Api;
using OnceEmail.Sdk.Client;
using OnceEmail.Sdk.Model;

namespace Example
{
    public class DownloadAttachmentExample
    {
        public static void Main()
        {
            Configuration config = new Configuration();
            config.BasePath = "https://api.once-email.com";
            // Configure Bearer token for authorization: bearerApiKey
            config.AccessToken = Environment.GetEnvironmentVariable("ONCE_EMAIL_API_KEY");

            // create instances of HttpClient, HttpClientHandler to be reused later with different Api classes
            HttpClient httpClient = new HttpClient();
            HttpClientHandler httpClientHandler = new HttpClientHandler();
            var apiInstance = new DefaultApi(httpClient, config, httpClientHandler);
            var inboxId = "inboxId_example";  // Guid | 
            var uid = 789L;  // long | 
            var cid = "cid_example";  // string | 

            try
            {
                // Download one attachment from an owned received message
                string result = apiInstance.DownloadAttachment(inboxId, uid, cid);
                Debug.WriteLine("Request completed; sensitive fields withheld");
            }
            catch (ApiException  e)
            {
                Debug.Print("Exception when calling DefaultApi.DownloadAttachment: " + e.Message);
                Debug.Print("Status Code: " + e.ErrorCode);
                Debug.Print(e.StackTrace);
            }
        }
    }
}
```

#### Using the DownloadAttachmentWithHttpInfo variant
This returns an ApiResponse object which contains the response data, status code and headers.

```csharp
try
{
    // Download one attachment from an owned received message
    ApiResponse<string> response = apiInstance.DownloadAttachmentWithHttpInfo(inboxId, uid, cid);
    Debug.Write("Status Code: " + response.StatusCode);
    Debug.Write("Response Headers: " + response.Headers);
    Debug.Write("Response Body: " + response.Data);
}
catch (ApiException e)
{
    Debug.Print("Exception when calling DefaultApi.DownloadAttachmentWithHttpInfo: " + e.Message);
    Debug.Print("Status Code: " + e.ErrorCode);
    Debug.Print(e.StackTrace);
}
```

### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **inboxId** | **Guid** |  |  |
| **uid** | **long** |  |  |
| **cid** | **string** |  |  |

### Return type

**string**

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/octet-stream, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Attachment bytes, at most 10485760 bytes |  * Cache-Control -  <br>  |
| **400** | Invalid request |  -  |
| **401** | Missing or invalid API key |  -  |
| **403** | Inactive subscription, frozen account, or resource ownership failure |  -  |
| **404** | Resource missing or expired |  -  |
| **413** | Requested message or attachment exceeds the explicit response limit |  -  |
| **429** | Rate or monthly allowance exceeded |  * Retry-After -  <br>  |
| **503** | Required dependency unavailable |  * Retry-After -  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a id="getmessage"></a>
# **GetMessage**
> Message GetMessage (Guid inboxId, long uid)

Read one received message

### Example
```csharp
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using OnceEmail.Sdk.Api;
using OnceEmail.Sdk.Client;
using OnceEmail.Sdk.Model;

namespace Example
{
    public class GetMessageExample
    {
        public static void Main()
        {
            Configuration config = new Configuration();
            config.BasePath = "https://api.once-email.com";
            // Configure Bearer token for authorization: bearerApiKey
            config.AccessToken = Environment.GetEnvironmentVariable("ONCE_EMAIL_API_KEY");

            // create instances of HttpClient, HttpClientHandler to be reused later with different Api classes
            HttpClient httpClient = new HttpClient();
            HttpClientHandler httpClientHandler = new HttpClientHandler();
            var apiInstance = new DefaultApi(httpClient, config, httpClientHandler);
            var inboxId = "inboxId_example";  // Guid | 
            var uid = 789L;  // long | 

            try
            {
                // Read one received message
                Message result = apiInstance.GetMessage(inboxId, uid);
                Debug.WriteLine("Request completed; sensitive fields withheld");
            }
            catch (ApiException  e)
            {
                Debug.Print("Exception when calling DefaultApi.GetMessage: " + e.Message);
                Debug.Print("Status Code: " + e.ErrorCode);
                Debug.Print(e.StackTrace);
            }
        }
    }
}
```

#### Using the GetMessageWithHttpInfo variant
This returns an ApiResponse object which contains the response data, status code and headers.

```csharp
try
{
    // Read one received message
    ApiResponse<Message> response = apiInstance.GetMessageWithHttpInfo(inboxId, uid);
    Debug.Write("Status Code: " + response.StatusCode);
    Debug.Write("Response Headers: " + response.Headers);
    Debug.Write("Response Body: " + response.Data);
}
catch (ApiException e)
{
    Debug.Print("Exception when calling DefaultApi.GetMessageWithHttpInfo: " + e.Message);
    Debug.Print("Status Code: " + e.ErrorCode);
    Debug.Print(e.StackTrace);
}
```

### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **inboxId** | **Guid** |  |  |
| **uid** | **long** |  |  |

### Return type

[**Message**](Message.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Message |  * Cache-Control -  <br>  |
| **400** | Invalid request |  -  |
| **401** | Missing or invalid API key |  -  |
| **403** | Inactive subscription, frozen account, or resource ownership failure |  -  |
| **404** | Resource missing or expired |  -  |
| **413** | Requested message or attachment exceeds the explicit response limit |  -  |
| **429** | Rate or monthly allowance exceeded |  * Retry-After -  <br>  |
| **503** | Required dependency unavailable |  * Retry-After -  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a id="listmessages"></a>
# **ListMessages**
> List&lt;MessageSummary&gt; ListMessages (Guid inboxId, DateTime? since = null, string? cursor = null, int? pageSize = null)

List received message summaries

### Example
```csharp
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using OnceEmail.Sdk.Api;
using OnceEmail.Sdk.Client;
using OnceEmail.Sdk.Model;

namespace Example
{
    public class ListMessagesExample
    {
        public static void Main()
        {
            Configuration config = new Configuration();
            config.BasePath = "https://api.once-email.com";
            // Configure Bearer token for authorization: bearerApiKey
            config.AccessToken = Environment.GetEnvironmentVariable("ONCE_EMAIL_API_KEY");

            // create instances of HttpClient, HttpClientHandler to be reused later with different Api classes
            HttpClient httpClient = new HttpClient();
            HttpClientHandler httpClientHandler = new HttpClientHandler();
            var apiInstance = new DefaultApi(httpClient, config, httpClientHandler);
            var inboxId = "inboxId_example";  // Guid | 
            var since = DateTime.Parse("2013-10-20T19:20:30+01:00");  // DateTime? | Return messages received strictly after this instant (optional) 
            var cursor = "cursor_example";  // string? | Opaque continuation cursor returned in X-Next-Cursor (optional) 
            var pageSize = 50;  // int? |  (optional)  (default to 50)

            try
            {
                // List received message summaries
                List<MessageSummary> result = apiInstance.ListMessages(inboxId, since, cursor, pageSize);
                Debug.WriteLine("Request completed; sensitive fields withheld");
            }
            catch (ApiException  e)
            {
                Debug.Print("Exception when calling DefaultApi.ListMessages: " + e.Message);
                Debug.Print("Status Code: " + e.ErrorCode);
                Debug.Print(e.StackTrace);
            }
        }
    }
}
```

#### Using the ListMessagesWithHttpInfo variant
This returns an ApiResponse object which contains the response data, status code and headers.

```csharp
try
{
    // List received message summaries
    ApiResponse<List<MessageSummary>> response = apiInstance.ListMessagesWithHttpInfo(inboxId, since, cursor, pageSize);
    Debug.Write("Status Code: " + response.StatusCode);
    Debug.Write("Response Headers: " + response.Headers);
    Debug.Write("Response Body: " + response.Data);
}
catch (ApiException e)
{
    Debug.Print("Exception when calling DefaultApi.ListMessagesWithHttpInfo: " + e.Message);
    Debug.Print("Status Code: " + e.ErrorCode);
    Debug.Print(e.StackTrace);
}
```

### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **inboxId** | **Guid** |  |  |
| **since** | **DateTime?** | Return messages received strictly after this instant | [optional]  |
| **cursor** | **string?** | Opaque continuation cursor returned in X-Next-Cursor | [optional]  |
| **pageSize** | **int?** |  | [optional] [default to 50] |

### Return type

[**List&lt;MessageSummary&gt;**](MessageSummary.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Message summaries ordered by received time and UID |  * Cache-Control -  <br>  * X-Next-Cursor - Opaque continuation cursor; absent when the page is complete <br>  |
| **400** | Invalid request |  -  |
| **401** | Missing or invalid API key |  -  |
| **403** | Inactive subscription, frozen account, or resource ownership failure |  -  |
| **404** | Resource missing or expired |  -  |
| **429** | Rate or monthly allowance exceeded |  * Retry-After -  <br>  |
| **503** | Required dependency unavailable |  * Retry-After -  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

