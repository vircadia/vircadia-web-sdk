# Networking Library

The networking library provides the means to connect to and communicate with a domain's domain server and assignment clients
using the same protocol as the native C++ client. The primary differences between this Web SDK and the native client are:
- The Web SDK code is client-only whereas the C++ library is used in both the Interface client and the domain server and assignment clients.
- The Web SDK communicates using WebRTC whereas the native client uses UDP.

## Key Classes

### Domain Server

```
// Handles the metaverse address being visited and navigating to domains.
AddressManager
```
```
// All the nodes (domain server and assignment clients) that the client is connected to.
// This includes their presence and communications with them via the Vircadia protocol.
NodeList : LimitedNodeList

    // Handles the connection to and interaction with the domain server.
    DomainHandler _domainHandler;

    // Collection of assignment clients that the client is connected to.
    // Note: Does not include the domain server.
    map<UUID, Node*> _nodeHash;

    // Dispatches packets received to registered listeners to handle.
    PacketReceiver _packetReceiver;

    // One-to-many socket connecting the client to the domain server and assignment clients.
    Socket _nodeSocket;

        // Details of all connections.
        map<HifiSockAddr, Connection*> _connectionsHash;

        // One-to-many WebRTC socket.
        // Provides a QUdpSocket-style interface for using a WebRTC data channel.
        // Note: C++ uses a NetworkSocket here that multiplexes UDP and WebRTC sockets.
        WebRTCSocket _webrtcSocket;

            // The WebRTC signaling channel communicating with the domain server, used to set up individual WebRTC
            // data channels for the domain server and each assignment client.
            WebRTCSignalingChannel _webrtcSignalingChannel;

            // Individual data channels for the domain server and each assignment client.
            // The ID is the WebRTC data channel ID assigned by us and are the equivalent of UDP ports.
            // Note: C++ uses a WebRTCDataChannels object here.
            Map<id, {NodeType, WebRTCDataChannel}> _webrtcDataChannelsByChannelID;

                // One-to-one WebRTC data channel.
                // Uses the domain server's signaling server to set up WebRTC connections with user Interfaces.
                WebRTCDataChannel;

```

### Assignment Clients

The same general structure as the Domain Server, except without the `WebRTCSignalingServer`.



## Key Data

### UDP and WebRTC Addresses

`SockAddr` values include what `SocketType` they are — UDP or WebRTC — so that data an be sent via the correct transport.

UDP `SockAddr` addresses and ports are the IP address and port of the UDP socket on the computer hosting the socket.

WebRTC `SockAddr` addresses are indirect:
- The IP address is that of the WebSocket being used for WebRTC signaling, not the actual UDP socket being used by the WebRTC data channel.
- The port is a locally assigned number (data channel ID) that identifies the WebRTC connection in the local computer, not some WebRTC "port" or the UDP port on the remote computer.

When communicating with a user client, the domain server and assignment clients all use the same address and port values for that user client. The WebRTC port (data channel ID) assigned by the domain server when the user client connects, is communicated to the assignment clients to use when the user client connects to them: the domain server includes the WebRTC port value to use in the WebRTC signaling messages it relays between the user and assignment clients.



## Key Operations

### Domain server connection

