const multer = require("multer");

const storeBanner = multer.diskStorage({
    
    destination: function (req, file, callback) {

        callback(null, "uploadBanner");
    },
    filename: function (req, file, callback) {
        
        var ext = file.originalname.substring(file.originalname.lastIndexOf("."));
        callback(null, file.originalname + "-" + Date.now() + ext);
    }
});

const bannerUpload = multer({ storage: storeBanner });

const singleBanner = (req, res, next) => {
    bannerUpload.single("bannerImage")(req, res, function (err) {
        if (err) {
            console.error("Error uploading banner:", err);
            return res.status(500).send("Banner upload failed");
        } else {
            console.log("Banner uploaded successfully");
            console.log("File details:", req.file);
            next();
        }
    });
};

const multiBanner = (req, res, next) => {
    bannerUpload.fields([
        { name: "bannerImage1", maxCount: 1 },
        { name: "bannerImage2", maxCount: 1 },
        { name: "bannerImage3", maxCount: 1 }
    ])(req, res, function (err) {
        if (err) {
            console.error("Error uploading banners:", err);
            return res.status(500).send("Banner upload failed");
        } else {
            console.log("Banners uploaded successfully");
            // console.log("Files details:", req.files);
            next();
        }
    });
};
module.exports = {
    multiBanner,
    singleBanner
};
