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

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const sessionoptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

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

app.get("/", (req,res) => {
    res.send("hi , i am root");
})

app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

const listingRoutes = require("./routes/listing.js");
app.use("/",listingRoutes);


const reviewRoutes = require("./routes/review.js");
app.use("/listings/:id/reviews",reviewRoutes);

const userRouter = require("./routes/user.js");
app.use("/", userRouter);




app.all("*anything", (req, res,next) =>{
    next(new expressError(404, "Page Not Found!"));
})

app.use((err,req,res,next) =>{
    let{statusCode=500, message="something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.render("error.ejs",{message});
})
