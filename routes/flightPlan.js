const router = require('express').Router();

let FlightPlan = require('../models/flightPlan.model');

/**
 * @swagger
 * components:
 *    schemas:
 *      FlightPlan:
 *          type: object
 *          required: 
 *              - origin
 *              - destination
 *              - plan
 *              - version
 *          properties:
 *              id:
 *                  type: string
 *                  description: The auto generated id
 *              origin:
 *                  type: string
 *                  description: The origin of flight
 *              destination:
 *                  type: string
 *                  description: The destination of flight
 *              plan:
 *                  type: array
 *                  description: The flight plan for given flight
 *                  items:
 *                      oneOf:
 *                          - $ref: '#/components/schemas/Flight'
 *              version:
 *                  type: number
 *                  description: The version of flight plan
 *          example:
 *              origin: Islamabad
 *              destination: Lahore
 *              plan:
 *                  - origin: Islamabad
 *                    destination: Jhelum
 *                    cost: 1000
 *                  - origin: Jhelum
 *                    destination: Lahore
 *                    cost: 3000
 *              version: 0
 */

/**
 * @swagger
 * tags:
 *  name: Flight Plan
 *  description: The flight plan managing API
 */

/**
 * @swagger
 * /flightplan:
 *  get:
 *      summary: Returns the list of flight plans
 *      tags: [Flight Plan]
 *      responses:
 *          200:
 *              description: The list of flight plans
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/FlightPlan'
 */

//endpoint for getting flight plans from database
router.route('/').get((req, res) => {
    FlightPlan.find()
        .then((flightPlan) => res.json(flightPlan))
        .catch(err => res.status(400).json('Error ' + err))
})

/**
 * @swagger
 * /flightplan/create:
 *  post:
 *      summary: Create new flight plan
 *      tags: [Flight Plan]
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/FlightPlan'
 *      responses:
 *          200:
 *              description: The flight plan was created successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/FlightPlan'
 *          500:
 *              description: Some server error
 */

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

/**
 * @swagger
 * /flightplan/{id}:
 *  delete:
 *      summary: Remove the flight plan by id
 *      tags: [Flight Plan]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The flight plan id
 *      responses:
 *          200:
 *              description: The flight plan was deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/FlightPlan'
 *          404:
 *              description: The flight plan was not found
 */

//endpoint for removing flight plan document from database
router.route('/:id').delete((req, res) => {
    FlightPlan.findByIdAndDelete(req.params.id)
        .then((flight) => {
            res.json(flight)
        })
        .catch(err => res.status(400).json('Error ' + err))
});

/**
 * @swagger
 * /flightplan/{id}:
 *  patch:
 *      summary: Update the flight plan by id
 *      tags: [Flight Plan]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The flight plan id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/FlightPlan'
 *      responses:
 *          200:
 *              description: The flight plan was updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/FlightPlan'
 *          404:
 *              description: The flight plan was not found
 *          500:
 *              description: Some server error
 */

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