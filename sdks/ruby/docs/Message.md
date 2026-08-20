# OnceEmail::Message

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **uid** | **Integer** |  |  |
| **subject** | **String** |  |  |
| **from** | **String** |  |  |
| **received_at** | **Time** |  |  |
| **attachments_count** | **Integer** |  |  |
| **body_preview** | **String** | At most 262144 UTF-8 bytes |  |
| **body_html** | **String** | At most 2097152 UTF-8 bytes |  |
| **attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  |  |

## Example

```ruby
require 'once_email'

instance = OnceEmail::Message.new(
  uid: null,
  subject: null,
  from: null,
  received_at: null,
  attachments_count: null,
  body_preview: null,
  body_html: null,
  attachments: null
)
```

