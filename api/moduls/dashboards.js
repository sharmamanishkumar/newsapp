const mongoose = require("mongoose");
const schemaDashboard = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        require: true
    },
    desc: {
        type: String,
        require: true
    },
    newsImage: {
        type: String,
        require : true
    },
});

module.exports = mongoose.model("Dashboard", schemaDashboard)