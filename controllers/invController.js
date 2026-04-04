const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 *  Build vehilce display by inventory view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getVehicleDetailsByInventoryId(inv_id)
  console.log(data)
  const grid = await utilities.buildVehicleCard(data)
  let nav = await utilities.getNav()
  const vehicleMake = data[0].inv_make
  const vehicleModel = data[0].inv_model
  res.render("./inventory/classification", {
    title: vehicleMake + " " + vehicleModel,
    nav,
    grid,
    errors: null,
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Inventory Management - Add Classification",
    nav,
    errors: null,
  })
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const selectClassification = await utilities.buildClassificationDropDown()
  res.render("./inventory/add-inventory", {
    title: "Inventory Management - Add Inventory",
    nav,
    selectClassification,
    errors: null,
  })
}

/* ****************************************
*  Process Adding to Database
* *************************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body

  const regResult = await invModel.addClassification(
    classification_name
  )
  let nav = await utilities.getNav()

  if (regResult) {
    req.flash(
      "notice",
      `Success! You added a new classification.`
    )
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, failed to add a new classification.")
    res.status(501).render("./inventory/add-classification", {
      title: "Inventory Management - Add Classification",
      nav,
    })
  }
}

invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const selectClassification = await utilities.buildClassificationDropDown()
  const { classification_id, inv_make, inv_model, inv_year, inv_miles, inv_color, inv_price, inv_image, inv_thumbnail, inv_description } = req.body

  const regResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_miles,
    inv_color,
    inv_price,
    inv_image,
    inv_thumbnail,
    inv_description
  )

  if (regResult) {
    req.flash(
      "notice",
      `Success! You added a new car to the inventory.`
    )
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      selectClassification,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the new car failed to be added to inventory.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Inventory Management - Add Inventory",
      nav,
      selectClassification,
    })
  }
}

module.exports = invCont