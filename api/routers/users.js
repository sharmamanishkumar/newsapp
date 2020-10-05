const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const News = require("../moduls/user");
const router = express.Router();

router.post("/singup", (req, res, next) => {
  News.find({
    email: req.body.email,
  })
    .exec()
    .then((news) => {
      if (news.length >= 1) {
        return res.status(409).json({
          message: "User already exist",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const news = new News({
              _id: mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              fullName: req.body.fullName,
              date: req.body.date,
            });
            news
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "User Register",
                  data: {
                    _id: result._id,
                    email: result.email,
                    fullname: result.fullName,
                    date: result.date,
                  },
                });
                console.log(result);
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

router.get("/", (req, res, next) => {
  News.find()
    .select()
    .exec()
    .then((result) => {
      // console.log(result,'oiuytre');
      const response = {
        count: result.length,
        message: "All Users",
        users: result.map((res) => {
          console.log(res, "098765456789");
          return {
            _id: res._id,
            email: res.email,
            fullname: res.fullName,
            date: res.date,
            requsted: {
              type: "GET",
              url: "http://localhost:5000/user/" + res._id,
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

router.delete("/:userId", (req, res, next) => {
  News.remove({
    _id: req.params.userId,
  })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "User deleted",
        requested: {
          type: "GET",
          url: "http://localhost:5000/user",
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/:userId", (req, res, next) => {
  const id = req.params.userId;
  News.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        email: req.body.email,
        fullname: req.body.fullName,
        date: req.body.date,
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

router.post("/login", (req, res, next) => {
  News.find({
    email: req.body.email,
  })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token,
          });
        }
        res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;
