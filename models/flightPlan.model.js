const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Flight = require('./flights.model')

const flightPlanSchema = new Schema({
    origin: { type: String, required: true },
    destination: { type: String, requiured: true },
    plan: [{
        origin: { type: String, required: true },
        destination: { type: String, requiured: true },
        cost: { type: Number, required: true },
    }],
});

const FlightPlan = mongoose.model('FlightPlan', flightPlanSchema);

module.exports = FlightPlan;