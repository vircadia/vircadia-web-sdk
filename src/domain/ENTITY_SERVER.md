# Entity Server API


## C++ Interface Interaction with the Entity Server


### Entity Data Storage

In Interface, the entity data are stored in an octree in `EntityTreeRenderer`.


### Receiving Entity Data from the Entity Server

#### Outgoing Packets Sent

##### `EntityQuery`

Sent by `Application::queryOctree()` which is called in:
- `Application::update()`. This is the main game loop.
- `Application::reloadResourceCaches()`. This is called in response to the "Edit > Reload Content" and "Developer > Network > Reload Content" menu items.

`Application::queryOctree()` involves sending one or more view frustums:
- Initially during initial loading (`!_physicsEnabled`) it is simply a 10m sphere based on the `MyAvatar` position.
- Later, once avatar and initial immediate content is loaded, it is one or more proper camera view frustums.

##### `OctreeDataNack`

Sent by `Application::sendNackPackets()` which is called in:
- `Application::update()`. This is the main game loop.


#### Incoming Packets Processed

##### `EntityData`

This is handled by `OctreePacketProcessor::handleOctreePacket()`. The packet is queued and later processed by `OctreePacketProcessor::ReceivedPacketProcessor::process()`.

The `OctreePacketProcessor` runs in its own thread and updates the entity octree.

##### `EntityQueryInitialResultsComplete`

This is handled by `OctreePacketProcessor::handleOctreePacket()`, as above.

##### `EntityErase`

This is handled by `OctreePacketProcessor::handleOctreePacket()`, as above.



### Sending Entity Data to the Entity Server

_TO DO LATER_



## TypeScript SDK Interaction with the Entity Server


### Entity Data Storage

The Web SDK does not store entity data — this is the responsibility of the user application. The Web SDK API provides the means for the user application to obtain new and changed entity data from the entity server and to create new and changed entity data on the entity server.


### Receiving Entity Data from the Entity Server

`EntityServer.update()` is a game loop method for the user application to call frequently. _(Similar to the `AvatarMixer` class's `update()` method.)_


#### Outgoing Packets Sent

##### `EntityQuery`

Sent by `EntityServer.#queryOctree()` which is called in `EntityServer.update()`.

`EntityServer.#queryOctree()`:
- The C++'s physics enabled/disabled condition, safe landing, and interstitial mode are all application-level concerns not relevant to the Web SDK's `EntityServer`.
- _TODO: `EntityServer` API for setting/getting view frustums. Perhaps with a user-friendly name such as "cameras" rather than "view frustum"._

_TO DO LATER:`EntityServer.reloadContent()` as an equivalent of `Application::reloadResourceCaches()`._

##### `OctreeDataNack`

Sent by `EntityServer.#sendNackPackets()` which is called in `EntityServer.update()`.


#### Incoming Packets Processed

`EntityServer.#_octreeProcessor` is the `OctreePacketProcessor` which handles the incoming packets. It doesn't run in its own thread because the Web SDK simply forwards the data to the user application which has the responsibility of handling the data in an equivalent of the C++'s octree.

##### `EntityData`

This is handled by `OctreePacketProcessor.handleOctreePacket()`. The packet is not queued for later processing; instead, it is immediately processed by `OctreePacketProcessor.processPacket()`.

The user application is notified of the new or changed entity via the `EntityServer.entityData` signal. This signal (unlike the scripting API's `Entities.addingEntity` signal) includes all the entity data (not just the entity ID) because the user application will want all the data in order to render it.

_TO DO: Instead of an `EntityServer.entityData` signal should there be `entityAdded` and `entityUpdated` signals?_

_TO DO: For entity edits, does the `EntityData` packet contain partial entity data, in which case the `EntityServer` may need to keep its own copy of all the entities in order to provide usable information in the API?_


##### `EntityQueryInitialResultsComplete`

This is handled by `OctreePacketProcessor.handleOctreePacket()`, as above.

The user application is notified of the completion via the `EntityServer.completedInitialQuery` signal.

##### `EntityErase`

This is handled by `OctreePacketProcessor.handleOctreePacket()`, as above.

The user application is notified of the entity deletion via the `EntityServer.entityDeleted` signal. This signal (like the scripting API's `Entities.deletingEntity` signal) includes just the entity ID.


### Sending Entity Data to the Entity Server

_TO DO LATER_
