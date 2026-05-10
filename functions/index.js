const {setGlobalOptions} = require("firebase-functions");

setGlobalOptions({maxInstances: 10});

// No callable functions are required for the unrestricted public app.
