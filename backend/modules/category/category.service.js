const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new category
const createCategory = async (data) => {
  return await prisma.category.create({
    data,
  });
};

// Get all categories
const getAllCategories = async () => {
  return await prisma.category.findMany();
};

// Get a category by ID
const getCategoryById = async (id) => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

// Update a category by ID
const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};

// Delete a category by ID
const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id },
  });
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
