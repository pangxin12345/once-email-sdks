# DefaultApi

All URIs are relative to *https://api.once-email.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createInbox**](DefaultApi.md#createInbox) | **POST** /v1/inboxes | Create one temporary test inbox |
| [**createInboxWithHttpInfo**](DefaultApi.md#createInboxWithHttpInfo) | **POST** /v1/inboxes | Create one temporary test inbox |
| [**deleteInbox**](DefaultApi.md#deleteInbox) | **DELETE** /v1/inboxes/{inboxId} | Delete an owned inbox and its messages |
| [**deleteInboxWithHttpInfo**](DefaultApi.md#deleteInboxWithHttpInfo) | **DELETE** /v1/inboxes/{inboxId} | Delete an owned inbox and its messages |
| [**downloadAttachment**](DefaultApi.md#downloadAttachment) | **GET** /v1/inboxes/{inboxId}/messages/{uid}/attachments/{cid} | Download one attachment from an owned received message |
| [**downloadAttachmentWithHttpInfo**](DefaultApi.md#downloadAttachmentWithHttpInfo) | **GET** /v1/inboxes/{inboxId}/messages/{uid}/attachments/{cid} | Download one attachment from an owned received message |
| [**getMessage**](DefaultApi.md#getMessage) | **GET** /v1/inboxes/{inboxId}/messages/{uid} | Read one received message |
| [**getMessageWithHttpInfo**](DefaultApi.md#getMessageWithHttpInfo) | **GET** /v1/inboxes/{inboxId}/messages/{uid} | Read one received message |
| [**listMessages**](DefaultApi.md#listMessages) | **GET** /v1/inboxes/{inboxId}/messages | List received message summaries |
| [**listMessagesWithHttpInfo**](DefaultApi.md#listMessagesWithHttpInfo) | **GET** /v1/inboxes/{inboxId}/messages | List received message summaries |



## createInbox

> Inbox createInbox(idempotencyKey)

Create one temporary test inbox

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        String idempotencyKey = "idempotencyKey_example"; // String | Stable key for safely retrying inbox creation; valid while the created inbox remains available
        try {
            Inbox result = apiInstance.createInbox(idempotencyKey);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#createInbox");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Reason: " + e.getResponseBody());
            System.err.println("Response headers: " + e.getResponseHeaders());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **idempotencyKey** | **String**| Stable key for safely retrying inbox creation; valid while the created inbox remains available | [optional] |

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

## createInboxWithHttpInfo

> ApiResponse<Inbox> createInbox createInboxWithHttpInfo(idempotencyKey)

Create one temporary test inbox

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.ApiResponse;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        String idempotencyKey = "idempotencyKey_example"; // String | Stable key for safely retrying inbox creation; valid while the created inbox remains available
        try {
            ApiResponse<Inbox> response = apiInstance.createInboxWithHttpInfo(idempotencyKey);
            System.out.println("Status code: " + response.getStatusCode());
            System.out.println("Response headers: " + response.getHeaders());
            System.out.println("Response body: " + response.getData());
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#createInbox");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Response headers: " + e.getResponseHeaders());
            System.err.println("Reason: " + e.getResponseBody());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **idempotencyKey** | **String**| Stable key for safely retrying inbox creation; valid while the created inbox remains available | [optional] |

### Return type

ApiResponse<[**Inbox**](Inbox.md)>


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


## deleteInbox

> void deleteInbox(inboxId)

Delete an owned inbox and its messages

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        try {
            apiInstance.deleteInbox(inboxId);
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#deleteInbox");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Reason: " + e.getResponseBody());
            System.err.println("Response headers: " + e.getResponseHeaders());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |

### Return type


null (empty response body)

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

## deleteInboxWithHttpInfo

> ApiResponse<Void> deleteInbox deleteInboxWithHttpInfo(inboxId)

Delete an owned inbox and its messages

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.ApiResponse;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        try {
            ApiResponse<Void> response = apiInstance.deleteInboxWithHttpInfo(inboxId);
            System.out.println("Status code: " + response.getStatusCode());
            System.out.println("Response headers: " + response.getHeaders());
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#deleteInbox");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Response headers: " + e.getResponseHeaders());
            System.err.println("Reason: " + e.getResponseBody());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |

### Return type


ApiResponse<Void>

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


## downloadAttachment

> String downloadAttachment(inboxId, uid, cid)

Download one attachment from an owned received message

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        Long uid = 56L; // Long | 
        String cid = "cid_example"; // String | 
        try {
            String result = apiInstance.downloadAttachment(inboxId, uid, cid);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#downloadAttachment");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Reason: " + e.getResponseBody());
            System.err.println("Response headers: " + e.getResponseHeaders());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |
| **uid** | **Long**|  | |
| **cid** | **String**|  | |

### Return type

**String**


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

## downloadAttachmentWithHttpInfo

> ApiResponse<String> downloadAttachment downloadAttachmentWithHttpInfo(inboxId, uid, cid)

Download one attachment from an owned received message

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.ApiResponse;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        Long uid = 56L; // Long | 
        String cid = "cid_example"; // String | 
        try {
            ApiResponse<String> response = apiInstance.downloadAttachmentWithHttpInfo(inboxId, uid, cid);
            System.out.println("Status code: " + response.getStatusCode());
            System.out.println("Response headers: " + response.getHeaders());
            System.out.println("Response body: " + response.getData());
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#downloadAttachment");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Response headers: " + e.getResponseHeaders());
            System.err.println("Reason: " + e.getResponseBody());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |
| **uid** | **Long**|  | |
| **cid** | **String**|  | |

### Return type

ApiResponse<**String**>


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


## getMessage

> Message getMessage(inboxId, uid)

Read one received message

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        Long uid = 56L; // Long | 
        try {
            Message result = apiInstance.getMessage(inboxId, uid);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#getMessage");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Reason: " + e.getResponseBody());
            System.err.println("Response headers: " + e.getResponseHeaders());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |
| **uid** | **Long**|  | |

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

## getMessageWithHttpInfo

> ApiResponse<Message> getMessage getMessageWithHttpInfo(inboxId, uid)

Read one received message

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.ApiResponse;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        Long uid = 56L; // Long | 
        try {
            ApiResponse<Message> response = apiInstance.getMessageWithHttpInfo(inboxId, uid);
            System.out.println("Status code: " + response.getStatusCode());
            System.out.println("Response headers: " + response.getHeaders());
            System.out.println("Response body: " + response.getData());
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#getMessage");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Response headers: " + e.getResponseHeaders());
            System.err.println("Reason: " + e.getResponseBody());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |
| **uid** | **Long**|  | |

### Return type

ApiResponse<[**Message**](Message.md)>


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


## listMessages

> List<MessageSummary> listMessages(inboxId, since, cursor, pageSize)

List received message summaries

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        OffsetDateTime since = OffsetDateTime.now(); // OffsetDateTime | Return messages received strictly after this instant
        String cursor = "cursor_example"; // String | Opaque continuation cursor returned in X-Next-Cursor
        Integer pageSize = 50; // Integer | 
        try {
            List<MessageSummary> result = apiInstance.listMessages(inboxId, since, cursor, pageSize);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#listMessages");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Reason: " + e.getResponseBody());
            System.err.println("Response headers: " + e.getResponseHeaders());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |
| **since** | **OffsetDateTime**| Return messages received strictly after this instant | [optional] |
| **cursor** | **String**| Opaque continuation cursor returned in X-Next-Cursor | [optional] |
| **pageSize** | **Integer**|  | [optional] [default to 50] |

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

## listMessagesWithHttpInfo

> ApiResponse<List<MessageSummary>> listMessages listMessagesWithHttpInfo(inboxId, since, cursor, pageSize)

List received message summaries

### Example

```java
// Import classes:
import com.onceemail.sdk.ApiClient;
import com.onceemail.sdk.ApiException;
import com.onceemail.sdk.ApiResponse;
import com.onceemail.sdk.Configuration;
import com.onceemail.sdk.auth.*;
import com.onceemail.sdk.models.*;
import com.onceemail.sdk.api.DefaultApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("https://api.once-email.com");
        
        // Configure HTTP bearer authorization: bearerApiKey
        HttpBearerAuth bearerApiKey = (HttpBearerAuth) defaultClient.getAuthentication("bearerApiKey");
        bearerApiKey.setBearerToken("BEARER TOKEN");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        UUID inboxId = UUID.randomUUID(); // UUID | 
        OffsetDateTime since = OffsetDateTime.now(); // OffsetDateTime | Return messages received strictly after this instant
        String cursor = "cursor_example"; // String | Opaque continuation cursor returned in X-Next-Cursor
        Integer pageSize = 50; // Integer | 
        try {
            ApiResponse<List<MessageSummary>> response = apiInstance.listMessagesWithHttpInfo(inboxId, since, cursor, pageSize);
            System.out.println("Status code: " + response.getStatusCode());
            System.out.println("Response headers: " + response.getHeaders());
            System.out.println("Response body: " + response.getData());
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#listMessages");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Response headers: " + e.getResponseHeaders());
            System.err.println("Reason: " + e.getResponseBody());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **inboxId** | **UUID**|  | |
| **since** | **OffsetDateTime**| Return messages received strictly after this instant | [optional] |
| **cursor** | **String**| Opaque continuation cursor returned in X-Next-Cursor | [optional] |
| **pageSize** | **Integer**|  | [optional] [default to 50] |

### Return type

ApiResponse<[**List&lt;MessageSummary&gt;**](MessageSummary.md)>


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

