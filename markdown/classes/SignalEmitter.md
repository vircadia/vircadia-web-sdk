[@vircadia/web-sdk](../README.md) / [Exports](../modules.md) / SignalEmitter

# Class: SignalEmitter

## Table of contents

### Constructors

- [constructor](SignalEmitter.md#constructor)

### Properties

- [#\_slots](SignalEmitter.md##_slots)

### Methods

- [connect](SignalEmitter.md#connect)
- [disconnect](SignalEmitter.md#disconnect)
- [emit](SignalEmitter.md#emit)
- [signal](SignalEmitter.md#signal)

## Constructors

### constructor

• **new SignalEmitter**()

## Properties

### #\_slots

• `Private` **#\_slots**: `Set`<[`Slot`](../modules.md#slot)\>

#### Defined in

[domain/shared/SignalEmitter.ts:56](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/SignalEmitter.ts#L56)

## Methods

### connect

▸ **connect**(`slot`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `slot` | [`Slot`](../modules.md#slot) |

#### Returns

`void`

#### Defined in

[domain/shared/SignalEmitter.ts:66](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/SignalEmitter.ts#L66)

___

### disconnect

▸ **disconnect**(`slot`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `slot` | [`Slot`](../modules.md#slot) |

#### Returns

`void`

#### Defined in

[domain/shared/SignalEmitter.ts:75](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/SignalEmitter.ts#L75)

___

### emit

▸ **emit**(...`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...params` | `any`[] |

#### Returns

`void`

#### Defined in

[domain/shared/SignalEmitter.ts:84](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/SignalEmitter.ts#L84)

___

### signal

▸ **signal**(): [`Signal`](../modules.md#signal)

#### Returns

[`Signal`](../modules.md#signal)

#### Defined in

[domain/shared/SignalEmitter.ts:94](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/SignalEmitter.ts#L94)
