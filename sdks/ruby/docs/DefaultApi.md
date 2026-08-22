# OnceEmail::DefaultApi

All URIs are relative to *https://api.once-email.com*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**create_inbox**](DefaultApi.md#create_inbox) | **POST** /v1/inboxes | Create one temporary test inbox |
| [**delete_inbox**](DefaultApi.md#delete_inbox) | **DELETE** /v1/inboxes/{inboxId} | Delete an owned inbox and its messages |
| [**download_attachment**](DefaultApi.md#download_attachment) | **GET** /v1/inboxes/{inboxId}/messages/{uid}/attachments/{cid} | Download one attachment from an owned received message |
| [**get_message**](DefaultApi.md#get_message) | **GET** /v1/inboxes/{inboxId}/messages/{uid} | Read one received message |
| [**list_messages**](DefaultApi.md#list_messages) | **GET** /v1/inboxes/{inboxId}/messages | List received message summaries |


## create_inbox

> <Inbox> create_inbox(opts)

Create one temporary test inbox

### Examples

```ruby
require 'time'
require 'once_email'
# setup authorization
OnceEmail.configure do |config|
  # Configure Bearer authorization (oe_live_...): bearerApiKey
  config.access_token = ENV.fetch('ONCE_EMAIL_API_KEY')
end

api_instance = OnceEmail::DefaultApi.new
opts = {
  idempotency_key: 'idempotency_key_example' # String | Stable key for safely retrying inbox creation; valid while the created inbox remains available
}

begin
  # Create one temporary test inbox
  result = api_instance.create_inbox(opts)
  puts({ created: true }.to_json)rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->create_inbox: #{e}"
end
```

#### Using the create_inbox_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Inbox>, Integer, Hash)> create_inbox_with_http_info(opts)

```ruby
begin
  # Create one temporary test inbox
  data, status_code, headers = api_instance.create_inbox_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Inbox>
rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->create_inbox_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **idempotency_key** | **String** | Stable key for safely retrying inbox creation; valid while the created inbox remains available | [optional] |

### Return type

[**Inbox**](Inbox.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## delete_inbox

> delete_inbox(inbox_id)

Delete an owned inbox and its messages

### Examples

```ruby
require 'time'
require 'once_email'
# setup authorization
OnceEmail.configure do |config|
  # Configure Bearer authorization (oe_live_...): bearerApiKey
  config.access_token = ENV.fetch('ONCE_EMAIL_API_KEY')
end

api_instance = OnceEmail::DefaultApi.new
inbox_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete an owned inbox and its messages
  api_instance.delete_inbox(inbox_id)
rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->delete_inbox: #{e}"
end
```

#### Using the delete_inbox_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> delete_inbox_with_http_info(inbox_id)

```ruby
begin
  # Delete an owned inbox and its messages
  data, status_code, headers = api_instance.delete_inbox_with_http_info(inbox_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->delete_inbox_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **inbox_id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## download_attachment

> String download_attachment(inbox_id, uid, cid)

Download one attachment from an owned received message

### Examples

```ruby
require 'time'
require 'once_email'
# setup authorization
OnceEmail.configure do |config|
  # Configure Bearer authorization (oe_live_...): bearerApiKey
  config.access_token = ENV.fetch('ONCE_EMAIL_API_KEY')
end

api_instance = OnceEmail::DefaultApi.new
inbox_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
uid = 789 # Integer | 
cid = 'cid_example' # String | 

begin
  # Download one attachment from an owned received message
  result = api_instance.download_attachment(inbox_id, uid, cid)
  puts({ created: true }.to_json)rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->download_attachment: #{e}"
end
```

#### Using the download_attachment_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(String, Integer, Hash)> download_attachment_with_http_info(inbox_id, uid, cid)

```ruby
begin
  # Download one attachment from an owned received message
  data, status_code, headers = api_instance.download_attachment_with_http_info(inbox_id, uid, cid)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => String
rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->download_attachment_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **inbox_id** | **String** |  |  |
| **uid** | **Integer** |  |  |
| **cid** | **String** |  |  |

### Return type

**String**

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/octet-stream, application/json


## get_message

> <Message> get_message(inbox_id, uid)

Read one received message

### Examples

```ruby
require 'time'
require 'once_email'
# setup authorization
OnceEmail.configure do |config|
  # Configure Bearer authorization (oe_live_...): bearerApiKey
  config.access_token = ENV.fetch('ONCE_EMAIL_API_KEY')
end

api_instance = OnceEmail::DefaultApi.new
inbox_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
uid = 789 # Integer | 

begin
  # Read one received message
  result = api_instance.get_message(inbox_id, uid)
  puts({ created: true }.to_json)rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->get_message: #{e}"
end
```

#### Using the get_message_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Message>, Integer, Hash)> get_message_with_http_info(inbox_id, uid)

```ruby
begin
  # Read one received message
  data, status_code, headers = api_instance.get_message_with_http_info(inbox_id, uid)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Message>
rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->get_message_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **inbox_id** | **String** |  |  |
| **uid** | **Integer** |  |  |

### Return type

[**Message**](Message.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## list_messages

> <Array<MessageSummary>> list_messages(inbox_id, opts)

List received message summaries

### Examples

```ruby
require 'time'
require 'once_email'
# setup authorization
OnceEmail.configure do |config|
  # Configure Bearer authorization (oe_live_...): bearerApiKey
  config.access_token = ENV.fetch('ONCE_EMAIL_API_KEY')
end

api_instance = OnceEmail::DefaultApi.new
inbox_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
opts = {
  since: Time.parse('2013-10-20T19:20:30+01:00'), # Time | Return messages received strictly after this instant
  cursor: 'cursor_example', # String | Opaque continuation cursor returned in X-Next-Cursor
  page_size: 56 # Integer | 
}

begin
  # List received message summaries
  result = api_instance.list_messages(inbox_id, opts)
  puts({ created: true }.to_json)rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->list_messages: #{e}"
end
```

#### Using the list_messages_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<MessageSummary>>, Integer, Hash)> list_messages_with_http_info(inbox_id, opts)

```ruby
begin
  # List received message summaries
  data, status_code, headers = api_instance.list_messages_with_http_info(inbox_id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<MessageSummary>>
rescue OnceEmail::ApiError => e
  puts "Error when calling DefaultApi->list_messages_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **inbox_id** | **String** |  |  |
| **since** | **Time** | Return messages received strictly after this instant | [optional] |
| **cursor** | **String** | Opaque continuation cursor returned in X-Next-Cursor | [optional] |
| **page_size** | **Integer** |  | [optional][default to 50] |

### Return type

[**Array&lt;MessageSummary&gt;**](MessageSummary.md)

### Authorization

[bearerApiKey](../README.md#bearerApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

