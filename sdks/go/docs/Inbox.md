# Inbox

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Address** | **string** |  | 
**ExpiresAt** | **time.Time** |  | 
**ServerTime** | **time.Time** |  | 

## Methods

### NewInbox

`func NewInbox(id string, address string, expiresAt time.Time, serverTime time.Time, ) *Inbox`

NewInbox instantiates a new Inbox object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInboxWithDefaults

`func NewInboxWithDefaults() *Inbox`

NewInboxWithDefaults instantiates a new Inbox object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *Inbox) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Inbox) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Inbox) SetId(v string)`

SetId sets Id field to given value.


### GetAddress

`func (o *Inbox) GetAddress() string`

GetAddress returns the Address field if non-nil, zero value otherwise.

### GetAddressOk

`func (o *Inbox) GetAddressOk() (*string, bool)`

GetAddressOk returns a tuple with the Address field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAddress

`func (o *Inbox) SetAddress(v string)`

SetAddress sets Address field to given value.


### GetExpiresAt

`func (o *Inbox) GetExpiresAt() time.Time`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *Inbox) GetExpiresAtOk() (*time.Time, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *Inbox) SetExpiresAt(v time.Time)`

SetExpiresAt sets ExpiresAt field to given value.


### GetServerTime

`func (o *Inbox) GetServerTime() time.Time`

GetServerTime returns the ServerTime field if non-nil, zero value otherwise.

### GetServerTimeOk

`func (o *Inbox) GetServerTimeOk() (*time.Time, bool)`

GetServerTimeOk returns a tuple with the ServerTime field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetServerTime

`func (o *Inbox) SetServerTime(v time.Time)`

SetServerTime sets ServerTime field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


