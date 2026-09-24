const { ref } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js"); 


const listingSchema = mongoose.Schema({
    title : {
        type : String
    },

    description : {
        type : String
    },
    image: {
    filename: {
        type: String,
        default: "listingimage"
    },
    url: {
        type: String,
        default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    }
},

    price : {
        type : Number
    },

    location : {
        type : String
    },

    country : {
        type : String
    },
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review"
        }
    
    ],
    owner:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});

// to delete the reviews after listing deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing && listing.reviews.length) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;