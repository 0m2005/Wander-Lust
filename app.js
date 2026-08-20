const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

const mongoose = require("mongoose");
const listing = require("./models/listing.js");

const wrapAsync = require("./public/utils/wrapAsync.js");
const expressError = require("./public/utils/expressError.js");

const {listingSchema, reviewSchema} = require("./schema.js");

const Review = require("./models/review.js");

app.use(express.urlencoded({ extended: true }));



const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);



const MONGO_URL = "mongodb://127.0.0.1:27017/WANDERlust";

async function main(){
    await mongoose.connect(MONGO_URL);
}

main()
    .then(()=>{
    console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    })
 
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.listen(8080 , (res,req)=>{
    console.log("working port is 8080");
})

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if(error) {
        throw new expressError(400, error);
    } else{
        next();
    }
}

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if(error) {
        throw new expressError(400, error);
    } else{
        next();
    }
}

app.get("/", (req,res) => {
    res.send("hi , i am root");
})

app.get("/listings",
    wrapAsync(async (req,res,next) =>{
        const allListings=await listing.find({});
        // console.log(allListings);
        res.render("index.ejs", { allListings });
    })
);


//create new
app.get("/listing/new", (req,res) =>{
    res.render("new.ejs");
})


//add new
app.post("/listing" ,validateListing, wrapAsync(async (req,res,next) =>{
    
    let newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

    console.log(listing);
    
}))

//show

app.get("/listing/:id/show",wrapAsync( async (req,res,next) =>{
    let {id} = req.params;

    const list = await listing.findById(id).populate("reviews");

    if (!list) {
        throw new expressError(404, "Listing not found");
    }


    res.render("show.ejs",{list});
}));

// edit

app.get("/listing/:id/edit",wrapAsync(async (req,res,next) =>{
    let {id} = req.params;

    const list = await listing.findById(id);


    res.render("edit.ejs",{list});
}))

//edit put

app.put("/listing/:id",
    validateListing,
    wrapAsync(async (req,res,next) =>{
    let {id} = req.params;

    await listing.findByIdAndUpdate(id, req.body.listing);

    res.redirect(`/listing/${id}/show`);

    
}))
//delete listing
app.delete("/listing/:id/delete", wrapAsync(async (req, res,next) => {
    let {id} = req.params;

    await listing.findByIdAndDelete(id);

    res.redirect("/listings");
}));

// review route

app.post("/listings/:id/reviews", validateReview,wrapAsync(async (req, res) =>{
    let list = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    list.reviews.push(newReview);
    await newReview.save();
    await list.save();

    res.redirect(`/listing/${req.params.id}/show`);
}));

//delete review id

app.delete("/listing/:id/reviews/:reviewId", wrapAsync(async (req, res) =>{
    let {id , reviewId } = req.params;

    await listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listing/${id}/show`);
}));



app.all("*anything", (req, res,next) =>{
    next(new expressError(404, "Page Not Found!"));
})

app.use((err,req,res,next) =>{
    let{statusCode=500, message="something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.render("error.ejs",{message});
})
