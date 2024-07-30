import { Schema, model, Document, CallbackError } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  googleId?: string;
  password?: string; // Optional for OAuth users
  passwordResetToken?: string; // Optional for password reset
  passwordResetExpires?: Date; // Optional for password reset
  role: "admin" | "agent" | "client" | "guest";
  entityCode?: string; // Code linking to admin, agent, or client
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare password
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    password: { type: String }, // Optional for OAuth users
    passwordResetToken: { type: String }, // Optional for password reset
    passwordResetExpires: { type: Date }, // Optional for password reset
    role: {
      type: String,
      required: true,
      enum: ["admin", "agent", "client", "guest"],
      default: "guest",
    },
    entityCode: { type: String }, // Link to admin, agent, or client via code
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving the user
userSchema.pre<IUser>("save", async function (next) {
  const user = this as IUser;

  if (!user.isModified("password") || !user.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError); // Ensure the error is correctly typed
  }
});

// Compare password method
userSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

export const User = model<IUser>("User", userSchema);
