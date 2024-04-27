const JWTtoken = require("jsonwebtoken");
const secret = process.env.jwt_user_secret;


//.......................................................................................

// this function login to homepage...
const userhaveToken = async (req, res, next) => {
    try {
        const usertoken = req.cookies.usertoken;
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed,login not granted..', err.message);
                next()
            } else {
                const userdetail = decoded._id;
                req.userid = userdetail;
                console.log("jwt toke in userhavetoken, login to homepage granted..")
                res.redirect("/home")
                
            }
        });
     }
    catch (error) {
        console.log(error.message)
    }
}

//........................................................................

//if failed take to login page in all case...
const userhaveToken1 = async (req, res, next) => {
    try {
        
        const usertoken = req.cookies.usertoken;
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed, not granted access..', err.message);
    
                res.redirect("/login");
            } else {
                const userdetail = decoded._id;//decoding the user id only
                req.userid = userdetail;
                // console.log("userdetail:::::",userdetail)
                console.log("jwt toke in userhavetoken1,granted the access..");
              console.log("----*-------*---------*------")
              next();
            }
        });
    }
    catch (error) {
        console.log(error.message);
    }
}
//........................................................................

// const userhaveToken2 = async (req, res, next) => {
//     try {

//         console.log("jwt toke outside if in havetoken 2:", req.cookies);
//         const usertoken = req.cookies.token;
//         if (usertoken) {
//             res.redirect("/home")
//             console.log("jwt toke in use havetoken2")
//         } else {
//             next()
//         }
//     }
//     catch (error) {
//         console.log(error.message)
//     }
// }
//....................................................................

//for admin side....
const userhaveToken3 = async (req, res, next) => {
    try {
        console.log("jwt toke outside if")
        console.log("in havetoken 3:", req.cookies);
        const usertoken = req.cookies.token;
        if (usertoken) {
            console.log("jwt toke in use havetoken3")
            next()
        } else {
            res.redirect("/admin/enter")
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

//....................................................
const aboutToken = async (req, res, next) => {
    try {
        const usertoken = req.cookies.usertoken;
        if (usertoken) {
            console.log("jwt toke in use user logged in so about page  {aboutTOKEN}")
            res.redirect("/about")
        } else {
            console.log("no jwt toke in  user logged in so about. page {aboutTOKEN}")
            next()
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

//.................................................................................

////if the user is blocked. then clicking on the about page the user will have to routed to another about page, which is intented to non logged user.

const aboutToken2 = async (req, res, next) => {
    try {
      
        const usertoken = req.cookies.usertoken;
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.log("no jwt toke so about. page {aboutTOKEN2}")
                res.redirect("/about.")
            } else {
                const userdetail = decoded._id;
                req.userid = userdetail;
                console.log("jwt toke in  user logged in so about page   {aboutTOKEN2}")
                next()
                
            }
        });
       
    }
    catch (error) {
        console.log(error.message)
    }
}

//......................................................................



module.exports = {
    userhaveToken,
    userhaveToken1,
    // userhaveToken2,
    userhaveToken3,
    aboutToken,
    aboutToken2

}