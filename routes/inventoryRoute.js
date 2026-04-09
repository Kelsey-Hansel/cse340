const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const regValidate = require('../utilities/inventory-validation')
const invController = require("../controllers/invController")

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId))

router.get("/", utilities.handleErrors(invController.buildManagement))

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// route to the view for modifying the inventory
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildModifyInventoryView))

// Process the classification data
router.post(
  "/add-classification",
  regValidate.ClassificationRules(),
  regValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

// Process the inventory data
router.post(
  "/add-inventory",
  regValidate.InventoryRules(),
  regValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
)

router.post(
  "/update/",
  regValidate.InventoryRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router