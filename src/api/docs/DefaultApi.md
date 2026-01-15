# DefaultApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authMiddlewarePost**](#authmiddlewarepost) | **POST** /auth/middleware | JWT Authentication Middleware|
|[**authOwnerIdPost**](#authowneridpost) | **POST** /auth/owner/{id} | Owner Authorization Middleware|
|[**eventsGet**](#eventsget) | **GET** /events | Get events by team id|
|[**eventsIdDelete**](#eventsiddelete) | **DELETE** /events/{id} | Delete event by id|
|[**eventsIdGet**](#eventsidget) | **GET** /events/{id} | Get event by id|
|[**eventsIdPatch**](#eventsidpatch) | **PATCH** /events/{id} | Update event details|
|[**eventsIdStatusPatch**](#eventsidstatuspatch) | **PATCH** /events/{id}/status | Update user status for event|
|[**eventsPost**](#eventspost) | **POST** /events | Create new event|
|[**friendRequestsFromUserIdToUserIdPost**](#friendrequestsfromuseridtouseridpost) | **POST** /friend-requests/{fromUserId}/{toUserId} | Send a friend request|
|[**friendRequestsFromUserIdToUserIdPut**](#friendrequestsfromuseridtouseridput) | **PUT** /friend-requests/{fromUserId}/{toUserId} | Respond to a friend request|
|[**friendRequestsUserIdGet**](#friendrequestsuseridget) | **GET** /friend-requests/{userId} | Get pending friend requests|
|[**messagesConnectGet**](#messagesconnectget) | **GET** /messages/connect | Connect the user to the message WebSocket|
|[**messagesGet**](#messagesget) | **GET** /messages | Get all messages|
|[**messagesIdGet**](#messagesidget) | **GET** /messages/{id} | Get a message by ID|
|[**messagesPost**](#messagespost) | **POST** /messages | Create and send a message|
|[**quizzesIdGet**](#quizzesidget) | **GET** /quizzes/{id} | Get a quiz with answers|
|[**quizzesIdTestGet**](#quizzesidtestget) | **GET** /quizzes/{id}/test | Get a quiz without answers|
|[**quizzesIdTestPost**](#quizzesidtestpost) | **POST** /quizzes/{id}/test | Solve a quiz|
|[**quizzesPost**](#quizzespost) | **POST** /quizzes | Create a new quiz|
|[**quizzesTeamTeamIdGet**](#quizzesteamteamidget) | **GET** /quizzes/team/{teamId} | Get quizzes by team with pagination|
|[**quizzesUserUserIdTeamTeamIdGet**](#quizzesuseruseridteamteamidget) | **GET** /quizzes/user/{userId}/team/{teamId} | Get quizzes by user with pagination|
|[**teamRequestsGet**](#teamrequestsget) | **GET** /teamRequests | Get all team requests|
|[**teamRequestsIdAcceptPut**](#teamrequestsidacceptput) | **PUT** /teamRequests/{id}/accept | Accept a team request|
|[**teamRequestsIdRejectDelete**](#teamrequestsidrejectdelete) | **DELETE** /teamRequests/{id}/reject | Reject a team request|
|[**teamRequestsPost**](#teamrequestspost) | **POST** /teamRequests | Create a new team request|
|[**teamRequestsUserUserIdGet**](#teamrequestsuseruseridget) | **GET** /teamRequests/user/{userId} | Get all team requests for a specific user|
|[**teamsGet**](#teamsget) | **GET** /teams | Get teams with optional filtering|
|[**teamsIdDelete**](#teamsiddelete) | **DELETE** /teams/{id} | Delete a team|
|[**teamsIdFilesFileIdDelete**](#teamsidfilesfileiddelete) | **DELETE** /teams/{id}/files/{fileId} | Delete a file|
|[**teamsIdFilesFileIdGet**](#teamsidfilesfileidget) | **GET** /teams/{id}/files/{fileId} | Get file by id (with content)|
|[**teamsIdFilesGet**](#teamsidfilesget) | **GET** /teams/{id}/files | Get all files for a team (metadata only, paginated)|
|[**teamsIdFilesPost**](#teamsidfilespost) | **POST** /teams/{id}/files | Upload a file to a team (base64 content)|
|[**teamsIdGet**](#teamsidget) | **GET** /teams/{id} | Get a team by ID|
|[**teamsIdPut**](#teamsidput) | **PUT** /teams/{id} | Update a team|
|[**teamsIdUsersGet**](#teamsidusersget) | **GET** /teams/{id}/users | Get users by team ID|
|[**teamsPost**](#teamspost) | **POST** /teams | Create a new team|
|[**teamsUsersDelete**](#teamsusersdelete) | **DELETE** /teams/users | Delete a user from a team|
|[**teamsUsersPut**](#teamsusersput) | **PUT** /teams/users | Add a user to a team|
|[**usersGet**](#usersget) | **GET** /users | Get all users|
|[**usersIdDelete**](#usersiddelete) | **DELETE** /users/{id} | Delete a user|
|[**usersIdFriendsGet**](#usersidfriendsget) | **GET** /users/{id}/friends | Get friends for a user|
|[**usersIdGet**](#usersidget) | **GET** /users/{id} | Get a user by ID|
|[**usersIdMutualOtherIdGet**](#usersidmutualotheridget) | **GET** /users/{id}/mutual/{otherId} | Get mutual friends between two users|
|[**usersIdPasswordPut**](#usersidpasswordput) | **PUT** /users/{id}/password | Update user password|
|[**usersIdPatch**](#usersidpatch) | **PATCH** /users/{id} | Update user profile (selective fields)|
|[**usersIdStatisticsGet**](#usersidstatisticsget) | **GET** /users/{id}/statistics | Get a user\&#39;s statistics|
|[**usersIdStatisticsPut**](#usersidstatisticsput) | **PUT** /users/{id}/statistics | Update user statistics|
|[**usersLoginPost**](#usersloginpost) | **POST** /users/login | Login user by email or username and return JWT|
|[**usersSignupPost**](#userssignuppost) | **POST** /users/signup | Register a new user|
|[**voiceJoinRoomIdGet**](#voicejoinroomidget) | **GET** /voice/join/{roomId} | Join a voice room via WebSocket|
|[**voiceJoinableGet**](#voicejoinableget) | **GET** /voice/joinable | Get joinable voice rooms|
|[**voicePrivateCallPost**](#voiceprivatecallpost) | **POST** /voice/private/call | Start a private voice call|
|[**voiceRoomsTeamIdGet**](#voiceroomsteamidget) | **GET** /voice/rooms/{teamId} | Get active voice rooms for a team|
|[**voiceRoomsTeamIdPost**](#voiceroomsteamidpost) | **POST** /voice/rooms/{teamId} | Create a group voice room|

# **authMiddlewarePost**
> string authMiddlewarePost()

Middleware to verify JWT token from Authorization header or query parameter

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let authorization: string; //Bearer token (optional) (default to undefined)
let token: string; //Token for WebSocket connections (optional) (default to undefined)

const { status, data } = await apiInstance.authMiddlewarePost(
    authorization,
    token
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authorization** | [**string**] | Bearer token | (optional) defaults to undefined|
| **token** | [**string**] | Token for WebSocket connections | (optional) defaults to undefined|


### Return type

**string**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Token is valid |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authOwnerIdPost**
> string authOwnerIdPost()

Middleware to ensure the authenticated user matches the resource owner

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Resource ID that must match authenticated user ID (default to undefined)

const { status, data } = await apiInstance.authOwnerIdPost(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Resource ID that must match authenticated user ID | defaults to undefined|


### Return type

**string**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User is authorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eventsGet**
> Array<DtoEventDTO> eventsGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let teamId: string; //Team ID (default to undefined)

const { status, data } = await apiInstance.eventsGet(
    teamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamId** | [**string**] | Team ID | defaults to undefined|


### Return type

**Array<DtoEventDTO>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eventsIdDelete**
> { [key: string]: any; } eventsIdDelete()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Event ID (default to undefined)

const { status, data } = await apiInstance.eventsIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Event ID | defaults to undefined|


### Return type

**{ [key: string]: any; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Event deleted successfully |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eventsIdGet**
> DtoEventDTO eventsIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Event ID (default to undefined)

const { status, data } = await apiInstance.eventsIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Event ID | defaults to undefined|


### Return type

**DtoEventDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**409** | this status option is already set |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eventsIdPatch**
> DtoEventDTO eventsIdPatch(request)

Update event name, description, start time and/or duration

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoUpdateEventRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Event ID (default to undefined)
let request: DtoUpdateEventRequest; //Update event request

const { status, data } = await apiInstance.eventsIdPatch(
    id,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoUpdateEventRequest**| Update event request | |
| **id** | [**string**] | Event ID | defaults to undefined|


### Return type

**DtoEventDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eventsIdStatusPatch**
> DtoEventDTO eventsIdStatusPatch(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoUpdateEventStatusRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Event ID (default to undefined)
let request: DtoUpdateEventStatusRequest; //Update event status request

const { status, data } = await apiInstance.eventsIdStatusPatch(
    id,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoUpdateEventStatusRequest**| Update event status request | |
| **id** | [**string**] | Event ID | defaults to undefined|


### Return type

**DtoEventDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eventsPost**
> DtoEventDTO eventsPost(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoCreateEventRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: DtoCreateEventRequest; //Create event request

const { status, data } = await apiInstance.eventsPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoCreateEventRequest**| Create event request | |


### Return type

**DtoEventDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **friendRequestsFromUserIdToUserIdPost**
> friendRequestsFromUserIdToUserIdPost()

Send a friend request from one user to another

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let fromUserId: string; //Sender User ID (default to undefined)
let toUserId: string; //Recipient User ID (default to undefined)

const { status, data } = await apiInstance.friendRequestsFromUserIdToUserIdPost(
    fromUserId,
    toUserId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **fromUserId** | [**string**] | Sender User ID | defaults to undefined|
| **toUserId** | [**string**] | Recipient User ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **friendRequestsFromUserIdToUserIdPut**
> friendRequestsFromUserIdToUserIdPut(body)

Accept or deny a friend request

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoRespondFriendRequestRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let fromUserId: string; //Sender User ID (default to undefined)
let toUserId: string; //Recipient User ID (default to undefined)
let body: DtoRespondFriendRequestRequest; //Accept or deny

const { status, data } = await apiInstance.friendRequestsFromUserIdToUserIdPut(
    fromUserId,
    toUserId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **DtoRespondFriendRequestRequest**| Accept or deny | |
| **fromUserId** | [**string**] | Sender User ID | defaults to undefined|
| **toUserId** | [**string**] | Recipient User ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **friendRequestsUserIdGet**
> DtoFriendRequestListResponse friendRequestsUserIdGet()

Get pending friend requests for a user

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let userId: string; //User ID (default to undefined)

const { status, data } = await apiInstance.friendRequestsUserIdGet(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] | User ID | defaults to undefined|


### Return type

**DtoFriendRequestListResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **messagesConnectGet**
> messagesConnectGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.messagesConnectGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**101** | Switching Protocols - WebSocket connection established |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **messagesGet**
> Array<DtoMessageDTO> messagesGet()

Get messages between 2 users or within a team

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let type: string; //Messages type (direct/team) (default to undefined)
let user1Id: string; //User1 ID (direct message) (optional) (default to undefined)
let user2Id: string; //User2 ID (direct message) (optional) (default to undefined)
let teamId: string; //Team ID (team message) (optional) (default to undefined)

const { status, data } = await apiInstance.messagesGet(
    type,
    user1Id,
    user2Id,
    teamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**string**] | Messages type (direct/team) | defaults to undefined|
| **user1Id** | [**string**] | User1 ID (direct message) | (optional) defaults to undefined|
| **user2Id** | [**string**] | User2 ID (direct message) | (optional) defaults to undefined|
| **teamId** | [**string**] | Team ID (team message) | (optional) defaults to undefined|


### Return type

**Array<DtoMessageDTO>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **messagesIdGet**
> DtoMessageDTO messagesIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The message ID (default to undefined)

const { status, data } = await apiInstance.messagesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | The message ID | defaults to undefined|


### Return type

**DtoMessageDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **messagesPost**
> DtoMessageDTO messagesPost(request)

Create and send a message either to another user or to a team

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ControllerMessageRequestUnion
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let type: string; //Message type (direct/team) (default to undefined)
let request: ControllerMessageRequestUnion; //The message request (this is only for documentation purposes, the actual request should be either DirectMessageRequest or TeamMessageRequest)

const { status, data } = await apiInstance.messagesPost(
    type,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **ControllerMessageRequestUnion**| The message request (this is only for documentation purposes, the actual request should be either DirectMessageRequest or TeamMessageRequest) | |
| **type** | [**string**] | Message type (direct/team) | defaults to undefined|


### Return type

**DtoMessageDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizzesIdGet**
> EntityQuiz quizzesIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The id for quiz (default to undefined)

const { status, data } = await apiInstance.quizzesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | The id for quiz | defaults to undefined|


### Return type

**EntityQuiz**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizzesIdTestGet**
> DtoReadQuizResponse quizzesIdTestGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The id for quiz (default to undefined)

const { status, data } = await apiInstance.quizzesIdTestGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | The id for quiz | defaults to undefined|


### Return type

**DtoReadQuizResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizzesIdTestPost**
> DtoSolveQuizResponse quizzesIdTestPost(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoSolveQuizRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The id for quiz (default to undefined)
let request: DtoSolveQuizRequest; //The solve quiz request

const { status, data } = await apiInstance.quizzesIdTestPost(
    id,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoSolveQuizRequest**| The solve quiz request | |
| **id** | [**string**] | The id for quiz | defaults to undefined|


### Return type

**DtoSolveQuizResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizzesPost**
> DtoCreateQuizResponse quizzesPost(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    EntityQuiz
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: EntityQuiz; //The create quiz request

const { status, data } = await apiInstance.quizzesPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **EntityQuiz**| The create quiz request | |


### Return type

**DtoCreateQuizResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**403** | Forbidden |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizzesTeamTeamIdGet**
> { [key: string]: any; } quizzesTeamTeamIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let teamId: string; //Team ID (default to undefined)
let pageSize: number; //Page size (default 10) (optional) (default to undefined)
let lastKey: string; //Last key for pagination (optional) (default to undefined)

const { status, data } = await apiInstance.quizzesTeamTeamIdGet(
    teamId,
    pageSize,
    lastKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamId** | [**string**] | Team ID | defaults to undefined|
| **pageSize** | [**number**] | Page size (default 10) | (optional) defaults to undefined|
| **lastKey** | [**string**] | Last key for pagination | (optional) defaults to undefined|


### Return type

**{ [key: string]: any; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizzesUserUserIdTeamTeamIdGet**
> { [key: string]: any; } quizzesUserUserIdTeamTeamIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let userId: string; //User ID (default to undefined)
let teamId: string; //Team ID (default to undefined)
let pageSize: number; //Page size (default 10) (optional) (default to undefined)
let lastKey: string; //Last key for pagination (optional) (default to undefined)

const { status, data } = await apiInstance.quizzesUserUserIdTeamTeamIdGet(
    userId,
    teamId,
    pageSize,
    lastKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] | User ID | defaults to undefined|
| **teamId** | [**string**] | Team ID | defaults to undefined|
| **pageSize** | [**number**] | Page size (default 10) | (optional) defaults to undefined|
| **lastKey** | [**string**] | Last key for pagination | (optional) defaults to undefined|


### Return type

**{ [key: string]: any; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamRequestsGet**
> DtoTeamRequestsResponseDTO teamRequestsGet()

Fetches all pending team requests in the system.

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.teamRequestsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DtoTeamRequestsResponseDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamRequestsIdAcceptPut**
> DtoAddUserToTeamResponse teamRequestsIdAcceptPut()

Accepts a pending team request, adds the user to the team, and deletes the request.

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team Request ID (default to undefined)

const { status, data } = await apiInstance.teamRequestsIdAcceptPut(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team Request ID | defaults to undefined|


### Return type

**DtoAddUserToTeamResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request or Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamRequestsIdRejectDelete**
> { [key: string]: string; } teamRequestsIdRejectDelete()

Rejects and deletes a pending team request.

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team Request ID (default to undefined)

const { status, data } = await apiInstance.teamRequestsIdRejectDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team Request ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Team request rejected |  -  |
|**400** | Bad Request or Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamRequestsPost**
> DtoTeamRequestItemDTO teamRequestsPost(request)

Creates a join request for a user to join a team.

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoTeamRequestCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: DtoTeamRequestCreateDTO; //Team and User IDs

const { status, data } = await apiInstance.teamRequestsPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoTeamRequestCreateDTO**| Team and User IDs | |


### Return type

**DtoTeamRequestItemDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Invalid request or validation error |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamRequestsUserUserIdGet**
> DtoTeamRequestsResponseDTO teamRequestsUserUserIdGet()

Fetches all pending team requests created by a given user.

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let userId: string; //User ID (default to undefined)

const { status, data } = await apiInstance.teamRequestsUserUserIdGet(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] | User ID | defaults to undefined|


### Return type

**DtoTeamRequestsResponseDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsGet**
> Array<EntityTeam> teamsGet()

Get teams - all teams, by name, or by prefix with limit

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let name: string; //Filter by exact name (optional) (default to undefined)
let prefix: string; //Filter by name prefix (optional) (default to undefined)
let limit: number; //Limit results (required with prefix) (optional) (default to undefined)

const { status, data } = await apiInstance.teamsGet(
    name,
    prefix,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **name** | [**string**] | Filter by exact name | (optional) defaults to undefined|
| **prefix** | [**string**] | Filter by name prefix | (optional) defaults to undefined|
| **limit** | [**number**] | Limit results (required with prefix) | (optional) defaults to undefined|


### Return type

**Array<EntityTeam>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdDelete**
> { [key: string]: any; } teamsIdDelete()

Delete a team by providing team ID

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)

const { status, data } = await apiInstance.teamsIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team ID | defaults to undefined|


### Return type

**{ [key: string]: any; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Team deleted |  -  |
|**400** | Bad Request: Missing team ID |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdFilesFileIdDelete**
> { [key: string]: string; } teamsIdFilesFileIdDelete()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)
let fileId: string; //File ID (default to undefined)

const { status, data } = await apiInstance.teamsIdFilesFileIdDelete(
    id,
    fileId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team ID | defaults to undefined|
| **fileId** | [**string**] | File ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdFilesFileIdGet**
> EntityFile teamsIdFilesFileIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)
let fileId: string; //File ID (default to undefined)

const { status, data } = await apiInstance.teamsIdFilesFileIdGet(
    id,
    fileId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team ID | defaults to undefined|
| **fileId** | [**string**] | File ID | defaults to undefined|


### Return type

**EntityFile**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdFilesGet**
> DtoFileListResponse teamsIdFilesGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)
let page: number; //Page number (default 1) (optional) (default to undefined)
let limit: number; //Items per page (default 10, max 100) (optional) (default to undefined)

const { status, data } = await apiInstance.teamsIdFilesGet(
    id,
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team ID | defaults to undefined|
| **page** | [**number**] | Page number (default 1) | (optional) defaults to undefined|
| **limit** | [**number**] | Items per page (default 10, max 100) | (optional) defaults to undefined|


### Return type

**DtoFileListResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**403** | Forbidden |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdFilesPost**
> DtoFileUploadResponse teamsIdFilesPost(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoFileUploadRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)
let request: DtoFileUploadRequest; //File upload request

const { status, data } = await apiInstance.teamsIdFilesPost(
    id,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoFileUploadRequest**| File upload request | |
| **id** | [**string**] | Team ID | defaults to undefined|


### Return type

**DtoFileUploadResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**403** | Forbidden |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdGet**
> EntityTeam teamsIdGet()

Get team details by ID

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)

const { status, data } = await apiInstance.teamsIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team ID | defaults to undefined|


### Return type

**EntityTeam**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Team not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdPut**
> EntityTeam teamsIdPut(team)

Update team details by providing team ID and updated details

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    EntityTeam
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)
let team: EntityTeam; //Updated team details

const { status, data } = await apiInstance.teamsIdPut(
    id,
    team
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **team** | **EntityTeam**| Updated team details | |
| **id** | [**string**] | Team ID | defaults to undefined|


### Return type

**EntityTeam**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdUsersGet**
> Array<DtoUserResponse> teamsIdUsersGet()

Get all users that are members of a specific team

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //Team ID (default to undefined)

const { status, data } = await apiInstance.teamsIdUsersGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Team ID | defaults to undefined|


### Return type

**Array<DtoUserResponse>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request - Invalid team ID |  -  |
|**404** | Team not found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsPost**
> EntityTeam teamsPost(request)

Create a new team with the provided details

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoTeamRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: DtoTeamRequest; //Team details

const { status, data } = await apiInstance.teamsPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoTeamRequest**| Team details | |


### Return type

**EntityTeam**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsUsersDelete**
> DtoAddUserToTeamResponse teamsUsersDelete(request)

Deletes a user from a team by providing team ID

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoUserToTeamRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: DtoUserToTeamRequest; //User ID and Team ID

const { status, data } = await apiInstance.teamsUsersDelete(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoUserToTeamRequest**| User ID and Team ID | |


### Return type

**DtoAddUserToTeamResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User removed from team |  -  |
|**400** | Invalid request body or error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsUsersPut**
> DtoAddUserToTeamResponse teamsUsersPut(request)

Adds a user to a team by providing user ID and team ID

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoUserToTeamRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: DtoUserToTeamRequest; //User ID and Team ID

const { status, data } = await apiInstance.teamsUsersPut(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoUserToTeamRequest**| User ID and Team ID | |


### Return type

**DtoAddUserToTeamResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Invalid request body or error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersGet**
> Array<EntityUser> usersGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.usersGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<EntityUser>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdDelete**
> { [key: string]: string; } usersIdDelete()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The user\'s ID (default to undefined)

const { status, data } = await apiInstance.usersIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | The user\&#39;s ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdFriendsGet**
> Array<EntityUser> usersIdFriendsGet()

Get list of friends for a user (accepted requests)

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //User ID (default to undefined)

const { status, data } = await apiInstance.usersIdFriendsGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | User ID | defaults to undefined|


### Return type

**Array<EntityUser>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdGet**
> EntityUser usersIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The user\'s ID (default to undefined)

const { status, data } = await apiInstance.usersIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | The user\&#39;s ID | defaults to undefined|


### Return type

**EntityUser**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdMutualOtherIdGet**
> Array<EntityUser> usersIdMutualOtherIdGet()

Get list of mutual friends between userA and userB

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //User A ID (default to undefined)
let otherId: string; //User B ID (default to undefined)

const { status, data } = await apiInstance.usersIdMutualOtherIdGet(
    id,
    otherId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | User A ID | defaults to undefined|
| **otherId** | [**string**] | User B ID | defaults to undefined|


### Return type

**Array<EntityUser>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdPasswordPut**
> { [key: string]: string; } usersIdPasswordPut(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoUserPasswordRequestDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The user\'s ID (default to undefined)
let request: DtoUserPasswordRequestDTO; //The password update request

const { status, data } = await apiInstance.usersIdPasswordPut(
    id,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoUserPasswordRequestDTO**| The password update request | |
| **id** | [**string**] | The user\&#39;s ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdPatch**
> DtoUserUpdateResponseDTO usersIdPatch(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoUserUpdateRequestDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The user\'s ID (default to undefined)
let request: DtoUserUpdateRequestDTO; //The user profile update (all fields optional)

const { status, data } = await apiInstance.usersIdPatch(
    id,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoUserUpdateRequestDTO**| The user profile update (all fields optional) | |
| **id** | [**string**] | The user\&#39;s ID | defaults to undefined|


### Return type

**DtoUserUpdateResponseDTO**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdStatisticsGet**
> DtoStatisticsResponse usersIdStatisticsGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The user\'s ID (default to undefined)

const { status, data } = await apiInstance.usersIdStatisticsGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | The user\&#39;s ID | defaults to undefined|


### Return type

**DtoStatisticsResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersIdStatisticsPut**
> DtoStatisticsResponse usersIdStatisticsPut(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoUpdateStatisticsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; //The user\'s ID (default to undefined)
let request: DtoUpdateStatisticsRequest; //The statistics update request

const { status, data } = await apiInstance.usersIdStatisticsPut(
    id,
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoUpdateStatisticsRequest**| The statistics update request | |
| **id** | [**string**] | The user\&#39;s ID | defaults to undefined|


### Return type

**DtoStatisticsResponse**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersLoginPost**
> DtoLoginResponse usersLoginPost(request)

Accepts either `email` or `username` along with `password`. Returns an access token and the full user (without password).

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoLoginRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: DtoLoginRequest; //The login request (email or username + password)

const { status, data } = await apiInstance.usersLoginPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoLoginRequest**| The login request (email or username + password) | |


### Return type

**DtoLoginResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersSignupPost**
> DtoSignUpUserResponse usersSignupPost(request)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DtoSignUpUserRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let request: DtoSignUpUserRequest; //The sign-up request

const { status, data } = await apiInstance.usersSignupPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoSignUpUserRequest**| The sign-up request | |


### Return type

**DtoSignUpUserResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**409** | Conflict |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **voiceJoinRoomIdGet**
> voiceJoinRoomIdGet()

Establishes a WebSocket connection for voice communication in a room

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let roomId: string; //Room ID to join (default to undefined)
let userId: string; //User ID joining the room (default to undefined)

const { status, data } = await apiInstance.voiceJoinRoomIdGet(
    roomId,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roomId** | [**string**] | Room ID to join | defaults to undefined|
| **userId** | [**string**] | User ID joining the room | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**101** | Switching Protocols |  -  |
|**400** | Bad Request |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **voiceJoinableGet**
> Array<ControllerRoomResponse> voiceJoinableGet()

Returns all group and private rooms that the user is authorized to join and are not full

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let userId: string; //User ID of the client (default to undefined)

const { status, data } = await apiInstance.voiceJoinableGet(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] | User ID of the client | defaults to undefined|


### Return type

**Array<ControllerRoomResponse>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **voicePrivateCallPost**
> EntityVoiceRoom voicePrivateCallPost()

Creates a private voice room for two users with restricted access

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let callerId: string; //ID of the user initiating the call (default to undefined)
let targetId: string; //ID of the user being called (default to undefined)
let teamId: string; //Team ID for context (optional) (default to undefined)

const { status, data } = await apiInstance.voicePrivateCallPost(
    callerId,
    targetId,
    teamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **callerId** | [**string**] | ID of the user initiating the call | defaults to undefined|
| **targetId** | [**string**] | ID of the user being called | defaults to undefined|
| **teamId** | [**string**] | Team ID for context | (optional) defaults to undefined|


### Return type

**EntityVoiceRoom**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **voiceRoomsTeamIdGet**
> Array<ControllerRoomResponse> voiceRoomsTeamIdGet()

Returns all group voice rooms belonging to a specific team

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let teamId: string; //Team ID (default to undefined)

const { status, data } = await apiInstance.voiceRoomsTeamIdGet(
    teamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamId** | [**string**] | Team ID | defaults to undefined|


### Return type

**Array<ControllerRoomResponse>**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **voiceRoomsTeamIdPost**
> EntityVoiceRoom voiceRoomsTeamIdPost()

Creates a new voice room for team members

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let teamId: string; //Team ID (default to undefined)
let userId: string; //User ID of the creator (default to undefined)
let name: string; //Room name (optional) (optional) (default to undefined)

const { status, data } = await apiInstance.voiceRoomsTeamIdPost(
    teamId,
    userId,
    name
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamId** | [**string**] | Team ID | defaults to undefined|
| **userId** | [**string**] | User ID of the creator | defaults to undefined|
| **name** | [**string**] | Room name (optional) | (optional) defaults to undefined|


### Return type

**EntityVoiceRoom**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**409** | Conflict |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

