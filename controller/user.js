const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

//@desc  Get All Users
//@route GET /api/v1/user/
//@access Private/Admin

const getUsers = asyncHandler(async(req,res,next)=> {
    res.status(200).json(res.advancedResults)
})

//@desc  Get Single User
//@route GET /api/v1/user/:id
//@access Private/Admin

const getUser = asyncHandler(async(req,res,next)=> {
    const user = await User.findById(req.params.id)
    res.status(200).json({
        success: true,
        data:user
    })
})

//@desc  Create User
//@route POST /api/v1/user/
//@access Private/Admin

const createUser = asyncHandler(async(req,res,next)=> {
    const user = await User.create(req.body)
    res.status(200).json({
        success: true,
        data:user
    })
})

//@desc  Update User
//@route GET /api/v1/user/:id
//@access Private/Admin

const updateUser = asyncHandler(async(req,res,next)=> {
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data:user
    })
})

//@desc  Delete User
//@route DELETE /api/v1/user/:id
//@access Private/Admin

const deleteUser = asyncHandler(async(req,res,next)=> {
    await User.findByIdAndRemove(req.params.id)
    res.status(200).json({
        success: true,
        data: {}
    })
})

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser}