import UserModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const createUserService = async (userData) => {
  try {
    const { password, ...userDetails } = userData;

    // Validate user data
    if (!userDetails.mobileNumber || !userDetails.email || !password || !userDetails.role) {
      throw new Error('Missing required fields');
    }

    // Check if the mobile number or email is already taken
    const existingUser = await UserModel.findOne({
      $or: [{ mobileNumber: userDetails.mobileNumber }, { email: userDetails.email }],
    });
    if (existingUser) {
      throw new Error('Mobile number or email is already taken');
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user in one step using create
    const user = new UserModel({
      ...userDetails,
      password: hashedPassword,
    });
    await user.save();
    return { success: true, message: 'User created successfully' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
};


const loginService = async (loginData) => {
  try {
    const { mobileNumber, password } = loginData;

    // Validate login data
    if (!mobileNumber || !password) {
      throw new Error('Username and password are required');
    }

    // Find the user by username
    const user = await UserModel.findOne({ mobileNumber });

    // Check if the user exists
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }


    // Generate a JWT token
    const token = jwt.sign({ userId: mobileNumber, }, process.env.JWT_SEC_KEY, {
      expiresIn: '1h',
    });
    return { success: true, message: 'Login successful', token };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
};


const getUsersService = async () => {
  try {
    // Fetch all users from the database
    const users = await UserModel.find({}, { password: 0 }); // Exclude password field

    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Internal Server Error' };
  }
};

const updateUserService = async (mobileNumber, updateData) => {
  try {
        delete updateData.password;
      // Update user in the database based on mobileNumber
      const updatedUser = await UserModel.findOneAndUpdate(
          { mobileNumber: mobileNumber },
          updateData,
          { new: true,projection: { password: 0 }}
      );

      if (!updatedUser) {
          throw new Error('User not found');
      }

      return { success: true, updatedUser };
  } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message || 'Internal Server Error' };
  }
};



const deleteUserService = async (userId) => {
  try {
      // Delete user in the database based on userId
      const deletedUser = await UserModel.findOneAndDelete({ _id: userId });

      if (!deletedUser) {
          throw new Error('User not found');
      }

      return true;
  } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message || 'Internal Server Error' };
  }
};

const getOneUserService = async (userId) => {
  try {
      // Get user from the database based on userId
      const user = await UserModel.findOne({ _id: userId });

      if (!user) {
          throw new Error('User not found');
      }

      return { success: true, user };
  } catch (error) {
      console.error('Error retrieving user:', error);
      return { success: false, error: error.message || 'Internal Server Error' };
  }
};



export { createUserService, loginService, getUsersService, updateUserService,deleteUserService,getOneUserService }
