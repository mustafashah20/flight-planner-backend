const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const citiesSchema = new Schema({
    name: { type: String, required: true }
});

const City = mongoose.model('City', citiesSchema);

module.exports = City;