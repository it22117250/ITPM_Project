const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");

// Order routes
router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id", orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);
router.patch("/:id/complete", orderController.completeOrder); // Complete an order

module.exports = router;
