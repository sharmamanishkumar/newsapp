const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const Dashboard = require("../moduls/dashboards");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toDateString() + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});

router.post('/', upload.single("newsImage"), (req, res, next) => {
    console.log(req.file, 'my file');
    const dashboard = new Dashboard({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        desc: req.body.desc,
        newsImage: req.file.path
    })
    dashboard.save().then((results) => {
        res.status(201).json({
            message: "News Created",
            newsData: {
                title: results.title,
                desc: results.desc,
                newsImage: results.path,
                requested: {
                    type: "Get",
                    url: "http://localhost:5000/dashboard/" + results._id,
                }
            }
        })
    }).catch((err) => {
        res.status(500).json({
            error: err,
            mess: "500"
        });
    })
})

router.get("/", (req, res, next) => {
    Dashboard.find()
        .select("title _id desc newsImage")
        .exec()
        .then((result) => {
            const response = {
                count: result.length,
                message: "All News",
                data: result.map((res) => {
                    console.log(res.newsImage, 'aa');
                    return {
                        _id: res._id,
                        title: res.title,
                        desc: res.desc,
                        newsImage: res.newsImage,
                        requsted: {
                            type: "GET",
                            url: "http://localhost:5000/dashboard/" + res._id,
                        },
                    };
                }),
            };
            res.status(200).json(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
});


module.exports = router