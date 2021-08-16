const router = require('express').Router();

let City = require('../models/cities.model');

/**
 * @swagger
 * components:
 *    schemas:
 *      City:
 *          type: object
 *          required: 
 *              - name
 *          properties:
 *              id:
 *                  type: string
 *                  description: The auto generated id
 *              name:
 *                  type: string
 *                  description: The city name
 *          example:
 *              name: Gujranwala
 */

/**
 * @swagger
 * tags:
 *  name: Cities
 *  description: The cities managing API
 */

/**
 * @swagger
 * /cities:
 *  get:
 *      summary: Returns the list of cities
 *      tags: [Cities]
 *      responses:
 *          200:
 *              description: The list of cities
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/City'
 */


//endpoint for getting all cities from database
router.route('/').get((req, res) => {
    City.find()
        .then(cities => res.json(cities))
        .catch(err => res.status(400).json('Error ' + err))
})


/**
 * @swagger
 * /cities/create:
 *  post:
 *      summary: Create new city
 *      tags: [Cities]
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/City'
 *      responses:
 *          200:
 *              description: The city was created successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/City'
 *          500:
 *              description: Some server error
 */

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

/**
 * @swagger
 * /cities/{id}:
 *  delete:
 *      summary: Remove the city by id
 *      tags: [Cities]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The city id
 *      responses:
 *          200:
 *              description: The city was deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/City'
 *          404:
 *              description: The city was not found
 */

//endpoint for removing city document from database
router.route('/:id').delete((req, res) => {
    City.findByIdAndDelete(req.params.id)
        .then((city) => res.json(city))
        .catch(err => res.status(400).json('Error ' + err))
});

/**
 * @swagger
 * /cities/{id}:
 *  patch:
 *      summary: Update the city by id
 *      tags: [Cities]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The city id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/City'
 *      responses:
 *          200:
 *              description: The city was updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/City'
 *          404:
 *              description: The city was not found
 *          500:
 *              description: Some server error
 */


//endpoint for updating city document in database
router.route('/:id').patch((req, res) => {
    const updateObject = req.body;
    const id = req.params.id
    City.updateOne({ _id: Object(id) }, { $set: updateObject })
        .then((city) => res.json(city))
        .catch(err => res.status(400).json('Error ' + err))
});

module.exports = router;