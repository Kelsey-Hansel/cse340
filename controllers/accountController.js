const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
  require("dotenv").config()
const accountModel = require("../models/account-model")
const { cookie } = require("express-validator")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: res.locals.accountData.account_firstname,
  })
}

async function checkAccess(req, res, next) {
  let nav = await utilities.getNav()
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "Please log in.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
    return
  }
  try {
    if (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin") {
      next()
    } else {
      req.flash("notice", "You do not have access.")
      return res.redirect("/")
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver update account view
* *************************************** */
async function buildUpdateView(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const accountDetails = await accountModel.getAccountById(account_id)
  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountDetails.account_firstname,
    account_lastname: accountDetails.account_lastname,
    account_email: accountDetails.account_email,
    account_id
  })
}

async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const regResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (regResult) {
    req.flash(
      "notice",
      `Account information change was successful.`
    )
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      account_firstname: req.body.account_firstname,
    })
  } else {
    req.flash("notice", "Sorry, the account information change failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
    })
  }
}

async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update to the password.')
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.updatePassword(
    hashedPassword,
    account_id,
  )

  if (regResult) {
    req.flash(
      "notice",
      `Password change was successful.`
    )
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      account_firstname: res.locals.accountData.account_firstname,
    })
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
    })
  }
}

async function buildLogout(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/logout", {
    title: "Logout",
    nav,
    errors: null,
  })
}

async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("message notice", "Successful logout.")
  return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, checkAccess, buildUpdateView, updateAccount, updatePassword, buildLogout, accountLogout }