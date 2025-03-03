import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['superadmin', 'seller'], required: true },
  shopCategory: { type: String, required: true },
  // Add any other fields you need for your user model
});


const UserModel = mongoose.model('User', userSchema);

export default UserModel;
