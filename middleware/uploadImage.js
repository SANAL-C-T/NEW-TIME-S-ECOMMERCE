

//this is the multer configeration part.
const multer = require("multer")
const storage = multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null, "upload") //this is the destiontion to which pic is stored
    },
    filename: function (req, file, cb) {//remnaming function

        var ext = file.originalname.substring(file.originalname.lastIndexOf("."))

        cb(null, file.originalname + "-" + Date.now() + ext)
    },
})

const upload = multer({//creating an instence of this configeration
    storage: storage,
})

//above is the configeration only.


//converting to middleware
const singleUpload = (req, res, next) => {
    upload.single("productImage")(req, res, function (err) {
        if (err) {
            console.log("image not uploaded")
        } {
            console.log("image upload success")
        }
        next();
    })
};



const multiUpload = (req, res, next) => {
    // console.log("hello  data is comming to multer")
    // Assuming data is the array structure you provided
    const data = req.body;
    // console.log("incoming imagedata", data.size)
    for (let index = 0; index < data.length; index++) {
        const item = data[index];

        if (Array.isArray(item)) {
            console.log(`Field ${index}:`);
            console.log(`   ${item[0]}: ${item[1]}`);
        } else if (item instanceof File) {
            console.log(`File ${index}:`);
            console.log(`   Name: ${item.name}`);
            console.log(`   Size: ${item.size} bytes`);

        } else {
            console.log(`Unknown type ${index}: ${item}`);
        }
    }
    //this is the uploading function
    upload.array("productImages[]", 5)(req, res, function (err) {
        if (err) {
            console.log(err.message, "image not uploaded")
        } else {
            console.log("image upload success")
        }
        next();
    })

};



const profileimageupload = (req, res, next) => {
    upload.single("profilepic")(req, res, function (err) {
        if (err) {
            console.log("Image not uploaded");
        } else {
            console.log(":::::Image upload success from multer:::::");
            if (req.file) {
                console.log("File details:", req.file);
            } else {
                console.log("-------No file received to multer----------");
            }
        }
        next();
    });
};



module.exports = {
    singleUpload,
    multiUpload,
    profileimageupload
}