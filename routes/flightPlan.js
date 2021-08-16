const router = require('express').Router();

let FlightPlan = require('../models/flightPlan.model');

//endpoint for getting flight plans from database
router.route('/').get((req, res) => {
    FlightPlan.find()
        .then((flightPlan) => res.json(flightPlan))
        .catch(err => res.status(400).json('Error ' + err))
})

//endpoint for creating flight plan document in database
router.route('/create').post((req, res) => {

    const origin = req.body.origin;
    const destination = req.body.destination;
    const plan = req.body.plan;

    const newFlightPlan = new FlightPlan({
        origin,
        destination,
        plan,
    })

    newFlightPlan.save()
        .then((flightPlan) => {
            res.json(flightPlan);
        })
        .catch(err => { res.status(400).json('Error ' + err) })
});

//endpoint for removing flight plan document from database
router.route('/:id').delete((req, res) => {
    FlightPlan.findByIdAndDelete(req.params.id)
        .then((flight) => {
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

//endpoint for updating flight plan document in database
router.route('/:id').patch((req, res) => {
    const query = { _id: req.params.id }
    const update = { $set: req.body };
    const options = { new: true };
    FlightPlan.findOneAndUpdate(query, update, options)
        .then((flight) => {
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;