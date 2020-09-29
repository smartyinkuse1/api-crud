const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require("../utils/geocoder")

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: [true, 'Please add a name'],
        trim: true,
        maxlength:[50, 'name cannot be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: String,
    phone: String,
    email: String,
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            // required: true
          },
          coordinates: {
            type: [Number],
            // required: true,
            index: "2dsphere"
          },
          formattedAddress: String,
          street: String,
          city: String,
          state: String,
          zipcode: String,
          country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: ["Web Development", "Mobile Development","UI/UX", "Data Science","Business", "Other"]
    },
    averageRating :{
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating must be at most 10"],
    },
    averageCost: Number,
    photo: {
        type: String,
        default: "ask.jpg"
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

}, {
    toJSON: {virtuals : true},
    toObject: {virtuals: true}
})
//Create a slug from name
BootcampSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})

//GeoCoder
BootcampSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address)
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
    this.address = undefined
})
//Cascade Delete Courses
BootcampSchema.pre('remove', async function(next){
    await this.model('Course').deleteMany({bootcamp: this._id});
    next();
})

//Reverse Populate
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootCamp',
    justOne: false
})
module.exports = mongoose.model("Bootcamp", BootcampSchema)