const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const Dashboard = require("../moduls/dashboards");
const checkAuth = require("../middleware/check-Auther");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
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

router.post("/", checkAuth, upload.single("newsImage"), (req, res, next) => {
  const dashboard = new Dashboard({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    desc: req.body.desc,
    newsImage: req.file.path,
  });
  dashboard
    .save()
    .then((results) => {
      res.status(201).json({
        message: "News Created",
        newsData: {
          title: results.title,
          desc: results.desc,
          newsImage: results.path,
          requested: {
            type: "Get",
            url: "http://localhost:5000/dashboard/" + results._id,
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        mess: "500",
      });
    });
});

router.get("/", checkAuth, (req, res, next) => {
  Dashboard.find()
    .select("title _id desc newsImage")
    .exec()
    .then((result) => {
      const response = {
        count: result.length,
        message: "All News",
        data: result.map((res) => {
          console.log(res.newsImage, "aa");
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

router.delete("/:dashboardId", checkAuth, (req, res, next) => {
  Dashboard.remove({
    _id: req.params.dashboardId,
  })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "item deleted",
        requested: {
          type: "GET",
          url: "http://localhost:5000/dashboards",
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/:dashboardId", upload.single("newsImage"), (req, res, next) => {
  const id = req.params.dashboardId;
  console.log(id, "patch");
  Dashboard.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        title: req.body.title,
        desc: req.body.desc,
        newsImage: req.file.path,
      },
    }
  )
    .exec()
    .then((results) => {
      console.log(results);
      res.status(200).json(results);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;
