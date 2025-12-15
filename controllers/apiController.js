
module.exports = {
  // Auth / Login
  ...require("./loginController"),

  // Intro
  ...require("./introController"),

  // Category
  ...require("./categoryController"),

  // Cuisines
  ...require("./cuisinesController"),

  // Recipe
  ...require("./recipeController"),

  // Review
  ...require("./reviewController"),

  // FAQ
  ...require("./faqController"),

  // Settings / Policy / Terms / Admob / Notifications etc.
  ...require("./settingController"),

  // Mail / OTP (if your loginController doesn't include these)
  ...require("./mailController"),

  // Ads (if separated)
  ...require("./adsController"),
};
