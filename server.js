/**
 * Main Start point for the project to start the server.
 */
import express from 'express';

// Passport JS to serialize/deserialize User object and support Local Strategy for authentication.
import { passport } from './passportHandler.js'

const app = express();

// setup handlebars view engine
import { engine } from 'express-handlebars';

// Set a default layout that can be used by handlebars.
app.engine('handlebars', engine({defaultLayout:'main'}));

app.set('view engine', 'handlebars');

// Directory where views or handlebars is available.
app.set('views','./views');

// static resources
app.use(express.static('./public'));

// to parse request body
app.use(express.urlencoded({extended: false}));

// middleware function to parse incoming requests with JSON payloads.
app.use(express.json());

// Bootstrap Styling.
app.use("/",express.static("./node_modules/bootstrap/dist/"));

import cookieParser from 'cookie-parser';
import  expressSession from 'express-session';

// cookie-parser first
app.use(cookieParser());

//session
app.use(expressSession({
    secret: 'cs602-secret',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Admin Routes
app.post("/admin", passport.authenticate('local',
    { successRedirect: "/allCars",
        failureRedirect: '/admin',
        failureMessage: true }), async function (req, res){
    console.log("/admin Post reached")
})

// Routing
import {router as routes} from
        './routes/index.js';

app.use('/', routes);

// Contact Dealer Routing
import  {contactDealerRouter as contactDealerRoutes} from "./routes/contactDealerRouter.js";
app.use('/', contactDealerRoutes);

// My Requests Routing
import  {myRequestsRouter as myRequestsRoutes} from "./routes/myRequestsRouter.js";
app.use('/', myRequestsRoutes);

// Add Car Routing
import  {addCarRouter as addCarRoutes} from "./routes/addCarRouter.js";
app.use('/', addCarRoutes);

// All Requests Router
import {allRequestsRouter as allRequestsRoutes} from "./routes/allRequestsRouter.js";
app.use('/', allRequestsRoutes);

// Delete Car Requests Router
import  {deleteCarRouter as deleteCarRequests} from "./routes/deleteCarRouter.js";
app.use('/', deleteCarRequests);

// Logout Requests Router
import  {logoutRouter as logoutRoutes} from "./routes/logoutRouter.js";
app.use('/', logoutRoutes);

// Handle 404 in case requested path is not supported.
app.use(function(req, res) {
    res.status(404);
    res.render('404', {
        errorCode: "404",
        message: "Resource not found.",
        layout: false
    });
});

// Listen to inputs at port 3000.
app.listen(3000, function(){
    console.log('http://localhost:3000');
});