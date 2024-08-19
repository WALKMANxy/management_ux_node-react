import bcrypt from "bcryptjs";
import { CallbackError, Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  email: string;
  googleId?: string;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: "admin" | "agent" | "client" | "guest";
  entityCode?: string;
  linkedEntities?: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  refreshTokens: string[];
  authType: "email" | "google"; // New field to distinguish authentication type
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    password: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    role: {
      type: String,
      required: true,
      enum: ["admin", "agent", "client", "guest"],
      default: "guest",
    },
    entityCode: { type: String },
    linkedEntities: { type: [String] },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isEmailVerified: { type: Boolean, default: false },
    refreshTokens: [{ type: String }],
    authType: { type: String, required: true, enum: ["email", "google"] }, // New field
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
    const salt = await bcrypt.genSalt(10); // bcryptjs uses the same API as bcrypt
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
