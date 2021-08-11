const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const flightSchema = new Schema({
    origin: { type: String, required: true },
    destination: { type: String, requiured: true },
    cost: { type: Number, required: true },
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;