
/** Routes for authentication */

const User = require("../models/user");
const express = require("express");
const router = new express.Router();

/** POST /auth/token */

router.post("/token", async function (req, res, next) {
    try {
        return null;

    } catch (err) {
        return next(err);
    }
});


/** POST /auth/register */

router.post("/register", async function (req, res, next) {
    try {
        return null;

    } catch (err) {
        return next(err);
    }
});


module.exports = router;