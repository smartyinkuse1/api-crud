const Bootcamp = require("../models/Bootcamp")
const path = require("path")
const asyncHandler = require("../middleware/async")
const geocoder = require("../utils/geocoder")
const ErrorResponse = require("../utils/errorResponse")

const getBootcamps = asyncHandler(async (req, res, next) => {
   
    res.status(200).json(res.advancedResults)

})
const getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        res.status(400).json({
            success: false
        })
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    })
})
const createBoocamp = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id
    const publishedBootCamp = await Bootcamp.findOne({user: req.user.id})
    if (publishedBootCamp && req.user.role !=="admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a boocamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
        success: true,
        data: bootcamp
    })
})
const updateBoocamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!bootcamp) {
        return next(new ErrorResponse(`The bootcamp with ID ${req.params.id} is not found`, 400))

    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} is not authorized`, 401))
        
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).send({ success: true, data: bootcamp })

})
const deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return res.status(400).json({ success: false })
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} is not authorized`, 401))
        
    }
    bootcamp.remove()
    res.status(200).send({ success: true, msg: "Deleted" })

})

const getBootcampInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude
    const lng = loc[0].longitude
    //Earth's Radius = 3963miles 6378km
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })
    res.status(200).json({
        success: true,
        data: bootcamps
    })
})
const bootcampFileUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found`, 404))
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} is not authorized`, 401))
        
    }
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400))
    }
    const file = req.files.file
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please select an image', 400))
    }
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem Uploading file`, 500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
        res.status(200).send({ success: true, data: file.name })
    })

})

module.exports = { getBootcamp, getBootcamps, createBoocamp, updateBoocamp, deleteBootcamp, getBootcampInRadius, bootcampFileUpload }