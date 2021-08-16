const router = require('express').Router();
const Graph = require('node-dijkstra');

let City = require('../models/cities.model');
let Flight = require('../models/flights.model');
let FlightPlan = require('../models/flightPlan.model');

global.graph; //global variable for graph
global.graphVersion = 0; //global variable for graph version

//endpoint for getting flights from database
router.route('/').get((req, res) => {
    Flight.find()
        .then((flights) => res.json(flights))
        .catch(err => res.status(400).json('Error ' + err))
})

//endpoint for getting flight with given ID from database
router.route('/:id').get((req, res) => {
    Flight.findOne({
        _id: req.params.id
    })
        .then((flight) => res.json(flight))
        .catch(err => res.status(400).json('Error ' + err))
})

//endpoint for getting flight plan.
//gets flight plan from database if present.
//generates plan if new flight plan is requested.
router.route('/plan/:origin/:destination').get(async (req, res) => {
    const reqOrigin = req.params.origin;
    const reqDestination = req.params.destination;

    //getting flight plan with provided origin & destination from database
    FlightPlan.findOne({ origin: reqOrigin, destination: reqDestination })
        .then(async (flightPlan) => {
            //checking if flight plan is returned 
            if (flightPlan) {
                
                //checking if returned flight plan has version lower than global graph
                if (flightPlan.version < global.graphVersion) {

                    //removes the redundant flight plan from database
                    FlightPlan.findOneAndRemove({ origin: reqOrigin, destination: reqDestination }).then(async () => {

                        //creating new flight plan to return as response. 
                        const newFlightPlan = await createNewFlightPlan(reqOrigin, reqDestination)
                        res.json(newFlightPlan);
                    })
                }

                //checking if returned flight plan has same version as global graph
                else {
                    res.json(flightPlan.plan);
                }

            }

            //creating new flight plan in case null is returned from database
            else {
                const newFlightPlan = await createNewFlightPlan(reqOrigin, reqDestination);
                res.json(newFlightPlan);
            }
        })


})

//method for creating new flight plan and storing it in database
const createNewFlightPlan = async (reqOrigin, reqDestination) => {

    //get shortest path from graph between given origin & destination
    const shortestPath = global.graph.path(reqOrigin, reqDestination);

    //getting flight plan for the given shortest path
    const flightPlan = await getFlightPlan(shortestPath);

    //saving new flight plan in database
    if (flightPlan.length > 0) {
        const newFlightPlan = new FlightPlan({
            origin: reqOrigin,
            destination: reqDestination,
            plan: flightPlan,
            version: global.graphVersion
        })

        newFlightPlan.save()
            .then(() => {
                console.log("New Flight Plan Created")
            })
    }

    //returns newly generated flight plan
    return flightPlan;
}

//method for getting flight plan for given shortestpath
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

//method for getting cities and flights for generating graph
const getCitiesFlight = () => {
    City.find()
        .then((cities) => {
            Flight.find()
                .then((flights) => {

                    //generates new graph from given cities & flights
                    generateGraph(cities, flights);
                })
        })
}

//method for generating graph
const generateGraph = (cities, flights) => {
    const tempGraph = new Map();

    //iterate on list of cities
    for (let i = 0; i < cities.length; i++) {
        const neighbours = new Map();

        //iterate on list of flights
        for (let j = 0; j < flights.length; j++) {

            //set the ith city as origin and destinations of all flight as its neighbour
            //basically connects one way flights in graph
            if (cities[i].name == flights[j].origin) {
                neighbours.set(flights[j].destination, flights[j].cost);
            }
        }
        if (neighbours.size > 0) {
            tempGraph.set(cities[i].name, neighbours);
        }
    }

    //set the new graph created.
    global.graph = new Graph(tempGraph);

    //sets the version of graph.
    setGraphVersion()
}

//method for setting the version of global graph
//gets the highest versions from databse and sets it to graph version
const setGraphVersion = () => {
    FlightPlan.findOne().sort({ version: -1 })
        .then((flightplan) => {
            if(flightplan){
                global.graphVersion = flightplan.version;
            }
        })
}

//global call to get cities & flights to generate graph
//runs when server is started
getCitiesFlight();

//method for updating graph whenever flights are changed
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

//endpoint for creating flight document in database
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
            global.graphVersion++;
            res.json(flight);
        })
        .catch(err => { res.status(400).json('Error ' + err) })
});

//endpoint for removing flight document from database
router.route('/:id').delete((req, res) => {
    Flight.findByIdAndDelete(req.params.id)
        .then((flight) => {
            updateGraph(flight);
            global.graphVersion++;
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

//endpoint for updating flight document in database
router.route('/:id').patch((req, res) => {
    const query = { _id: req.params.id }
    const update = { $set: req.body };
    const options = { new: true };
    Flight.findOneAndUpdate(query, update, options)
        .then((flight) => {
            updateGraph(flight);
            global.graphVersion++;
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;