```
// Set the location.
DomainServer.connect(location);
    AddressManager.handleLookupString(location);
        AddressManager.handlerUrl(sanitizedAddress);
            AddressManager._domainUrl = url;
            AddressManager._possibleDomainChangeRequired.emit(this._domainUrl, Uuid.NULL);
                DomainHandler.setURLAndID(url, id);
                    DomainHandler._domainURL = url;
```
```
// Request and maintain connection the domain server.
DomainServer.connect(location);
    // Every second...
    NodeList.sendDomainServerCheckIn();

        // Open a WebRTC data channel to the domain server if not already open.
        const domainServerSocketState = NodeList._nodeSocket.getSocketState(domainURL, NodeType.DomainServer);
        if (domainServerSocketState !== Socket.CONNECTED) {
            console.log("[networking] Opening domain server connection. Will not send domain server check-in.");
            if (domainServerSocketState === Socket.UNCONNECTED) {
                NodeList._nodeSocket.openSocket(domainURL, NodeType.DomainServer, (socketID: number) => {
                    NodeList._domainHandler.setPort(socketID);
                });
            }
            return;
        }

        // If the domain server socket is connected...
        domainPacketType = isDomainConnected
            ? PacketType.DomainListRequest
            : PacketType.DomainConnectRequest;
        domainSockAddr = NodeList._domainHandler.getSockAddr();
        NodeList.sendPacket(packet, domainSockAddr);
```
```
// Handle DomainList packet received in response to DomainConnectRequest and DomainListRequest packets.
NodeList._packetReceiver.registerListener(PacketType.DomainList, NodeList.processDomainList);
NodeList.processDomainList(message);
    NodeList._domainHandler.setIsConnected(true);
```
```
// Disconnect from the domain server.
DomainServer.disconnect();
    DomainHandler.disconnect();
        sendDisconnectPacket();
        setIsConnected(false);
            emit disconnectedFromDomain();
                NodeList.reset("Reset from Domain Handler", true);
                    NodeList.reset();
                        LimitedNodeList.reset(reason);
                            Socket.clearConnections();
                                WebRTCSocket.abort();
```

### Assignment client connections

```
// Connect to an assignment client.
NodeList.processDomainList(message);
    LimitedNodeList.addNewNode();
        LimiteNodeList.addOrUpdateNode();
            emit nodeAdded();
                Application.nodeAdded();
                NodeList.openWebRTCConnection();
                    Socket.openSocket();
                        NodeList.activateSocketFromNodeCommunication();
                            NetworkPeer.activatePublicSocket() | NetworkPeer.activateLocalSocket();
                                NetworkPeer.setActiveSocket();
                                    emit socketActivated();
                                        emit nodeActivated();
                                            ...
                ...
            emit nodeActivated();  // If already connected.
                ...
```
Various actions are taken by different parts of the SDK upon `Application.nodeAdded()` and `Application.nodeActivated()`
to set up assignment client handling code, etc.

```
// Maintaining connection to an assignment client.
// Depends on the assignment client - e.g., AvatarMixer requires frequent updates in order for it to treat the user client as being connected.
```

```
// Disconnect.
LimitedNodeList::addOrUpdateNode();
    removeOldNode();
        LimitedNodeList.handleNodeKill();
            ...

LimitedNodeList::reset();
    LimitedNodeList.eraseAllNodes();
        LimitedNodeList.handleNodeKill();
            ...

NodeList::processDomainServerRemovedNode();
    LimitedNodeList.killNodeWithUUID();
        LimitedNodeList.handleNodeKill();
            emit nodeKilled(node);
                DomainServer.nodeKilled();  // Application::nodeKilled();
                ... Assignment client actions.
            Socket.cleanupConnection(*activeSocket);


LimitedNodeList.removeSilentNodes();  <<< Not implemented yet.
    LimitedNodeList.handleNodeKill();
        ...

LimitedNodeList::processKillNode();  <<< Not used in C++?! May have been old DomainServer code.
    LimitedNodeList.killNodeWithUUID();
        LimitedNodeList.handleNodeKill();
            ...
```


### Differences between the client and server WebRTC code

The server's WebRTC socket connects one node (domain server or an assignment client) to many user clients.
It listens for connections initiated by the user clients.
The "bind()" methods are used to set up the socket for listening. (I.e., "connectToHost()" methods are not used.)

A user client's WebRTC socket connects the client to many network nodes, i.e., the domain server and the assignment clients.
It initiated these connections.
The "connectToHost()" methods are used to initiate connections. (I.e., "bind()" methods are not used.)
