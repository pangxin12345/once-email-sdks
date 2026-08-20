# Message

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Uid** | **int64** |  | 
**Subject** | **string** |  | 
**From** | **string** |  | 
**ReceivedAt** | **NullableTime** |  | 
**AttachmentsCount** | **int32** |  | 
**BodyPreview** | **string** | At most 262144 UTF-8 bytes | 
**BodyHtml** | **string** | At most 2097152 UTF-8 bytes | 
**Attachments** | [**[]Attachment**](Attachment.md) |  | 

## Methods

### NewMessage

`func NewMessage(uid int64, subject string, from string, receivedAt NullableTime, attachmentsCount int32, bodyPreview string, bodyHtml string, attachments []Attachment, ) *Message`

NewMessage instantiates a new Message object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMessageWithDefaults

`func NewMessageWithDefaults() *Message`

NewMessageWithDefaults instantiates a new Message object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUid

`func (o *Message) GetUid() int64`

GetUid returns the Uid field if non-nil, zero value otherwise.

### GetUidOk

`func (o *Message) GetUidOk() (*int64, bool)`

GetUidOk returns a tuple with the Uid field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUid

`func (o *Message) SetUid(v int64)`

SetUid sets Uid field to given value.


### GetSubject

`func (o *Message) GetSubject() string`

GetSubject returns the Subject field if non-nil, zero value otherwise.

### GetSubjectOk

`func (o *Message) GetSubjectOk() (*string, bool)`

GetSubjectOk returns a tuple with the Subject field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubject

`func (o *Message) SetSubject(v string)`

SetSubject sets Subject field to given value.


### GetFrom

`func (o *Message) GetFrom() string`

GetFrom returns the From field if non-nil, zero value otherwise.

### GetFromOk

`func (o *Message) GetFromOk() (*string, bool)`

GetFromOk returns a tuple with the From field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFrom

`func (o *Message) SetFrom(v string)`

SetFrom sets From field to given value.


### GetReceivedAt

`func (o *Message) GetReceivedAt() time.Time`

GetReceivedAt returns the ReceivedAt field if non-nil, zero value otherwise.

### GetReceivedAtOk

`func (o *Message) GetReceivedAtOk() (*time.Time, bool)`

GetReceivedAtOk returns a tuple with the ReceivedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReceivedAt

`func (o *Message) SetReceivedAt(v time.Time)`

SetReceivedAt sets ReceivedAt field to given value.


### SetReceivedAtNil

`func (o *Message) SetReceivedAtNil(b bool)`

 SetReceivedAtNil sets the value for ReceivedAt to be an explicit nil

### UnsetReceivedAt
`func (o *Message) UnsetReceivedAt()`

UnsetReceivedAt ensures that no value is present for ReceivedAt, not even an explicit nil
### GetAttachmentsCount

`func (o *Message) GetAttachmentsCount() int32`

GetAttachmentsCount returns the AttachmentsCount field if non-nil, zero value otherwise.

### GetAttachmentsCountOk

`func (o *Message) GetAttachmentsCountOk() (*int32, bool)`

GetAttachmentsCountOk returns a tuple with the AttachmentsCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAttachmentsCount

`func (o *Message) SetAttachmentsCount(v int32)`

SetAttachmentsCount sets AttachmentsCount field to given value.


### GetBodyPreview

`func (o *Message) GetBodyPreview() string`

GetBodyPreview returns the BodyPreview field if non-nil, zero value otherwise.

### GetBodyPreviewOk

`func (o *Message) GetBodyPreviewOk() (*string, bool)`

GetBodyPreviewOk returns a tuple with the BodyPreview field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBodyPreview

`func (o *Message) SetBodyPreview(v string)`

SetBodyPreview sets BodyPreview field to given value.


### GetBodyHtml

`func (o *Message) GetBodyHtml() string`

GetBodyHtml returns the BodyHtml field if non-nil, zero value otherwise.

### GetBodyHtmlOk

`func (o *Message) GetBodyHtmlOk() (*string, bool)`

GetBodyHtmlOk returns a tuple with the BodyHtml field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBodyHtml

`func (o *Message) SetBodyHtml(v string)`

SetBodyHtml sets BodyHtml field to given value.


### GetAttachments

`func (o *Message) GetAttachments() []Attachment`

GetAttachments returns the Attachments field if non-nil, zero value otherwise.

### GetAttachmentsOk

`func (o *Message) GetAttachmentsOk() (*[]Attachment, bool)`

GetAttachmentsOk returns a tuple with the Attachments field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAttachments

`func (o *Message) SetAttachments(v []Attachment)`

SetAttachments sets Attachments field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


