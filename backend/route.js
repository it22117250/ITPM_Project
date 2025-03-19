const express = require("express");
const router = express.Router();

// Import route files from each module
const supplierRoutes = require("./modules/supplier/supplier.route.js");
const categoryRoutes = require("./modules/category/category.route");
const productRoutes = require("./modules/product/product.route");
const orderRoutes = require("./modules/order/order.route");

// Use the routes
router.use("/suppliers", supplierRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
