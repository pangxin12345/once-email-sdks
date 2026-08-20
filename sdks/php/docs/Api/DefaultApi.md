# OnceEmail\Sdk\DefaultApi

All URIs are relative to https://api.once-email.com, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createInbox()**](DefaultApi.md#createInbox) | **POST** /v1/inboxes | Create one temporary test inbox |
| [**deleteInbox()**](DefaultApi.md#deleteInbox) | **DELETE** /v1/inboxes/{inboxId} | Delete an owned inbox and its messages |
| [**downloadAttachment()**](DefaultApi.md#downloadAttachment) | **GET** /v1/inboxes/{inboxId}/messages/{uid}/attachments/{cid} | Download one attachment from an owned received message |
| [**getMessage()**](DefaultApi.md#getMessage) | **GET** /v1/inboxes/{inboxId}/messages/{uid} | Read one received message |
| [**listMessages()**](DefaultApi.md#listMessages) | **GET** /v1/inboxes/{inboxId}/messages | List received message summaries |


## `createInbox()`

```php
createInbox($idempotency_key): \OnceEmail\Sdk\Model\Inbox
```

Create one temporary test inbox

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer (oe_live_...) authorization: bearerApiKey
$config = OnceEmail\Sdk\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OnceEmail\Sdk\Api\DefaultApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$idempotency_key = 'idempotency_key_example'; // string | Stable key for safely retrying inbox creation; valid while the created inbox remains available

try {
    $result = $apiInstance->createInbox($idempotency_key);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DefaultApi->createInbox: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **idempotency_key** | **string**| Stable key for safely retrying inbox creation; valid while the created inbox remains available | [optional] |

### Return type

[**\OnceEmail\Sdk\Model\Inbox**](../Model/Inbox.md)

### Authorization

[bearerApiKey](../../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `deleteInbox()`

```php
deleteInbox($inbox_id)
```

Delete an owned inbox and its messages

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer (oe_live_...) authorization: bearerApiKey
$config = OnceEmail\Sdk\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OnceEmail\Sdk\Api\DefaultApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$inbox_id = 'inbox_id_example'; // string

try {
    $apiInstance->deleteInbox($inbox_id);
} catch (Exception $e) {
    echo 'Exception when calling DefaultApi->deleteInbox: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inbox_id** | **string**|  | |

### Return type

void (empty response body)

### Authorization

[bearerApiKey](../../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `downloadAttachment()`

```php
downloadAttachment($inbox_id, $uid, $cid): string
```

Download one attachment from an owned received message

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer (oe_live_...) authorization: bearerApiKey
$config = OnceEmail\Sdk\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OnceEmail\Sdk\Api\DefaultApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$inbox_id = 'inbox_id_example'; // string
$uid = 56; // int
$cid = 'cid_example'; // string

try {
    $result = $apiInstance->downloadAttachment($inbox_id, $uid, $cid);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DefaultApi->downloadAttachment: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inbox_id** | **string**|  | |
| **uid** | **int**|  | |
| **cid** | **string**|  | |

### Return type

**string**

### Authorization

[bearerApiKey](../../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/octet-stream`, `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `getMessage()`

```php
getMessage($inbox_id, $uid): \OnceEmail\Sdk\Model\Message
```

Read one received message

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer (oe_live_...) authorization: bearerApiKey
$config = OnceEmail\Sdk\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OnceEmail\Sdk\Api\DefaultApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$inbox_id = 'inbox_id_example'; // string
$uid = 56; // int

try {
    $result = $apiInstance->getMessage($inbox_id, $uid);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DefaultApi->getMessage: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inbox_id** | **string**|  | |
| **uid** | **int**|  | |

### Return type

[**\OnceEmail\Sdk\Model\Message**](../Model/Message.md)

### Authorization

[bearerApiKey](../../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `listMessages()`

```php
listMessages($inbox_id, $since, $cursor, $page_size): \OnceEmail\Sdk\Model\MessageSummary[]
```

List received message summaries

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer (oe_live_...) authorization: bearerApiKey
$config = OnceEmail\Sdk\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OnceEmail\Sdk\Api\DefaultApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$inbox_id = 'inbox_id_example'; // string
$since = new \DateTime('2013-10-20T19:20:30+01:00'); // \DateTime | Return messages received strictly after this instant
$cursor = 'cursor_example'; // string | Opaque continuation cursor returned in X-Next-Cursor
$page_size = 50; // int

try {
    $result = $apiInstance->listMessages($inbox_id, $since, $cursor, $page_size);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DefaultApi->listMessages: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inbox_id** | **string**|  | |
| **since** | **\DateTime**| Return messages received strictly after this instant | [optional] |
| **cursor** | **string**| Opaque continuation cursor returned in X-Next-Cursor | [optional] |
| **page_size** | **int**|  | [optional] [default to 50] |

### Return type

[**\OnceEmail\Sdk\Model\MessageSummary[]**](../Model/MessageSummary.md)

### Authorization

[bearerApiKey](../../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
