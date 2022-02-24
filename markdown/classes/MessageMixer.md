[@vircadia/web-sdk](../README.md) / [Exports](../modules.md) / MessageMixer

# Class: MessageMixer

## Hierarchy

- `AssignmentClient`

  ↳ **`MessageMixer`**

## Table of contents

### Constructors

- [constructor](MessageMixer.md#constructor)

### Properties

- [#\_assignmentClientNode](MessageMixer.md##_assignmentclientnode)
- [#\_dataReceivedSignal](MessageMixer.md##_datareceivedsignal)
- [#\_messageReceivedSignal](MessageMixer.md##_messagereceivedsignal)
- [#\_messagesClient](MessageMixer.md##_messagesclient)
- [#\_nodeList](MessageMixer.md##_nodelist)
- [#\_nodeType](MessageMixer.md##_nodetype)
- [#\_onStateChanged](MessageMixer.md##_onstatechanged)
- [#\_state](MessageMixer.md##_state)

### Accessors

- [dataReceived](MessageMixer.md#datareceived)
- [messageReceived](MessageMixer.md#messagereceived)
- [onStateChanged](MessageMixer.md#onstatechanged)
- [state](MessageMixer.md#state)
- [CONNECTED](MessageMixer.md#connected)
- [DISCONNECTED](MessageMixer.md#disconnected)
- [UNAVAILABLE](MessageMixer.md#unavailable)

### Methods

- [#setState](MessageMixer.md##setstate)
- [sendData](MessageMixer.md#senddata)
- [sendMessage](MessageMixer.md#sendmessage)
- [subscribe](MessageMixer.md#subscribe)
- [unsubscribe](MessageMixer.md#unsubscribe)
- [stateToString](MessageMixer.md#statetostring)

## Constructors

### constructor

• **new MessageMixer**(`contextID`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `contextID` | `number` |

#### Overrides

AssignmentClient.constructor

#### Defined in

[MessageMixer.ts:84](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L84)

## Properties

### #\_assignmentClientNode

• `Private` **#\_assignmentClientNode**: ``null`` \| `Node`

#### Inherited from

AssignmentClient.#\_assignmentClientNode

#### Defined in

[domain/AssignmentClient.ts:100](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L100)

___

### #\_dataReceivedSignal

• `Private` **#\_dataReceivedSignal**: [`Signal`](../modules.md#signal)

#### Defined in

[MessageMixer.ts:79](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L79)

___

### #\_messageReceivedSignal

• `Private` **#\_messageReceivedSignal**: [`Signal`](../modules.md#signal)

#### Defined in

[MessageMixer.ts:78](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L78)

___

### #\_messagesClient

• `Private` **#\_messagesClient**: `MessagesClient`

#### Defined in

[MessageMixer.ts:81](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L81)

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

### dataReceived

• `get` **dataReceived**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[MessageMixer.ts:191](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L191)

___

### messageReceived

• `get` **messageReceived**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[MessageMixer.ts:177](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L177)

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

### sendData

▸ **sendData**(`channel`, `data`, `localOnly?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `channel` | `string` | `undefined` |
| `data` | `ArrayBuffer` | `undefined` |
| `localOnly` | `boolean` | `false` |

#### Returns

`void`

#### Defined in

[MessageMixer.ts:157](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L157)

___

### sendMessage

▸ **sendMessage**(`channel`, `message`, `localOnly?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `channel` | `string` | `undefined` |
| `message` | `string` | `undefined` |
| `localOnly` | `boolean` | `false` |

#### Returns

`void`

#### Defined in

[MessageMixer.ts:134](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L134)

___

### subscribe

▸ **subscribe**(`channel`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `channel` | `string` |

#### Returns

`void`

#### Defined in

[MessageMixer.ts:98](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L98)

___

### unsubscribe

▸ **unsubscribe**(`channel`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `channel` | `string` |

#### Returns

`void`

#### Defined in

[MessageMixer.ts:112](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/MessageMixer.ts#L112)

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
