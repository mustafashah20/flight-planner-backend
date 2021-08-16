const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//schema for cities containing name
const citiesSchema = new Schema({
    name: { type: String, required: true }
});

const City = mongoose.model('City', citiesSchema);

module.exports = City;