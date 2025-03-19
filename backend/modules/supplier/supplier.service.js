const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateSupplierSlug = async () => {
  const lastSupplier = await prisma.supplier.findFirst({
    orderBy: { supplierSlug: "desc" },
  });

  let nextNumber = 1;
  if (lastSupplier && lastSupplier.supplierSlug) {
    const lastNumber = parseInt(
      lastSupplier.supplierSlug.replace("SUP", ""),
      10
    );
    nextNumber = lastNumber + 1;
  }

  return `SUP${String(nextNumber).padStart(3, "0")}`;
};

// Create a new supplier
const createSupplier = async (data) => {
  const supplierSlug = await generateSupplierSlug();
  return await prisma.supplier.create({
    data: {
      ...data,
      supplierSlug,
    },
  });
};

// Get all suppliers
const getAllSuppliers = async () => {
  return await prisma.supplier.findMany();
};

// Get a supplier by ID
const getSupplierById = async (id) => {
  return await prisma.supplier.findUnique({
    where: { id },
  });
};

// Update a supplier by ID
const updateSupplier = async (id, data) => {
  return await prisma.supplier.update({
    where: { id },
    data,
  });
};

// Delete a supplier by ID
const deleteSupplier = async (id) => {
  return await prisma.supplier.delete({
    where: { id },
  });
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
