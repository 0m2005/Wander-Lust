const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");

const wrapAsync = require("../public/utils/wrapAsync.js");
const expressError = require("../public/utils/expressError.js"); 
const { isLoggedIn, isOwner } = require("../middleware.js");

const {listingSchema, reviewSchema} = require("../schema.js");
const multer  = require('multer');
const { storage, cloudinary } = require('../cloudConfig.js');
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if(error) {
        throw new expressError(400, error);
    } else{
        next();
    }
}

router.get("/listings",
    wrapAsync(async (req,res,next) =>{
        const allListings=await listing.find({});
        // console.log(allListings);
        res.render("index.ejs", { allListings });
    })
);


//create new
router.get("/listing/new", isLoggedIn, (req,res) =>{
    res.render("new.ejs");
})


//add new
router.post("/listing", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async (req,res,next) =>{
    
    let newListing = new listing(req.body.listing);
    if(req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }
    newListing.owner = req.user._id;  // assign owner before saving
    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect("/listings");

    
}))

//show

router.get("/listing/:id/show",wrapAsync( async (req,res,next) =>{
    let {id} = req.params;

    const list = await listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!list) {
        throw new expressError(404, "Listing not found");
    }


    res.render("show.ejs",{list});
}));

// edit

router.get("/listing/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req,res,next) =>{
    let {id} = req.params;

    const list = await listing.findById(id);

    
    res.render("edit.ejs",{list});
}))

//edit put

router.put("/listing/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(async (req,res,next) =>{
    let {id} = req.params;

    let updatedListing = await listing.findByIdAndUpdate(id, req.body.listing);
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        // Delete the previous image from Cloudinary
        if (updatedListing.image && updatedListing.image.filename !== "listingimage") {
            await cloudinary.uploader.destroy(updatedListing.image.filename);
        }

        updatedListing.image = { url, filename };
        await updatedListing.save();
    }
    req.flash("success", "Successfully edited the listing!");

    res.redirect(`/listing/${id}/show`);

    
}))
//delete listing
router.delete("/listing/:id/delete", isLoggedIn, isOwner, wrapAsync(async (req, res,next) => {
    let {id} = req.params;

    let deletedListing = await listing.findByIdAndDelete(id);
    
    if (deletedListing.image && deletedListing.image.filename !== "listingimage") {
        await cloudinary.uploader.destroy(deletedListing.image.filename);
    }
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));

module.exports = router;