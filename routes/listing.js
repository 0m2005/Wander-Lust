const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");

const wrapAsync = require("../public/utils/wrapAsync.js");
const expressError = require("../public/utils/expressError.js"); 
const { isLoggedIn } = require("../middleware.js");

const {listingSchema, reviewSchema} = require("../schema.js");

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
router.post("/listing", isLoggedIn, validateListing, wrapAsync(async (req,res,next) =>{
    
    let newListing = new listing(req.body.listing);
    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect("/listings");

    
}))

//show

router.get("/listing/:id/show",wrapAsync( async (req,res,next) =>{
    let {id} = req.params;

    const list = await listing.findById(id).populate("reviews");

    if (!list) {
        throw new expressError(404, "Listing not found");
    }


    res.render("show.ejs",{list});
}));

// edit

router.get("/listing/:id/edit", isLoggedIn, wrapAsync(async (req,res,next) =>{
    let {id} = req.params;

    const list = await listing.findById(id);

    
    res.render("edit.ejs",{list});
}))

//edit put

router.put("/listing/:id",
    isLoggedIn,
    validateListing,
    wrapAsync(async (req,res,next) =>{
    let {id} = req.params;

    await listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success", "Successfully edited the listing!");

    res.redirect(`/listing/${id}/show`);

    
}))
//delete listing
router.delete("/listing/:id/delete", isLoggedIn, wrapAsync(async (req, res,next) => {
    let {id} = req.params;

    await listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));

module.exports = router;