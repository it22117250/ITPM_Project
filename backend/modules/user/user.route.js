const express = require("express");
const router = express.Router();
const userController = require("./user.controller");

// User routes
router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/login", userController.loginUser);
router.put("/:id/change-password", userController.changePassword);

module.exports = router;
