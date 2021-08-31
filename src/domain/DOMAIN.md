# Domain Files

The files in the `/domain` directory are used in the domain server and assignment client APIs implemented in the root directory
files:
- `AgentClient.ts`
- `AudioMixer.ts`
- `AssetServer.ts`
- `AvatarMixer.ts`
- `DomainServer.ts`
- `EntityServer.ts`
- `MessageMixer.ts`

The files in the `/domain` directory reflect the native Interface app code, with files, classes, and variables named the same
and reimplemented in JavaScript. This helps lighten the intellectual load of understanding and maintaining both codebases and
enables searches to be done on both sets of code simultaneously.

Simplifications can often be made in the web SDK where, for example, it's not necessary to implement domain server or assignment
client code, handle UDP communications, etc. Code might not need to be implemented, class hierarchies might be able to be
collapsed, etc.

The mappings of the JavaScript code to the C++ code and simplifications made are explicitly documented to aid maintenance.
