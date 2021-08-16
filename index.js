const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const flightsRouter = require('./routes/flights');
const citiesRouter = require('./routes/cities');
const flightPlanRouter = require('./routes/flightPlan');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

require('dotenv').config();

//creating express application
const app = express();

//setting port to 5000
const port = process.env.PORT || 5000

//swagger options 
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Flight Planner API",
            version: "1.0.0",
            description: "Express application for flight planner",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
        ],
    },
    apis: ["./routes/*.js"]
}

const specs = swaggerJsDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));


//using cors middleware for cross origin requests
app.use(cors());

//using middleware for parsing json
app.use(express.json());

//connecting to mongo db
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
})

//routers used for different models
app.use('/flights', flightsRouter);
app.use('/cities', citiesRouter);
app.use('/flightplan', flightPlanRouter);

//listening on given port
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});