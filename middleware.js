const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listing/${id}/show`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listing/${id}/show`);
    }
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listing/${id}/show`);
    }
    next();
};
