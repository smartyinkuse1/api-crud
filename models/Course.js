const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    bootCamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: Number,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
//Static method
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    console.log('calculating avg cost.....');
    const obj = await this.aggregate([
        {
            $match: { bootCamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootCamp',
                averageCost: {$avg: '$tuition'}
            }
        }
    ]);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost/10)*10
        })
    } catch (error) {
        console.error(error);
    }
}


CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootCamp)
})
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootCamp)
})
module.exports = mongoose.model('Course', CourseSchema)