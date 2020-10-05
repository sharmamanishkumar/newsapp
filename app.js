const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./api/routers/users");
const dashboardRouter = require("./api/routers/dashboard")
const app = express();

mongoose.connect(
    process.env.MOGNO_CLUSTER_APP ||
    "mongodb+srv://manish:" +
    process.env.MONGO_ATLAS_PW +
    "@cluster0.lvk1u.mongodb.net/" + process.env.DB + "?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}
);
mongoose.Promise = global.Promise;
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Header",
        "Origin,X-Requested-With,Content-Type,Accept,Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT,POST,DELETE,PATCH,GET");
        return res.status(200).json({});
    }
    next();
});

app.use("/news", userRoutes)
app.use("/dashboards", dashboardRouter)
app.use('/', (req, res) => {
    res.send('Welcome sir ')
})
app.use((req, res, next) => {
    const error = new Error("i am not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

module.exports = app;