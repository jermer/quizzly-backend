"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { createToken } = require("./tokens");

describe("createToken", function () {
    test("works", function () {
        const token = createToken({ username: "testname" });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "testname"
        });
    });
});