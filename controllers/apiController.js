// Importing required modules
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Importing models
const userModel = require("../model/userModel");
const otpModel = require("../model/otpModel");
const ForgotPasswordOtpModel = require("../model/ForgotPasswordOtpModel");
const introModel = require("../model/introModel");
const categoryModel = require("../model/categoryModel");
const cuisinesModel = require("../model/cuisinesModel");
const recipeModel = require("../model/recipeModel");
const favouriteRecipeModel = require("../model/favouriteRecipeModel");
const reviewModel = require("../model/reviewModel");
const faqModel = require("../model/faqModel");
const adsModel = require("../model/adsModel");
const settingModel = require("../model/settingModel");
const notificationModel = require("../model/notificationModel");

// Importing the service function to delete uploaded files
const { deleteImages } = require("../services/deleteImage");

//Routes For Sign Up
const CheckRegisterUser = async (req, res) => {
    try {
        const { email } = req.body;
        const isExistEmail = await userModel.findOne({ email });
        if (isExistEmail) {
            return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(200).json({ message: "Email is not registered" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const SignUp = async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;
        const isExistEmail = await userModel.findOne({ email });
        if (isExistEmail) {
            return res.status(409).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            contact,
        });
        await user.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const VerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await otpModel.findOne({ email, otp });
        if (!user) {
            return res.status(404).json({ message: "Invalid OTP" });
        }
        await userModel.findOneAndUpdate({ email }, { $set: { isOTPVerified: 1 } });
        await otpModel.deleteOne({ email });
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Sign In
const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(404).json({ message: "Invalid credentials" });
        }
        if (user.isOTPVerified === 0) {
            return res.status(401).json({ message: "Please verify your account" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const isVerifyAccount = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isOTPVerified === 1) {
            return res.status(200).json({ message: "Account is verified" });
        }
        return res.status(401).json({ message: "Account is not verified" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Assuming you have a function to send OTP
        // sendOtp(email);
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Forgot Password and Reset Password
const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Assuming you have a function to send OTP
        // sendOtp(email);
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const ForgotPasswordVerification = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await ForgotPasswordOtpModel.findOne({ email, otp });
        if (!user) {
            return res.status(404).json({ message: "Invalid OTP" });
        }
        await ForgotPasswordOtpModel.deleteOne({ email });
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const ResetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.findOneAndUpdate({ email }, { $set: { password: hashedPassword } });
        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For User Edit
const UserEdit = async (req, res) => {
    try {
        const { name, contact } = req.body;
        await userModel.findByIdAndUpdate(req.user.id, { $set: { name, contact } });
        return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const GetUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const UploadImage = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);
        if (user.avatar) {
            deleteImages(user.avatar);
        }
        user.avatar = req.file.filename;
        await user.save();
        return res.status(200).json({ message: "Image uploaded successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const ChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await userModel.findById(req.user.id);
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid old password" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const DeleteAccountUser = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.user.id);
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Routes For Intro
const getAllIntro = async (req, res) => {
    try {
        const intros = await introModel.find();
        return res.status(200).json({ intros });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Category
const GetAllCategory = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        return res.status(200).json({ categories });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Cuisines
const GetAllCuisines = async (req, res) => {
    try {
        const cuisines = await cuisinesModel.find();
        return res.status(200).json({ cuisines });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Recipe
const GetAllRecipe = async (req, res) => {
    try {
        const recipes = await recipeModel.find();
        return res.status(200).json({ recipes });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const popularRecipe = async (req, res) => {
    try {
        const recipes = await recipeModel.find({ isPopular: true });
        return res.status(200).json({ recipes });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const recommendedRecipe = async (req, res) => {
    try {
        const recipes = await recipeModel.find({ isRecommended: true });
        return res.status(200).json({ recipes });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const GetRecipeById = async (req, res) => {
    try {
        const { id } = req.body;
        const recipe = await recipeModel.findById(id);
        return res.status(200).json({ recipe });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const GetRecipeByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const recipes = await recipeModel.find({ category: categoryId });
        return res.status(200).json({ recipes });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const FilterRecipe = async (req, res) => {
    try {
        const { filter } = req.body;
        const recipes = await recipeModel.find(filter);
        return res.status(200).json({ recipes });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const SearchRecipes = async (req, res) => {
    try {
        const { query } = req.body;
        const recipes = await recipeModel.find({ name: { $regex: query, $options: "i" } });
        return res.status(200).json({ recipes });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Favourite
const AddFavouriteRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;
        const favourite = new favouriteRecipeModel({
            user: req.user.id,
            recipe: recipeId,
        });
        await favourite.save();
        return res.status(201).json({ message: "Recipe added to favourites" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const GetAllFavouriteRecipes = async (req, res) => {
    try {
        const favourites = await favouriteRecipeModel.find({ user: req.user.id }).populate("recipe");
        return res.status(200).json({ favourites });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const DeleteFavouriteRecipe = async (req, res) => {
    try {
        const { id } = req.body;
        await favouriteRecipeModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Recipe removed from favourites" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Reviews
const AddReview = async (req, res) => {
    try {
        const { recipeId, rating, comment } = req.body;
        const review = new reviewModel({
            user: req.user.id,
            recipe: recipeId,
            rating,
            comment,
        });
        await review.save();
        return res.status(201).json({ message: "Review added successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const GetReviewByRecipeId = async (req, res) => {
    try {
        const { recipeId } = req.body;
        const reviews = await reviewModel.find({ recipe: recipeId }).populate("user");
        return res.status(200).json({ reviews });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Routes For FAQ
const getAllFaq = async (req, res) => {
    try {
        const faqs = await faqModel.find();
        return res.status(200).json({ faqs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Routes For ads
const getAdmob = async (req, res) => {
    try {
        const ads = await adsModel.find();
        return res.status(200).json({ ads });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For Policy and terms
const GetPolicyAndTerms = async (req, res) => {
    try {
        const settings = await settingModel.find();
        return res.status(200).json({ settings });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//Routes For NotiFiaction
const GetAllNotification = async (req, res) => {
    try {
        const notifications = await notificationModel.find();
        return res.status(200).json({ notifications });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    CheckRegisterUser,
    SignUp,
    VerifyOtp,
    SignIn,
    isVerifyAccount,
    resendOtp,
    ForgotPassword,
    ForgotPasswordVerification,
    ResetPassword,
    UserEdit,
    GetUser,
    UploadImage,
    ChangePassword,
    DeleteAccountUser,
    getAllIntro,
    GetAllCategory,
    GetAllCuisines,
    GetAllRecipe,
    popularRecipe,
    recommendedRecipe,
    GetRecipeById,
    GetRecipeByCategoryId,
    FilterRecipe,
    SearchRecipes,
    AddFavouriteRecipe,
    GetAllFavouriteRecipes,
    DeleteFavouriteRecipe,
    AddReview,
    GetReviewByRecipeId,
    getAllFaq,
    getAdmob,
    GetPolicyAndTerms,
    GetAllNotification,
};