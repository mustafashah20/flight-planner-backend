const router = require('express').Router();
const Graph = require('node-dijkstra');

let City = require('../models/cities.model');
let Flight = require('../models/flights.model');

global.route;

router.route('/').get((req, res) => {
    Flight.find()
        .then((flights) => res.json(flights))
        .catch(err => res.status(400).json('Error ' + err))
})

router.route('/plan').get(async (req, res) => {
    const origin = req.body.origin;
    const destination = req.body.destination;
    const shortestPath = global.route.path(origin, destination);
    const flightPlan = await getFlightPlan(shortestPath);
    res.json(flightPlan);

})

const getFlightPlan = async (shortestPath) => {
    const flightPlan = [];
    let promiseArray = [];
    if (!shortestPath) {
        return [];
    }
    for (let i = 0, j = i + 1; j < shortestPath.length; i++, j++) {
        promiseArray.push(new Promise((resolve, reject) => {
            Flight.find({
                origin: shortestPath[i],
                destination: shortestPath[j]
            }).then((flight) => {
                flightPlan.push(flight[0]);
                resolve()
            })
        }))
    }
    await Promise.all(promiseArray);
    return flightPlan;
}

const getCitiesFlight = () => {
    City.find()
        .then((cities) => {
            Flight.find()
                .then((flights) => {
                    generateGraph(cities, flights);
                })
        })
}

getCitiesFlight();

const generateGraph = (cities, flights) => {
    const tempGraph = new Map();
    for (let i = 0; i < cities.length; i++) {
        const neighbours = new Map();
        for (let j = 0; j < flights.length; j++) {
            if (cities[i].name == flights[j].origin) {
                neighbours.set(flights[j].destination, flights[j].cost);
            }
        }
        if (neighbours.size > 0) {
            tempGraph.set(cities[i].name, neighbours);
        }
    }
    global.route = new Graph(tempGraph);
}

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
        .then((flight) => {
            getCitiesFlight();
            res.json(flight);
        })
        .catch(err => { res.status(400).json('Error ' + err) })
});

router.route('/:id').delete((req, res) => {
    Flight.findByIdAndDelete(req.params.id)
        .then((flight) => res.json(flight))
        .catch(err => res.status(400).json('Error ' + err))
});

router.route('/:id').patch((req, res) => {
    const updateObject = req.body;
    const id = req.params.id
    Flight.updateOne({ _id: Object(id) }, { $set: updateObject })
        .then((flight) => res.json(flight))
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;