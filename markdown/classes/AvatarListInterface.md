[@vircadia/web-sdk](../README.md) / [Exports](../modules.md) / AvatarListInterface

# Class: AvatarListInterface

## Table of contents

### Constructors

- [constructor](AvatarListInterface.md#constructor)

### Properties

- [#\_avatarManager](AvatarListInterface.md##_avatarmanager)

### Accessors

- [avatarAdded](AvatarListInterface.md#avataradded)
- [avatarRemoved](AvatarListInterface.md#avatarremoved)
- [count](AvatarListInterface.md#count)

### Methods

- [getAvatar](AvatarListInterface.md#getavatar)
- [getAvatarIDs](AvatarListInterface.md#getavatarids)

## Constructors

### constructor

• **new AvatarListInterface**(`contextID`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `contextID` | `number` |

#### Defined in

[domain/interfaces/AvatarListInterface.ts:33](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/AvatarListInterface.ts#L33)

## Properties

### #\_avatarManager

• `Private` **#\_avatarManager**: `AvatarManager`

#### Defined in

[domain/interfaces/AvatarListInterface.ts:30](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/AvatarListInterface.ts#L30)

## Accessors

### avatarAdded

• `get` **avatarAdded**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[domain/interfaces/AvatarListInterface.ts:73](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/AvatarListInterface.ts#L73)

___

### avatarRemoved

• `get` **avatarRemoved**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[domain/interfaces/AvatarListInterface.ts:84](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/AvatarListInterface.ts#L84)

___

### count

• `get` **count**(): `number`

#### Returns

`number`

#### Defined in

[domain/interfaces/AvatarListInterface.ts:38](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/AvatarListInterface.ts#L38)

## Methods

### getAvatar

▸ **getAvatar**(`id`): `ScriptAvatar`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | [`Uuid`](Uuid.md) |

#### Returns

`ScriptAvatar`

#### Defined in

[domain/interfaces/AvatarListInterface.ts:61](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/AvatarListInterface.ts#L61)

___

### getAvatarIDs

▸ **getAvatarIDs**(): [`Uuid`](Uuid.md)[]

#### Returns

[`Uuid`](Uuid.md)[]

#### Defined in

[domain/interfaces/AvatarListInterface.ts:49](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/interfaces/AvatarListInterface.ts#L49)
