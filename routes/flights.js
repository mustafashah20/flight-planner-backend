const router = require('express').Router();
const Graph = require('node-dijkstra');

let City = require('../models/cities.model');
let Flight = require('../models/flights.model');
let FlightPlan = require('../models/flightPlan.model');

global.graph;

router.route('/').get((req, res) => {
    Flight.find()
        .then((flights) => res.json(flights))
        .catch(err => res.status(400).json('Error ' + err))
})

router.route('/:id').get((req, res) => {
    Flight.findOne({
        _id: req.params.id
    })
        .then((flight) => res.json(flight))
        .catch(err => res.status(400).json('Error ' + err))
})

router.route('/plan/:origin/:destination').get(async (req, res) => {
    const reqOrigin = req.params.origin;
    const reqDestination = req.params.destination;
    FlightPlan.findOne({ origin: reqOrigin, destination: reqDestination })
        .then(async (flightPlan) => {
            if (flightPlan) {
                res.json(flightPlan.plan);
            }
            else {
                const shortestPath = global.graph.path(reqOrigin, reqDestination);
                const flightPlan = await getFlightPlan(shortestPath);

                if (flightPlan.length > 0) {
                    const newFlightPlan = new FlightPlan({
                        origin: reqOrigin,
                        destination: reqDestination,
                        plan: flightPlan,
                    })

                    newFlightPlan.save()
                        .then(() => {
                            console.log("New Flight Plan Created")
                        })
                }


                res.json(flightPlan);
            }

        })


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
    const query = { _id: req.params.id }
    const update = { $set: req.body };
    const options = { new: true };
    Flight.findOneAndUpdate(query, update, options)
        .then((flight) => {
            updateGraph(flight);
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;