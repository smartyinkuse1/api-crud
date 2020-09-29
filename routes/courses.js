const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse }  = require('../controller/courses')
const router = express.Router({mergeParams: true})

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedRequest');
const { protect, authorize } = require('../middleware/auth');


router
    .route('/')
    .get(advancedResults(Course, {path: 'bootCamp', select: 'name description'}), protect, getCourses)
    .post(protect, authorize('publisher', 'admin'),createCourse)
router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'),updateCourse)
    .delete(protect, authorize('publisher', 'admin'),deleteCourse)
module.exports = router;