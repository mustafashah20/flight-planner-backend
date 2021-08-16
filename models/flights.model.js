const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//schema for the flights
//contains origin, destination and cost
const flightSchema = new Schema({
    origin: { type: String, required: true },
    destination: { type: String, requiured: true },
    cost: { type: Number, required: true },
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;