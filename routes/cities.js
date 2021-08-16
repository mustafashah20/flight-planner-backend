const router = require('express').Router();

let City = require('../models/cities.model');

//endpoint for getting all cities from database
router.route('/').get((req, res) => {
    City.find()
        .then(cities => res.json(cities))
        .catch(err => res.status(400).json('Error ' + err))
})

//endpoint for creating city document in database
router.route('/create').post((req, res) => {

    const name = req.body.name;

    const newCity = new City({
        name
    })

    newCity.save()
        .then((city) => res.json(city))
        .catch(err => { res.status(400).json('Error ' + err) })
});

//endpoint for removing city document from database
router.route('/:id').delete((req, res) => {
    City.findByIdAndDelete(req.params.id)
        .then((city) => res.json(city))
        .catch(err => res.status(400).json('Error ' + err))
});

//endpoint for updating city document in database
router.route('/:id').patch((req, res) => {
    const updateObject = req.body;
    const id = req.params.id
    City.updateOne({ _id: Object(id) }, { $set: updateObject })
        .then((city) => res.json(city))
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;