const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

const register = asyncHandler(async(req,res,next)=>{
    const { name, email, password, role} = req.body
    const user = await User.create({
        name,
        email,
        password,
        role
    })
    sendTokenResponse(user, 200,res)
})

const login = asyncHandler(async(req,res,next)=>{
    const {email, password} = req.body
    if (!email || !password) {
        return next(new ErrorResponse('Please provide email and Password', 400))
    }
    const user = await User.findOne({email}).select('+password')
    if (!user) {
        return next( new ErrorResponse('Invalid credentials', 400))
    }
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 400))
    }
    sendTokenResponse(user, 200,res)
})

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.JWT_COOKIE_EXPIRE * 24 * 60 * 60 *1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}
//@desc  Get Current Logged in User
//@route POST /api/v1/auth/user
//@access Private

const loggedInUser = asyncHandler(async(req,res,next)=> {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        data: user
    })
})

//@desc  Forgot Password
//@route POST /api/v1/auth/forgotpassword
//@access Public

const forgotPassword = asyncHandler(async(req,res,next)=> {
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        return next( new ErrorResponse('No User with that email', 404))
    }
    const resetToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave: false})
    //Send Email Utility of your Choice
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`
    res.status(200).json({
        success: true,
        data: resetUrl
    })
})
//@desc  Reset Password
//@route PUT /api/v1/auth/resetPassword/:resettoken
//@access Public
const resetPassword = asyncHandler(async(req,res,next)=> {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex') 
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()} 
    })
    if (!user) {
        return next( new ErrorResponse('Invalid Token', 400))
        
    }
    user.password = req.body.password
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save()
    sendTokenResponse(user, 200,res)
})

//@desc  Update Current Logged in UserDetails
//@route PUT /api/v1/auth/update
//@access Private

const updateDetails = asyncHandler(async(req,res,next)=> {
    const fields = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fields, {
        new:true,
        runValidators: true
    })
    
    res.status(200).json({
        success: true,
        data: user
    })
})

//@desc  Update Current Logged in Password
//@route PUT /api/v1/auth/password
//@access Private

const updatePassword = asyncHandler(async(req,res,next)=> {
    // const fields = {
    //     name: req.body.name,
    //     email: req.body.email
    // }
    let user = await User.findById(req.user.id).select('+password');
    if ((await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 400))   
    }
    user.password = req.body.newPassword
    await user.save()
    sendTokenResponse(user, 200, res)
})

//@desc  Log User out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private

const logout = asyncHandler(async(req,res,next)=> {
    req.cookie('token', 'none', {
        expires: new Date(Date.now()+ 10 * 1000),
        httpOnly: true  
    })
    res.status(200).json({
        success: true,
        data: user
    })
})

module.exports = { register, login, loggedInUser, forgotPassword, resetPassword, updateDetails, updatePassword, logout}