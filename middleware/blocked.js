
const user = require("../model/userSchema");
const JWTtoken = require('jsonwebtoken');
const jwtcode = process.env.jwt_user_secret

const active = async (req, res, next) => {
    try {
        const usertoken = req.cookies.usertoken;
        // console.log("usertokennnnn::::", usertoken)
        // console.log("code", jwtcode)
        JWTtoken.verify(usertoken, jwtcode, async (error, decoded) => {
            if (error) {
                console.error('Error verifying token:', error.message);
                res.redirect("/logout");
                return;
            } else {
                const userId = decoded._id;
                // console.log('User ID:', userId);
                const userArray = await user.find({ _id: userId });
                console.log("users::", userArray)
                if (userArray.length === 0 || userArray[0].status === false) {
                    console.log("User is blocked or not found. Redirecting to /logout");
                    res.redirect("/logout");
                    return;
                }
                next();
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    active
};
