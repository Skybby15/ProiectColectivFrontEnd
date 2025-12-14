# DtoFileUploadRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**content** | **string** |  | [default to undefined]
**contextId** | **string** | Set automatically from URL (teamId or chatId) | [optional] [default to undefined]
**contextType** | **string** | Set automatically from URL (\&quot;team\&quot; or \&quot;chat\&quot;) | [optional] [default to undefined]
**extension** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**ownerId** | **string** |  | [default to undefined]
**size** | **number** |  | [default to undefined]
**type** | **string** |  | [default to undefined]

## Example

```typescript
import { DtoFileUploadRequest } from './api';

const instance: DtoFileUploadRequest = {
    content,
    contextId,
    contextType,
    extension,
    name,
    ownerId,
    size,
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
