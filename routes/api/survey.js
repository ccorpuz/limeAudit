var express = require("express");
var router = express.Router();

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "auditdb"
});

// @route   GET api/survey/test
// @desc    Tests survey route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Survey route works!" }));

// @route   GET api/survey/
// @desc    Get the list of surveys
// @access  Public (For now)
router.get("/", (req, res) => {
  connection.query("SELECT sid FROM lime_surveys", (error, results, fields) => {
    if (error) throw error;
    res.json(results);
  });
});

// @route   GET api/survey/test
// @desc    Get questions for a survey
// @access  Public (For now)

// @route   GET api/survey/save
// @desc    Save results
// @access  Public (For now)

module.exports = router;
