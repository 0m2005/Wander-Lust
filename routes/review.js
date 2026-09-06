const express = require("express");
const router = express.Router({mergeParams: true});
const listing = require("../models/listing.js");

const wrapAsync = require("../public/utils/wrapAsync.js");
const expressError = require("../public/utils/expressError.js"); 

const {listingSchema, reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if(error) {
        throw new expressError(400, error);
    } else{
        next();
    }
}

// review route

router.post("/", validateReview,wrapAsync(async (req, res) =>{
    let list = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    list.reviews.push(newReview);
    await newReview.save();
    await list.save();

    res.redirect(`/listing/${req.params.id}/show`);
}));

//delete review id

router.delete("/:reviewId", wrapAsync(async (req, res) =>{
    let {id , reviewId } = req.params;

    await listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listing/${id}/show`);
}));

module.exports = router;