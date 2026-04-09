const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* **************************************
* Classifiaction Data Validation Rules
****************************************/
validate.ClassificationRules = () => {
    return [
      // classification_name is required and must not have spaces or special characters
      body("classification_name")
        .trim()
        .isLength({ min: 1 })
        .isAlpha()
        .withMessage("Please provide a classification name that meets the requirements.")
    ]
}
  
/*  **********************************
*  Inventory Data Validation Rules
* ********************************* */
validate.InventoryRules = () => {
    return [
        // classification is required
        body("classification_id")
            .trim()
            .isInt({ no_symbols: true })
            .withMessage("Please choose a classification."),
        
        // make is required and must be string
        body("inv_make")
            .trim()
            .escape()
            .isLength({ min: 3 })
            .withMessage("Please provide a make."),

        // model is required and must be string
        body("inv_model")
            .trim()
            .escape()
            .isLength({ min: 3 })
            .withMessage("Please provide a model."),

        // valid year is required
        body("inv_year")
            .trim()
            .isInt({ min: 1900, max: 2999 })
            .withMessage("A valid year is required."),
    
        // miles is required and must be a integer
        body("inv_miles")
            .trim()
            .isInt({ no_symbols: true })
            .withMessage("Please provide the correct miles."),

        // color is required
        body("inv_color")
            .trim()
            .escape()
            .isLength({ min: 1 })
            .withMessage("Please provide a color."),
        
        // price is required and must be a decimal or integer
        body("inv_price")
            .trim()
            .isDecimal()
            .withMessage("A vaild price is required."),
        
        // image is required
        body("inv_image")
            .trim()
            .isLength({ min: 6 })
            .matches(/\.(jpg|jpeg|png|webp)$/)
            .withMessage("Please provide the pathway for the image."),
        
        // thumbnail is required
        body("inv_thumbnail")
            .trim()
            .isLength({ min: 6 })
            .matches(/\.(jpg|jpeg|png|webp)$/)
            .withMessage("Please provide the pathway for the thumbnail."),
        
        // description is required
        body("inv_description")
            .trim()
            .escape()
            .isLength({ min: 5 })
            .withMessage("Please provide a description."),
    ]
}

/* ******************************
* Check data and return errors or continue to adding classification
* ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Inventory Management - Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}
  

/* ******************************
* Check data and return errors or continue to adding inventory
* ***************************** */
validate.checkInvData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_year, inv_miles, inv_color, inv_price, inv_image, inv_thumbnail, inv_description } = req.body
    const selectClassification = await utilities.buildClassificationDropDown()
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-inventory", {
        errors,
        title: "Inventory Management - Add Inventory",
            nav,
            selectClassification,
            inv_make,
            inv_model,
            inv_year,
            inv_miles,
            inv_color,
            inv_price,
            inv_image,
            inv_thumbnail,
            inv_description,
        })
        return
    }
    next()
}

/* ******************************
* Check data and return errors or continue to updating inventory
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_year, inv_miles, inv_color, inv_price, inv_image, inv_thumbnail, inv_description, inv_id } = req.body
    const selectClassification = await utilities.buildClassificationDropDown()
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/edit-inventory", {
            errors,
            title: "Modify " + inv_make + " " + inv_model,
            nav,
            selectClassification,
            inv_make,
            inv_model,
            inv_year,
            inv_miles,
            inv_color,
            inv_price,
            inv_image,
            inv_thumbnail,
            inv_description,
            inv_id,
        })
        return
    }
    next()
}

module.exports = validate