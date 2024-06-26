const Listing = require("./models/listing");

module.exports.isLoggedIn = (req,res,next) => {
    console.log("done",req.user);
    if(!req.isAuthenticated()){
        req.flash("error", "you must be loggedin ");
        return res.redirect("/login");
    }
    next();
}

module.exports.isOwner = async (req,res,next) =>{
    let  {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error","you are not the owner of this listing");
      return res.redirect(`/listings/${id}`); 
    }
    next();
}
