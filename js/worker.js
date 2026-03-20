importScripts('stockfish.js');

let engineInstance = null;
let messageQueue = [];

// Initialize the Stockfish WASM engine
Stockfish().then((engine) => {
    engineInstance = engine;
    
    // Set up message forwarding from engine -> main thread
    engineInstance.addMessageListener((line) => {
        postMessage(line);
    });

    // Process any queued messages that were sent before initialization
    while (messageQueue.length > 0) {
        engineInstance.postMessage(messageQueue.shift());
    }
});

// Set up message forwarding from main thread -> engine
self.onmessage = function(event) {
    if (engineInstance) {
        engineInstance.postMessage(event.data);
    } else {
        messageQueue.push(event.data);
    }
};
