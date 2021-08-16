const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Flight = require('./flights.model')

//schema for the flight plan
//contains origin, destination, plan(list of flights) and version
const flightPlanSchema = new Schema({
    origin: { type: String, required: true },
    destination: { type: String, requiured: true },
    plan: [{
        origin: { type: String, required: true },
        destination: { type: String, requiured: true },
        cost: { type: Number, required: true },
    }],
    version: { type: Number, required: true },
});

const FlightPlan = mongoose.model('FlightPlan', flightPlanSchema);

module.exports = FlightPlan;