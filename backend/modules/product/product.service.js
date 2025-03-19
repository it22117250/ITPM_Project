const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateProductSlug = async () => {
  const lastSupplier = await prisma.product.findFirst({
    orderBy: { productSlug: "desc" },
  });

  let nextNumber = 1;
  if (lastSupplier && lastSupplier.productSlug) {
    const lastNumber = parseInt(
      lastSupplier.productSlug.replace("PROD", ""),
      10
    );
    nextNumber = lastNumber + 1;
  }

  return `PROD${String(nextNumber).padStart(3, "0")}`;
};

// Create a new product
const createProduct = async (data) => {
  const productSlug = await generateProductSlug();
  return await prisma.product.create({
    data: {
      ...data,
      productSlug,
    },
  });
};

// Get all products
const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      category: true,
      supplier: true,
    },
  });
};

// Get a product by ID
const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
    },
  });
};

// Update a product by ID
const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

// Delete a product by ID
const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id },
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
