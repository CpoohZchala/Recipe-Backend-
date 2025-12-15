const express = require("express");
const routes = express.Router();

const { uploadAvatar } = require("../middleware/uploadSingleFile");
const { checkAuthorization } = require("../middleware/checkAuthentication");

// Controllers (REAL files you have)
const loginController     = require("../controllers/loginController");
const introController     = require("../controllers/introController");
const categoryController  = require("../controllers/categoryController");
const cuisinesController  = require("../controllers/cuisinesController");
const recipeController    = require("../controllers/recipeController");
const reviewController    = require("../controllers/reviewController");
const faqController       = require("../controllers/faqController");
const adsController       = require("../controllers/adsController");
const settingController   = require("../controllers/settingController");

// Routes For Sign Up
routes.post("/CheckRegisterUser", loginController.CheckRegisterUser);
routes.post("/Signup", loginController.SignUp);
routes.post("/VerifyOtp", loginController.VerifyOtp);

// Routes For Sign In
routes.post("/SignIn", loginController.SignIn);
routes.post("/isVerifyAccount", loginController.isVerifyAccount);
routes.post("/resendOtp", loginController.resendOtp);

// Forgot/Reset
routes.post("/ForgotPassword", loginController.ForgotPassword);
routes.post("/ForgotPasswordVerification", loginController.ForgotPasswordVerification);
routes.post("/ResetPassword", loginController.ResetPassword);

// User
routes.post("/UserEdit", checkAuthorization, loginController.UserEdit);
routes.post("/GetUser", checkAuthorization, loginController.GetUser);
routes.post("/UploadImage", checkAuthorization, uploadAvatar, loginController.UploadImage);
routes.post("/ChangePassword", checkAuthorization, loginController.ChangePassword);
routes.post("/DeleteAccountUser", checkAuthorization, loginController.DeleteAccountUser);

// Intro
routes.post("/getAllIntro", introController.getAllIntro);

// Category
routes.post("/GetAllCategory", categoryController.GetAllCategory);

// Cuisines
routes.post("/GetAllCuisines", cuisinesController.GetAllCuisines);

// Recipe
routes.post("/GetAllRecipe", recipeController.GetAllRecipe);
routes.post("/popularRecipe", recipeController.popularRecipe);
routes.post("/recommendedRecipe", recipeController.recommendedRecipe);
routes.post("/GetRecipeById", recipeController.GetRecipeById);
routes.post("/GetRecipeByCategoryId", recipeController.GetRecipeByCategoryId);
routes.post("/FilterRecipe", recipeController.FilterRecipe);
routes.post("/SearchRecipes", recipeController.SearchRecipes);

// Favourite (⚠️ These must exist in recipeController OR move to the correct controller file)
routes.post("/AddFavouriteRecipe", checkAuthorization, recipeController.AddFavouriteRecipe);
routes.post("/GetAllFavouriteRecipes", checkAuthorization, recipeController.GetAllFavouriteRecipes);
routes.post("/DeleteFavouriteRecipe", checkAuthorization, recipeController.DeleteFavouriteRecipe);

// Reviews
routes.post("/AddReview", checkAuthorization, reviewController.AddReview);
routes.post("/GetReviewByRecipeId", reviewController.GetReviewByRecipeId);

// FAQ
routes.post("/getAllFaq", faqController.getAllFaq);

// Ads
routes.post("/getAdmob", adsController.getAdmob);

// Policy & Terms + Notifications (usually settingController)
routes.post("/GetPolicyAndTerms", settingController.GetPolicyAndTerms);
routes.post("/GetAllNotification", settingController.GetAllNotification);

module.exports = routes;
