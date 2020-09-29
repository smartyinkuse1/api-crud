const express = require('express')
const {getBootcamp, getBootcamps, createBoocamp, updateBoocamp, deleteBootcamp, getBootcampInRadius, bootcampFileUpload} = require("../controller/bootcamp")
const couseRouter = require('./courses')

const advancedResults = require('../middleware/advancedRequest')
const Bootcamp = require('../models/Bootcamp');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router()
router.use('/:bootcampId/courses', couseRouter )

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBoocamp)

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'),updateBoocamp)
    .delete(protect, authorize('publisher', 'admin'),deleteBootcamp)
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius)
router
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'),bootcampFileUpload)

module.exports = router;