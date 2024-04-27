
//CONTAIN ADMIN SIDE AUTHENTICATION......

const haveToken = async (req, res, next) => {
    try {
        console.log("ADMIN , jwt toke outside if")
        // console.log("in havetoken 0:", req.cookies);
        const token = req.cookies.token;
        if (token) {
            console.log("jwt toke in use")
            res.redirect("/admin/dashboard")
        } else {
            next()
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


const haveToken1 = async (req, res, next) => {
    try {
        console.log("havetoken1 of ADMIN jwt toke outside if")
        // console.log("in havetoken 1:", req.cookies);
       
        const token = req.cookies.token;
        if (token) {
            console.log("havetoken1 of ADMIN jwt is working")
            // res.redirect("/admin/banner")
            next()
        } else {
            res.redirect("/admin/enter")
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


// const haveToken2 = async (req, res, next) => {

//     console.log(" ADMIN is using JWT havetoken2 of admin")
//     try {
//         const token = req.cookies.token;
//         if (token) {
//             console.log("jwt toke in use havetoken 2")
//             next()
//         } else {
//             console.log("jwt toke not in use havetoken 2")
//             res.redirect("/admin/enter")
//         }
//     }
//     catch (error) {
//         console.log(error.message)
//     }
// }

// const haveToken3 = async (req, res, next) => {
//     try {
//         console.log("ADMIN jwt toke outside if")
//         console.log("in havetoken 3:", req.cookies);
//         const token = req.cookies.token;
//         if (token) {

//             console.log("jwt toke in use havetoken3")
//             // res.redirect("/admin/category")
//             next()

//         } else {
//             res.redirect("/admin/enter")

//         }

//     }
//     catch (error) {
//         console.log(error.message)
//     }
// }


module.exports = {
    haveToken,
    haveToken1,
    // haveToken2,
    // haveToken3,

}