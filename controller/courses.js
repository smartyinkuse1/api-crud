const asyncHandler = require("../middleware/async")
const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");

const getCourses = asyncHandler(async(req,res,next)=>{
    if (req.params.bootcampId) {
        const courses = await Course.find({bootCamp: req.params.bootcampId})
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        }) 
    }else {
        res.status(200).json(res.advancedResults)
    }
})

const getCourse = asyncHandler(async(req,res,next)=>{
    const course = await Course.findById(req.params.id).populate({
        path: "bootCamp",
        select: 'name description'
    })
    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        data: course
    })
})

const createCourse = asyncHandler(async(req,res, next)=> {
    req.body.bootCamp = req.params.bootcampId
    req.body.user = req.user.id
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`))
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} is not authorized`, 401))
        
    }
    const course = await Course.create(req.body)
    res.status(200).json({
        success: true,
        data: course
    })
})

const updateCourse = asyncHandler(async(req,res,next)=>{
    let course = await Course.findById(req.params.id)
    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} is not authorized`, 401))
        
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: course
    })
}) 

const deleteCourse = asyncHandler(async(req,res,next)=>{
    let course = await Course.findById(req.params.id)
    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`The user with ID ${req.user.id} is not authorized`, 401))
        
    }
    await course.remove()
    res.status(200).json({
        success: true,
        data: {}
    })
})

module.exports = {getCourses, getCourse, createCourse, updateCourse, deleteCourse}

