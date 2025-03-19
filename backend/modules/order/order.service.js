const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateOrderSlug = async () => {
  const lastSupplier = await prisma.order.findFirst({
    orderBy: { orderSlug: "desc" },
  });

  let nextNumber = 1;
  if (lastSupplier && lastSupplier.orderSlug) {
    const lastNumber = parseInt(lastSupplier.orderSlug.replace("ORD", ""), 10);
    nextNumber = lastNumber + 1;
  }

  return `ORD${String(nextNumber).padStart(3, "0")}`;
};

// Create a new order
const createOrder = async (data) => {
  const orderSlug = await generateOrderSlug();
  return await prisma.order.create({
    data: { ...data, orderSlug: orderSlug },
  });
};

// Get all orders
const getAllOrders = async () => {
  return await prisma.order.findMany();
};

// Get an order by ID
const getOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
  });
};

// Update an order by ID
const updateOrder = async (id, data) => {
  if (data.status && data.status === "Delivered") {
    await completeOrder(id);
  }
  return await prisma.order.update({
    where: { id },
    data,
  });
};

// Delete an order by ID
const deleteOrder = async (id) => {
  return await prisma.order.delete({
    where: { id },
  });
};

// Complete an order (reduce product quantities)
const completeOrder = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "Delivered") {
    throw new Error("Order is already completed");
  }

  // Reduce product quantities
  const products =
    typeof order.products === "string"
      ? JSON.parse(order.products)
      : order.products;

  for (const item of products) {
    const product = await prisma.product.findUnique({
      where: { id: item.id },
    });

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient quantity for product ${product.name}`);
    }

    await prisma.product.update({
      where: { id: item.id },
      data: { quantity: product.quantity - item.quantity },
    });
  }

  // Update order status to "Completed"
  return await prisma.order.update({
    where: { id },
    data: { status: "Completed" },
  });
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  completeOrder,
};
