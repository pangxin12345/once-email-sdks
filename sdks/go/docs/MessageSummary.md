# MessageSummary

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Uid** | **int64** |  | 
**Subject** | **string** |  | 
**From** | **string** |  | 
**ReceivedAt** | **NullableTime** |  | 
**AttachmentsCount** | **int32** |  | 

## Methods

### NewMessageSummary

`func NewMessageSummary(uid int64, subject string, from string, receivedAt NullableTime, attachmentsCount int32, ) *MessageSummary`

NewMessageSummary instantiates a new MessageSummary object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMessageSummaryWithDefaults

`func NewMessageSummaryWithDefaults() *MessageSummary`

NewMessageSummaryWithDefaults instantiates a new MessageSummary object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUid

`func (o *MessageSummary) GetUid() int64`

GetUid returns the Uid field if non-nil, zero value otherwise.

### GetUidOk

`func (o *MessageSummary) GetUidOk() (*int64, bool)`

GetUidOk returns a tuple with the Uid field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUid

`func (o *MessageSummary) SetUid(v int64)`

SetUid sets Uid field to given value.


### GetSubject

`func (o *MessageSummary) GetSubject() string`

GetSubject returns the Subject field if non-nil, zero value otherwise.

### GetSubjectOk

`func (o *MessageSummary) GetSubjectOk() (*string, bool)`

GetSubjectOk returns a tuple with the Subject field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubject

`func (o *MessageSummary) SetSubject(v string)`

SetSubject sets Subject field to given value.


### GetFrom

`func (o *MessageSummary) GetFrom() string`

GetFrom returns the From field if non-nil, zero value otherwise.

### GetFromOk

`func (o *MessageSummary) GetFromOk() (*string, bool)`

GetFromOk returns a tuple with the From field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFrom

`func (o *MessageSummary) SetFrom(v string)`

SetFrom sets From field to given value.


### GetReceivedAt

`func (o *MessageSummary) GetReceivedAt() time.Time`

GetReceivedAt returns the ReceivedAt field if non-nil, zero value otherwise.

### GetReceivedAtOk

`func (o *MessageSummary) GetReceivedAtOk() (*time.Time, bool)`

GetReceivedAtOk returns a tuple with the ReceivedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReceivedAt

`func (o *MessageSummary) SetReceivedAt(v time.Time)`

SetReceivedAt sets ReceivedAt field to given value.


### SetReceivedAtNil

`func (o *MessageSummary) SetReceivedAtNil(b bool)`

 SetReceivedAtNil sets the value for ReceivedAt to be an explicit nil

### UnsetReceivedAt
`func (o *MessageSummary) UnsetReceivedAt()`

UnsetReceivedAt ensures that no value is present for ReceivedAt, not even an explicit nil
### GetAttachmentsCount

`func (o *MessageSummary) GetAttachmentsCount() int32`

GetAttachmentsCount returns the AttachmentsCount field if non-nil, zero value otherwise.

### GetAttachmentsCountOk

`func (o *MessageSummary) GetAttachmentsCountOk() (*int32, bool)`

GetAttachmentsCountOk returns a tuple with the AttachmentsCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAttachmentsCount

`func (o *MessageSummary) SetAttachmentsCount(v int32)`

SetAttachmentsCount sets AttachmentsCount field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


