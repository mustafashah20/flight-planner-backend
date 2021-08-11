const router = require('express').Router();

let Flight = require('../models/flights.model');

router.route('/').get((req, res) => {
    Flight.find()
        .then(flights => res.json(flights))
        .catch(err => res.status(400).json('Error ' + err))
})

router.route('/create').post((req, res) => {

    const origin = req.body.origin;
    const destination = req.body.destination;
    const cost = req.body.cost;

    const newFlight = new Flight({
        origin,
        destination,
        cost,
    })

    newFlight.save()
        .then(() => { res.json('Flight Created.') })
        .catch(err => { res.status(400).json('Error ' + err) })
});

router.route('/:id').delete((req, res) => {
    Flight.findByIdAndDelete(req.params.id)
        .then(() => res.json('Flight deleted.'))
        .catch(err => res.status(400).json('Error ' + err))
});

router.route('/:id').patch((req, res) => {
    const updateObject = req.body;
    const id = req.params.id
    Flight.updateOne({ _id: Object(id) }, { $set: updateObject })
        .then(() => res.json('Flight updated.'))
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;