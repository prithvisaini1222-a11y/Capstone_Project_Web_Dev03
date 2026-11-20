const EventEmitter = require("events");
// EventEmitter decouples business events from notification delivery.
const eventBus = new EventEmitter();
module.exports = { eventBus };
