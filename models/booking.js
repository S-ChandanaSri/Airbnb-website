
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

main()
  .then(()=>{
    console.log("connected")
  })
  .catch((err)=>{
    console.log(err);
  });
  async function main(){
    await mongoose.connect(MONGO_URL)
  }

const bookingSchema = new Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
   
  },
  
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
