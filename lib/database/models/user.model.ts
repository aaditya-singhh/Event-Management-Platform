import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: { type: String, required: false, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: false},
  firstName: { type: String, required: true },
  lastName: {type: String, required: true },
  photo: { type: String, required: true },
})

const User = models.User || model('User', UserSchema);

export default User;
