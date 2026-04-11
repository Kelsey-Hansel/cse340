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
  const selectClassification = await utilities.buildClassificationDropDown()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    selectClassification,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

// Modify the inventory view
invCont.buildModifyInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const data = await invModel.getVehicleDetailsByInventoryId(inv_id)
  const name = data[0].inv_make + " " + data[0].inv_model
  const selectClassification = await utilities.buildClassificationDropDown()
  res.render("./inventory/edit-inventory", {
    title: "Modify " + name,
    nav,
    selectClassification,
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_year: data[0].inv_year,
    inv_description: data[0].inv_description,
    inv_image: data[0].inv_image,
    inv_thumbnail: data[0].inv_thumbnail,
    inv_price: data[0].inv_price,
    inv_miles: data[0].inv_miles,
    inv_color: data[0].inv_color,
    classification_id: data[0].classification_id,
  })
}

// process the update to inventory
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_year, inv_miles, inv_color, inv_price, inv_image, inv_thumbnail, inv_description, inv_id } = req.body

  const updateResult = await invModel.updateInventory(
    classification_id,
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash(
      "notice",
      `Success! ${itemName} was able to be updated.`
    )
    res.redirect("/inv/")
  } else {
    const selectClassification = await utilities.buildClassificationDropDown(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the edit failed.")
    res.status(501).render("./inventory/edit-inventory", {
      title: "Modify " + itemName,
      nav,
      selectClassification,
      classification_id,
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
  }
}

// Delete an inventory item confirmation view
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const data = await invModel.getVehicleDetailsByInventoryId(inv_id)
  const name = data[0].inv_make + " " + data[0].inv_model
  res.render("./inventory/delete-confirm", {
    title: "Delete " + name,
    nav,
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_year: data[0].inv_year,
    inv_price: data[0].inv_price,
  })
}

// process the delete from inventory
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_id } = req.body
  parseInt(inv_id)

  const deleteResult = await invModel.deleteInventory(
    inv_id,
  )

  if (deleteResult) {
    req.flash(
      "notice",
      `Success! Item was deleted.`
    )
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_id,
    })
  }
}

module.exports = invCont