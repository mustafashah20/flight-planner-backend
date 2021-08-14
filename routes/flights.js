const router = require('express').Router();
const Graph = require('node-dijkstra');

let City = require('../models/cities.model');
let Flight = require('../models/flights.model');

global.graph;

router.route('/').get((req, res) => {
    Flight.find()
        .then((flights) => res.json(flights))
        .catch(err => res.status(400).json('Error ' + err))
})

router.route('/plan').get(async (req, res) => {
    const data = decodeURI(req.query.data);
    const payload = JSON.parse(data);
    const origin = payload.origin;
    const destination = payload.destination
    const shortestPath = global.graph.path(origin, destination);
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
            })
                .then((flight) => {
                    flightPlan.push(flight[0]);
                    resolve();
                })
                .catch((err) => {
                    console.log("Error finding flights" + err);
                    reject();
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
    global.graph = new Graph(tempGraph);
}

const updateGraph = (flight) => {
    Flight.find({ origin: flight.origin })
        .then((flights) => {
            global.graph.removeNode(flight.origin);
            const neighbours = new Map();
            for (let j = 0; j < flights.length; j++) {
                neighbours.set(flights[j].destination, flights[j].cost);
            }
            if (neighbours.size > 0) {
                global.graph.addNode(flight.origin, neighbours);
            }
            console.log(global.graph);
        })
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
            updateGraph(flight);
            res.json(flight);
        })
        .catch(err => { res.status(400).json('Error ' + err) })
});

router.route('/:id').delete((req, res) => {
    Flight.findByIdAndDelete(req.params.id)
        .then((flight) => {
            updateGraph(flight);
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

router.route('/:id').patch((req, res) => {
    const updateObject = req.body;
    const id = req.params.id
    Flight.updateOne({ _id: Object(id) }, { $set: updateObject })
        .then((flight) => {
            updateGraph(flight);
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;