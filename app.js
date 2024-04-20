if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}


const express = require("express");
const app = express();
process.on('uncaughtException', function (err) {
  console.log(err);
});
const path = require("path");
const mongoose = require('mongoose');
const router = express.Router();
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const methodOverride = require('method-override')
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const userRouter = require("./routes/user.js");
const flash = require("connect-flash");
const cors = require('cors');

const listings = require("./routes/listing.js");

const Booking = require('./models/booking');

// Middleware setup

const bodyParser = require("body-parser");
const { isOwner } = require('./middleware.js');

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
  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
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
  app.get("/listings/findhome",(req,res)=>{
    res.render("findhome.ejs");
  })

  app.get("/listings/:id",async(req,res)=>{
    let  {id}=req.params;
    const allChatt=await Listing.findById(id).populate("owner");
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
  
  

  
app.post('listings/search-listings', async (req, res) => {
  const { location } = req.body;
  
  
  try {
    
      const listings = await Listing.find({ location: location }).populate("owner");
      
      res.render("searchResults.ejs", { listings: listings });
      
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/book', async (req, res) => {
  const { listingId } = req.body;

  try {
    // Verify the listing and populate the 'owner' field
    const listing = await Listing.findById(listingId).populate('owner');

    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    // Extract owner details from the populated 'owner' field
    const owner = listing.owner;
    console.log("ss",owner)

    // Create a new booking
    const booking = new Booking({
      listingId: listing._id,
      userId: req.user._id,
      ownerId: owner._id 
    });

    await booking.save();

    const ownerBookings = await Booking.find({ ownerId: owner._id }).populate('listingId');

    //res.json(ownerBookings)
    res.render("ownerBookings", { owner, ownerBookings });

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});






app.get('/bookingslist', async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("h",userId)

    const userBookings = await Booking.find({ ownerId: userId }).populate('listingId');

    //res.json(userBookings);
    res.render('results', { userBookings: userBookings });

  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});








    



