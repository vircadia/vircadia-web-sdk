[@vircadia/web-sdk](../README.md) / [Exports](../modules.md) / AudioMixer

# Class: AudioMixer

## Hierarchy

- `AssignmentClient`

  ↳ **`AudioMixer`**

## Table of contents

### Constructors

- [constructor](AudioMixer.md#constructor)

### Properties

- [#\_assignmentClientNode](AudioMixer.md##_assignmentclientnode)
- [#\_audioClient](AudioMixer.md##_audioclient)
- [#\_audioOutput](AudioMixer.md##_audiooutput)
- [#\_audioWorkletRelativePath](AudioMixer.md##_audioworkletrelativepath)
- [#\_nodeList](AudioMixer.md##_nodelist)
- [#\_nodeType](AudioMixer.md##_nodetype)
- [#\_onStateChanged](AudioMixer.md##_onstatechanged)
- [#\_state](AudioMixer.md##_state)

### Accessors

- [audioInput](AudioMixer.md#audioinput)
- [audioOutput](AudioMixer.md#audiooutput)
- [audioWorkletRelativePath](AudioMixer.md#audioworkletrelativepath)
- [inputMuted](AudioMixer.md#inputmuted)
- [onStateChanged](AudioMixer.md#onstatechanged)
- [positionGetter](AudioMixer.md#positiongetter)
- [state](AudioMixer.md#state)
- [CONNECTED](AudioMixer.md#connected)
- [DISCONNECTED](AudioMixer.md#disconnected)
- [UNAVAILABLE](AudioMixer.md#unavailable)

### Methods

- [#setState](AudioMixer.md##setstate)
- [pause](AudioMixer.md#pause)
- [play](AudioMixer.md#play)
- [stateToString](AudioMixer.md#statetostring)

## Constructors

### constructor

• **new AudioMixer**(`contextID`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `contextID` | `number` |

#### Overrides

AssignmentClient.constructor

#### Defined in

[AudioMixer.ts:107](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L107)

## Properties

### #\_assignmentClientNode

• `Private` **#\_assignmentClientNode**: ``null`` \| `Node`

#### Inherited from

AssignmentClient.#\_assignmentClientNode

#### Defined in

[domain/AssignmentClient.ts:100](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/AssignmentClient.ts#L100)

___

### #\_audioClient

• `Private` **#\_audioClient**: `AudioClient`

#### Defined in

[AudioMixer.ts:101](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L101)

___

### #\_audioOutput

• `Private` **#\_audioOutput**: `AudioOutput`

#### Defined in

[AudioMixer.ts:102](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L102)

___

### #\_audioWorkletRelativePath

• `Private` **#\_audioWorkletRelativePath**: `string` = `""`

#### Defined in

[AudioMixer.ts:104](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L104)

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

### audioInput

• `set` **audioInput**(`audioInput`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `audioInput` | ``null`` \| `MediaStream` |

#### Returns

`void`

#### Defined in

[AudioMixer.ts:122](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L122)

___

### audioOutput

• `get` **audioOutput**(): `MediaStream`

#### Returns

`MediaStream`

#### Defined in

[AudioMixer.ts:118](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L118)

___

### audioWorkletRelativePath

• `get` **audioWorkletRelativePath**(): `string`

#### Returns

`string`

#### Defined in

[AudioMixer.ts:165](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L165)

• `set` **audioWorkletRelativePath**(`relativePath`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `relativePath` | `string` |

#### Returns

`void`

#### Defined in

[AudioMixer.ts:169](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L169)

___

### inputMuted

• `get` **inputMuted**(): `boolean`

#### Returns

`boolean`

#### Defined in

[AudioMixer.ts:135](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L135)

• `set` **inputMuted**(`inputMuted`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `inputMuted` | `boolean` |

#### Returns

`void`

#### Defined in

[AudioMixer.ts:139](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L139)

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

### positionGetter

• `set` **positionGetter**(`positionGetter`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `positionGetter` | [`AudioPositionGetter`](../modules.md#audiopositiongetter) |

#### Returns

`void`

#### Defined in

[AudioMixer.ts:147](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L147)

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

### pause

▸ **pause**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[AudioMixer.ts:201](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L201)

___

### play

▸ **play**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[AudioMixer.ts:191](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/AudioMixer.ts#L191)

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
