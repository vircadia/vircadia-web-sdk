exports.handlers = {

    // This event is triggered when a new doclet has been created
    // but before it is passed to the template for output
    newDoclet: function (e) {

        // we only care about hifi custom tags on namespace and class doclets
        if (e.doclet.kind === "namespace" || e.doclet.kind === "class") {
            var rows = [];
            if (e.doclet.hifiInterface) {
                rows.push("Interface Scripts");
            }
            if (e.doclet.hifiClientEntity) {
                rows.push("Client Entity Scripts");
            }
            if (e.doclet.hifiAvatar) {
                rows.push("Avatar Scripts");
            }
            if (e.doclet.hifiServerEntity) {
                rows.push("Server Entity Scripts");
            }
            if (e.doclet.hifiAssignmentClient) {
                rows.push("Assignment Client Scripts");
            }

            // Append an Available In: sentence at the beginning of the namespace description.
            if (rows.length > 0) {
                var availableIn = "<p class='availableIn'><b>Supported Script Types:</b> " + rows.join(" &bull; ") + "</p>";
             
                e.doclet.description = availableIn + (e.doclet.description ? e.doclet.description : "");
            }            
        }

        if (e.doclet.kind === "function" && e.doclet.returns && e.doclet.returns[0].type
                && e.doclet.returns[0].type.names[0] === "Signal"
                && e.doclet.name !== "signal") {  // Don't treat SignalEmitter.signal as a Signal.
            e.doclet.kind = "signal";
        }
    }
};

// Define custom hifi tags here
exports.defineTags = function (dictionary) {

    // @hifi-interface
    dictionary.defineTag("hifi-interface", {
        onTagged: function (doclet, tag) {
            doclet.hifiInterface = true;
        }
    });

    // @hifi-assignment-client
    dictionary.defineTag("hifi-assignment-client", {
        onTagged: function (doclet, tag) {
            doclet.hifiAssignmentClient = true;
        }
    });

    // @hifi-avatar-script
    dictionary.defineTag("hifi-avatar", {
        onTagged: function (doclet, tag) {
            doclet.hifiAvatar = true;
        }
    });

    // @hifi-client-entity
    dictionary.defineTag("hifi-client-entity", {
        onTagged: function (doclet, tag) {
            doclet.hifiClientEntity = true;
        }
    });

    // @hifi-server-entity
    dictionary.defineTag("hifi-server-entity", {
        onTagged: function (doclet, tag) {
            doclet.hifiServerEntity = true;
        }
    });

};
