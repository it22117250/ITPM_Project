const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Create a new user
const createUser = async (data) => {
  const hashedPassword = await hashPassword(data.password);
  return await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
};

// Get all users
const getAllUsers = async () => {
  return await prisma.user.findMany();
};

// Get a user by ID
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

// Update a user by ID
const updateUser = async (id, data) => {
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  return await prisma.user.update({
    where: { id },
    data,
  });
};

// Delete a user by ID
const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

// Login a user
const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return { user, token };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  return await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
    },
  });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  changePassword,
};
