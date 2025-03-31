const express = require("express");
const router = express.Router();

const { sendSepoliaEth } = require("../controllers/testController");

router.route("/").get(sendSepoliaEth);

module.exports = router;
