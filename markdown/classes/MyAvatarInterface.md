[@vircadia/web-sdk](../README.md) / [Exports](../modules.md) / MyAvatarInterface

# Class: MyAvatarInterface

## Table of contents

### Constructors

- [constructor](MyAvatarInterface.md#constructor)

### Properties

- [#\_avatarManager](MyAvatarInterface.md##_avatarmanager)

### Accessors

- [displayName](MyAvatarInterface.md#displayname)
- [displayNameChanged](MyAvatarInterface.md#displaynamechanged)
- [orientation](MyAvatarInterface.md#orientation)
- [position](MyAvatarInterface.md#position)
- [sessionDisplayName](MyAvatarInterface.md#sessiondisplayname)
- [sessionDisplayNameChanged](MyAvatarInterface.md#sessiondisplaynamechanged)

## Constructors

### constructor

• **new MyAvatarInterface**(`contextID`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `contextID` | `number` |

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:41](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L41)

## Properties

### #\_avatarManager

• `Private` **#\_avatarManager**: `AvatarManager`

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:38](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L38)

## Accessors

### displayName

• `get` **displayName**(): `string`

#### Returns

`string`

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:46](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L46)

• `set` **displayName**(`displayName`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `displayName` | `string` |

#### Returns

`void`

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:51](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L51)

___

### displayNameChanged

• `get` **displayNameChanged**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:63](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L63)

___

### orientation

• `get` **orientation**(): [`quat`](../modules.md#quat)

#### Returns

[`quat`](../modules.md#quat)

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:92](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L92)

• `set` **orientation**(`orientation`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `orientation` | [`quat`](../modules.md#quat) |

#### Returns

`void`

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:96](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L96)

___

### position

• `get` **position**(): [`vec3`](../modules.md#vec3)

#### Returns

[`vec3`](../modules.md#vec3)

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:80](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L80)

• `set` **position**(`position`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | [`vec3`](../modules.md#vec3) |

#### Returns

`void`

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:84](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L84)

___

### sessionDisplayName

• `get` **sessionDisplayName**(): `string`

#### Returns

`string`

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:67](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L67)

___

### sessionDisplayNameChanged

• `get` **sessionDisplayNameChanged**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[domain/interfaces/MyAvatarInterface.ts:76](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/MyAvatarInterface.ts#L76)
