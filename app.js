if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}


const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const router = express.Router();
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const methodOverride = require('method-override')
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const userRouter = require("./routes/user.js");
const flash = require("connect-flash");
const cors = require('cors');
const reviews = require("./routes/review.js")
const app = express();
const listings = require("./routes/listing.js");

 

// Middleware setup

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

  async function main() {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

  const sessionOptions = {
    //store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    }
  };
  app.use(session(sessionOptions));
  app.use(flash());
  
  
  app.use(passport.initialize());
  app.use(passport.session());
  

  app.use(express.urlencoded({extended:true}));
  app.set("view engine","ejs");
  app.use(express.json());
  app.set("views",path.join(__dirname,"views"));
  app.use(methodOverride('_method'));
  app.engine('ejs', ejsMate);
  app.use(express.static(path.join(__dirname,"/public")));
  
  app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
  });
  app.use("/",userRouter);
  app.use("/listings",listings);
  app.use("/listings/:id/reviews",reviews);
  
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.listen(8080, () => {
    console.log('Server is listening on port ');
});

app.get("/", (req, res) => {
    res.send("hi");
});


app.get("/listing", async (req, res) => {
    try {
      const allListings = await Listing.find({});
      res.render("home.ejs", { allListings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching the listings" });
    }
  });
  app.get("/listings/new",(req,res)=>{
    res.render("new.ejs");
  })
  app.get("/listing/findhome",(req,res)=>{
    res.render("findhome.ejs");
  })

  app.get("/listings/:id",async(req,res)=>{
    let  {id}=req.params;
    const allChatt=await Listing.findById(id).populate("reviews");
   res.render("show.ejs",{allChatt});
   
   });

  app.post("/listings",async (req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    console.log("newdata",newListing)
     res.redirect("/listing"); 
    });

    app.get("/listings/:id/edit",async(req,res)=>{
      let  {id}=req.params;
      const all=await Listing.findById(id);
      res.render("editt.ejs",{all});
    })
  
  app.put("/listings/:id",async(req,res)=>{
    let  {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listing");
  
  });
  
  app.delete("/listings/:id",async(req,res)=>{
    let  {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing)
    res.redirect("/listing");
  });
  
  


  app.get('/listings/findbylocation', async (req, res) => {
    const location = req.query.location;

    try {
        // Find listings matching the provided location
        const listings = await Listing.find({ location: location });

        // Render the view with the retrieved listings
        res.render('searchResults', { listings, location });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving listings');
    }
});










    



