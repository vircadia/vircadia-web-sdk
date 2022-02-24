[@vircadia/web-sdk](README.md) / Exports

# @vircadia/web-sdk

## Table of contents

### References

- [default](modules.md#default)

### Enumerations

- [AssignmentClientState](enums/AssignmentClientState.md)
- [ConnectionState](enums/ConnectionState.md)

### Classes

- [AudioMixer](classes/AudioMixer.md)
- [AvatarListInterface](classes/AvatarListInterface.md)
- [AvatarMixer](classes/AvatarMixer.md)
- [DomainServer](classes/DomainServer.md)
- [MessageMixer](classes/MessageMixer.md)
- [MyAvatarInterface](classes/MyAvatarInterface.md)
- [SignalEmitter](classes/SignalEmitter.md)
- [Uuid](classes/Uuid.md)

### Type aliases

- [AudioPositionGetter](modules.md#audiopositiongetter)
- [Signal](modules.md#signal)
- [Slot](modules.md#slot)
- [quat](modules.md#quat)
- [vec3](modules.md#vec3)

### Variables

- [Quat](modules.md#quat)
- [Vec3](modules.md#vec3)
- [Vircadia](modules.md#vircadia)

## References

### default

Renames and re-exports [Vircadia](modules.md#vircadia)

## Type aliases

### AudioPositionGetter

Ƭ **AudioPositionGetter**: () => [`vec3`](modules.md#vec3)

#### Type declaration

▸ (): [`vec3`](modules.md#vec3)

##### Returns

[`vec3`](modules.md#vec3)

#### Defined in

[domain/audio-client/AudioClient.ts:28](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/audio-client/AudioClient.ts#L28)

___

### Signal

Ƭ **Signal**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `connect` | (`slot`: [`Slot`](modules.md#slot)) => `void` |
| `disconnect` | (`slot`: [`Slot`](modules.md#slot)) => `void` |

#### Defined in

[domain/shared/SignalEmitter.ts:16](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/SignalEmitter.ts#L16)

___

### Slot

Ƭ **Slot**: (...`args`: `any`[]) => `void`

#### Type declaration

▸ (...`args`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`void`

#### Defined in

[domain/shared/SignalEmitter.ts:14](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/SignalEmitter.ts#L14)

___

### quat

Ƭ **quat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `w` | `number` |
| `x` | `number` |
| `y` | `number` |
| `z` | `number` |

#### Defined in

[domain/shared/Quat.ts:12](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/Quat.ts#L12)

___

### vec3

Ƭ **vec3**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |
| `z` | `number` |

#### Defined in

[domain/shared/Vec3.ts:12](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/Vec3.ts#L12)

## Variables

### Quat

• `Const` **Quat**: `__class`

#### Defined in

[domain/shared/Quat.ts:27](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/Quat.ts#L27)

___

### Vec3

• `Const` **Vec3**: `__class`

#### Defined in

[domain/shared/Vec3.ts:26](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/domain/shared/Vec3.ts#L26)

___

### Vircadia

• `Const` **Vircadia**: `__class`

#### Defined in

[Vircadia.ts:26](https://github.com/vircadia/vircadia-web-sdk/blob/773421d/src/Vircadia.ts#L26)
