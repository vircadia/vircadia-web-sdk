[@vircadia/web-sdk](../README.md) / [Exports](../modules.md) / AvatarMixer

# Class: AvatarMixer

## Hierarchy

- `AssignmentClient`

  ↳ **`AvatarMixer`**

## Table of contents

### Constructors

- [constructor](AvatarMixer.md#constructor)

### Properties

- [#\_assignmentClientNode](AvatarMixer.md##_assignmentclientnode)
- [#\_avatarListInterface](AvatarMixer.md##_avatarlistinterface)
- [#\_avatarManager](AvatarMixer.md##_avatarmanager)
- [#\_myAvatarInterface](AvatarMixer.md##_myavatarinterface)
- [#\_nodeList](AvatarMixer.md##_nodelist)
- [#\_nodeType](AvatarMixer.md##_nodetype)
- [#\_onStateChanged](AvatarMixer.md##_onstatechanged)
- [#\_state](AvatarMixer.md##_state)

### Accessors

- [avatarList](AvatarMixer.md#avatarlist)
- [myAvatar](AvatarMixer.md#myavatar)
- [onStateChanged](AvatarMixer.md#onstatechanged)
- [state](AvatarMixer.md#state)
- [CONNECTED](AvatarMixer.md#connected)
- [DISCONNECTED](AvatarMixer.md#disconnected)
- [UNAVAILABLE](AvatarMixer.md#unavailable)

### Methods

- [#setState](AvatarMixer.md##setstate)
- [update](AvatarMixer.md#update)
- [stateToString](AvatarMixer.md#statetostring)

## Constructors

### constructor

• **new AvatarMixer**(`contextID`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `contextID` | `number` |

#### Overrides

AssignmentClient.constructor

#### Defined in

[AvatarMixer.ts:92](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AvatarMixer.ts#L92)

## Properties

### #\_assignmentClientNode

• `Private` **#\_assignmentClientNode**: ``null`` \| `Node`

#### Inherited from

AssignmentClient.#\_assignmentClientNode

#### Defined in

[domain/AssignmentClient.ts:100](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L100)

___

### #\_avatarListInterface

• `Private` **#\_avatarListInterface**: [`AvatarListInterface`](AvatarListInterface.md)

#### Defined in

[AvatarMixer.ts:89](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AvatarMixer.ts#L89)

___

### #\_avatarManager

• `Private` **#\_avatarManager**: `AvatarManager`

#### Defined in

[AvatarMixer.ts:87](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AvatarMixer.ts#L87)

___

### #\_myAvatarInterface

• `Private` **#\_myAvatarInterface**: [`MyAvatarInterface`](MyAvatarInterface.md)

#### Defined in

[AvatarMixer.ts:88](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AvatarMixer.ts#L88)

___

### #\_nodeList

• `Private` **#\_nodeList**: `NodeList`

#### Inherited from

AssignmentClient.#\_nodeList

#### Defined in

[domain/AssignmentClient.ts:96](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L96)

___

### #\_nodeType

• `Private` **#\_nodeType**: `NodeTypeValue`

#### Inherited from

AssignmentClient.#\_nodeType

#### Defined in

[domain/AssignmentClient.ts:98](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L98)

___

### #\_onStateChanged

• `Private` **#\_onStateChanged**: ``null`` \| `OnStateChanged` = `null`

#### Inherited from

AssignmentClient.#\_onStateChanged

#### Defined in

[domain/AssignmentClient.ts:101](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L101)

___

### #\_state

• `Private` **#\_state**: [`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Inherited from

AssignmentClient.#\_state

#### Defined in

[domain/AssignmentClient.ts:99](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L99)

## Accessors

### avatarList

• `get` **avatarList**(): [`AvatarListInterface`](AvatarListInterface.md)

#### Returns

[`AvatarListInterface`](AvatarListInterface.md)

#### Defined in

[AvatarMixer.ts:111](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AvatarMixer.ts#L111)

___

### myAvatar

• `get` **myAvatar**(): [`MyAvatarInterface`](MyAvatarInterface.md)

#### Returns

[`MyAvatarInterface`](MyAvatarInterface.md)

#### Defined in

[AvatarMixer.ts:107](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AvatarMixer.ts#L107)

___

### onStateChanged

• `set` **onStateChanged**(`callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `OnStateChanged` |

#### Returns

`void`

#### Inherited from

AssignmentClient.onStateChanged

#### Defined in

[domain/AssignmentClient.ts:151](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L151)

___

### state

• `get` **state**(): [`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Returns

[`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Inherited from

AssignmentClient.state

#### Defined in

[domain/AssignmentClient.ts:146](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L146)

___

### CONNECTED

• `Static` `get` **CONNECTED**(): [`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Returns

[`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Inherited from

AssignmentClient.CONNECTED

#### Defined in

[domain/AssignmentClient.ts:78](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L78)

___

### DISCONNECTED

• `Static` `get` **DISCONNECTED**(): [`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Returns

[`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Inherited from

AssignmentClient.DISCONNECTED

#### Defined in

[domain/AssignmentClient.ts:74](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L74)

___

### UNAVAILABLE

• `Static` `get` **UNAVAILABLE**(): [`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Returns

[`AssignmentClientState`](../enums/AssignmentClientState.md)

#### Inherited from

AssignmentClient.UNAVAILABLE

#### Defined in

[domain/AssignmentClient.ts:70](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L70)

## Methods

### #setState

▸ `Private` **#setState**(`state`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `number` |

#### Returns

`void`

#### Inherited from

AssignmentClient.#setState

#### Defined in

[domain/AssignmentClient.ts:162](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L162)

___

### update

▸ **update**(): `void`

#### Returns

`void`

#### Defined in

[AvatarMixer.ts:120](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AvatarMixer.ts#L120)

___

### stateToString

▸ `Static` **stateToString**(`state`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AssignmentClientState`](../enums/AssignmentClientState.md) |

#### Returns

`string`

#### Inherited from

AssignmentClient.stateToString

#### Defined in

[domain/AssignmentClient.ts:89](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L89)
