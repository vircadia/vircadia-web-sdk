[@vircadia/web-sdk](../README.md) / [Exports](../modules.md) / DomainServer

# Class: DomainServer

## Table of contents

### Constructors

- [constructor](DomainServer.md#constructor)

### Properties

- [#\_DEBUG](DomainServer.md##_debug)
- [#\_addressManager](DomainServer.md##_addressmanager)
- [#\_contextID](DomainServer.md##_contextid)
- [#\_domainCheckInTimer](DomainServer.md##_domaincheckintimer)
- [#\_errorInfo](DomainServer.md##_errorinfo)
- [#\_location](DomainServer.md##_location)
- [#\_nodeList](DomainServer.md##_nodelist)
- [#\_onStateChanged](DomainServer.md##_onstatechanged)
- [#\_refusalInfo](DomainServer.md##_refusalinfo)
- [#\_sessionUUID](DomainServer.md##_sessionuuid)
- [#\_sessionUUIDChanged](DomainServer.md##_sessionuuidchanged)
- [#\_state](DomainServer.md##_state)
- [#DOMAIN\_SERVER\_CHECK\_IN\_MSECS](DomainServer.md##domain_server_check_in_msecs)

### Accessors

- [contextID](DomainServer.md#contextid)
- [errorInfo](DomainServer.md#errorinfo)
- [location](DomainServer.md#location)
- [onStateChanged](DomainServer.md#onstatechanged)
- [refusalInfo](DomainServer.md#refusalinfo)
- [sessionUUID](DomainServer.md#sessionuuid)
- [sessionUUIDChanged](DomainServer.md#sessionuuidchanged)
- [state](DomainServer.md#state)
- [CONNECTED](DomainServer.md#connected)
- [CONNECTING](DomainServer.md#connecting)
- [DISCONNECTED](DomainServer.md#disconnected)
- [ERROR](DomainServer.md#error)
- [REFUSED](DomainServer.md#refused)

### Methods

- [#domainConnectionRefused](DomainServer.md##domainconnectionrefused)
- [#nodeActivated](DomainServer.md##nodeactivated)
- [#nodeAdded](DomainServer.md##nodeadded)
- [#nodeKilled](DomainServer.md##nodekilled)
- [#sendDomainServerCheckIns](DomainServer.md##senddomainservercheckins)
- [#setSessionUUID](DomainServer.md##setsessionuuid)
- [#setState](DomainServer.md##setstate)
- [#stopDomainServerCheckins](DomainServer.md##stopdomainservercheckins)
- [connect](DomainServer.md#connect)
- [disconnect](DomainServer.md#disconnect)
- [stateToString](DomainServer.md#statetostring)

## Constructors

### constructor

• **new DomainServer**()

#### Defined in

[DomainServer.ts:148](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L148)

## Properties

### #\_DEBUG

• `Private` **#\_DEBUG**: `boolean` = `false`

#### Defined in

[DomainServer.ts:145](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L145)

___

### #\_addressManager

• `Private` **#\_addressManager**: `AddressManager`

#### Defined in

[DomainServer.ts:140](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L140)

___

### #\_contextID

• `Private` **#\_contextID**: `number`

#### Defined in

[DomainServer.ts:138](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L138)

___

### #\_domainCheckInTimer

• `Private` **#\_domainCheckInTimer**: ``null`` \| `Timeout` = `null`

#### Defined in

[DomainServer.ts:135](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L135)

___

### #\_errorInfo

• `Private` **#\_errorInfo**: `string` = `""`

#### Defined in

[DomainServer.ts:132](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L132)

___

### #\_location

• `Private` **#\_location**: `string` = `""`

#### Defined in

[DomainServer.ts:129](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L129)

___

### #\_nodeList

• `Private` **#\_nodeList**: `NodeList`

#### Defined in

[DomainServer.ts:139](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L139)

___

### #\_onStateChanged

• `Private` **#\_onStateChanged**: ``null`` \| `OnStateChanged` = `null`

#### Defined in

[DomainServer.ts:133](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L133)

___

### #\_refusalInfo

• `Private` **#\_refusalInfo**: `string` = `""`

#### Defined in

[DomainServer.ts:131](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L131)

___

### #\_sessionUUID

• `Private` **#\_sessionUUID**: [`Uuid`](Uuid.md)

#### Defined in

[DomainServer.ts:142](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L142)

___

### #\_sessionUUIDChanged

• `Private` **#\_sessionUUIDChanged**: [`SignalEmitter`](SignalEmitter.md)

#### Defined in

[DomainServer.ts:143](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L143)

___

### #\_state

• `Private` **#\_state**: [`ConnectionState`](../enums/ConnectionState.md) = `DomainServer.DISCONNECTED`

#### Defined in

[DomainServer.ts:130](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L130)

___

### #DOMAIN\_SERVER\_CHECK\_IN\_MSECS

▪ `Static` `Private` `Readonly` **#DOMAIN\_SERVER\_CHECK\_IN\_MSECS**: ``1000``

#### Defined in

[DomainServer.ts:126](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L126)

## Accessors

### contextID

• `get` **contextID**(): `number`

#### Returns

`number`

#### Defined in

[DomainServer.ts:227](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L227)

___

### errorInfo

• `get` **errorInfo**(): `string`

#### Returns

`string`

#### Defined in

[DomainServer.ts:208](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L208)

___

### location

• `get` **location**(): `string`

#### Returns

`string`

#### Defined in

[DomainServer.ts:196](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L196)

___

### onStateChanged

• `set` **onStateChanged**(`callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `OnStateChanged` |

#### Returns

`void`

#### Defined in

[DomainServer.ts:218](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L218)

___

### refusalInfo

• `get` **refusalInfo**(): `string`

#### Returns

`string`

#### Defined in

[DomainServer.ts:204](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L204)

___

### sessionUUID

• `get` **sessionUUID**(): [`Uuid`](Uuid.md)

#### Returns

[`Uuid`](Uuid.md)

#### Defined in

[DomainServer.ts:231](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L231)

___

### sessionUUIDChanged

• `get` **sessionUUIDChanged**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[DomainServer.ts:241](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L241)

___

### state

• `get` **state**(): [`ConnectionState`](../enums/ConnectionState.md)

#### Returns

[`ConnectionState`](../enums/ConnectionState.md)

#### Defined in

[DomainServer.ts:200](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L200)

___

### CONNECTED

• `Static` `get` **CONNECTED**(): [`ConnectionState`](../enums/ConnectionState.md)

#### Returns

[`ConnectionState`](../enums/ConnectionState.md)

#### Defined in

[DomainServer.ts:102](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L102)

___

### CONNECTING

• `Static` `get` **CONNECTING**(): [`ConnectionState`](../enums/ConnectionState.md)

#### Returns

[`ConnectionState`](../enums/ConnectionState.md)

#### Defined in

[DomainServer.ts:98](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L98)

___

### DISCONNECTED

• `Static` `get` **DISCONNECTED**(): [`ConnectionState`](../enums/ConnectionState.md)

#### Returns

[`ConnectionState`](../enums/ConnectionState.md)

#### Defined in

[DomainServer.ts:94](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L94)

___

### ERROR

• `Static` `get` **ERROR**(): [`ConnectionState`](../enums/ConnectionState.md)

#### Returns

[`ConnectionState`](../enums/ConnectionState.md)

#### Defined in

[DomainServer.ts:110](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L110)

___

### REFUSED

• `Static` `get` **REFUSED**(): [`ConnectionState`](../enums/ConnectionState.md)

#### Returns

[`ConnectionState`](../enums/ConnectionState.md)

#### Defined in

[DomainServer.ts:106](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L106)

## Methods

### #domainConnectionRefused

▸ `Private` **#domainConnectionRefused**(`reasonMessage`, `reasonCodeInt`, `extraInfo`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `reasonMessage` | `string` |
| `reasonCodeInt` | `number` |
| `extraInfo` | `string` |

#### Returns

`void`

#### Defined in

[DomainServer.ts:357](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L357)

___

### #nodeActivated

▸ `Private` **#nodeActivated**(`node`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `Node` |

#### Returns

`void`

#### Defined in

[DomainServer.ts:377](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L377)

___

### #nodeAdded

▸ `Private` **#nodeAdded**(`node`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `Node` |

#### Returns

`void`

#### Defined in

[DomainServer.ts:366](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L366)

___

### #nodeKilled

▸ `Private` **#nodeKilled**(`node`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `Node` |

#### Returns

`void`

#### Defined in

[DomainServer.ts:399](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L399)

___

### #sendDomainServerCheckIns

▸ `Private` **#sendDomainServerCheckIns**(): `void`

#### Returns

`void`

#### Defined in

[DomainServer.ts:335](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L335)

___

### #setSessionUUID

▸ `Private` **#setSessionUUID**(`sessionUUID`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sessionUUID` | [`Uuid`](Uuid.md) |

#### Returns

`void`

#### Defined in

[DomainServer.ts:420](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L420)

___

### #setState

▸ `Private` **#setState**(`state`, `info?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `state` | [`ConnectionState`](../enums/ConnectionState.md) | `undefined` |
| `info` | `string` | `""` |

#### Returns

`void`

#### Defined in

[DomainServer.ts:316](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L316)

___

### #stopDomainServerCheckins

▸ `Private` **#stopDomainServerCheckins**(): `void`

#### Returns

`void`

#### Defined in

[DomainServer.ts:345](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L345)

___

### connect

▸ **connect**(`location`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `location` | `string` |

#### Returns

`void`

#### Defined in

[DomainServer.ts:258](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L258)

___

### disconnect

▸ **disconnect**(): `void`

#### Returns

`void`

#### Defined in

[DomainServer.ts:305](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L305)

___

### stateToString

▸ `Static` **stateToString**(`state`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`ConnectionState`](../enums/ConnectionState.md) |

#### Returns

`string`

#### Defined in

[DomainServer.ts:120](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/DomainServer.ts#L120)
