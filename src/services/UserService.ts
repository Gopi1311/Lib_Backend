import mongoose from "mongoose";
import { User } from "../models/User";
import { Borrow } from "../models/Borrow";
import { Reservation } from "../models/Reservation";
import { buildSearchFilter } from "../utils/buildSearchFilter";
import { generateRandomId } from "../utils/generateRandomId";
import { assertIsObject } from "../utils/errors/validateObject";
import { AppError } from "../utils/errors/AppError";
import bcrypt from "bcrypt";
import { config } from "../config/env";

interface CreateUserFields {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "member" | "librarian" | "admin";
  password: string;
}

interface UpdateUserFields {
  name?: string;
  phone?: string;
  address?: string;
  role?: string;
  membershipId?: string;
}

class UserService {
  async addUser(data: unknown) {
    assertIsObject(data, "Invalid request body");
    const body = data as Partial<CreateUserFields>;

    const required = [
      "name",
      "email",
      "phone",
      "address",
      "role",
      "password",
    ] as const;

    for (const field of required) {
      if (!body[field]) {
        throw new AppError(`Missing field: ${field}`, 400);
      }
    }
    const existing = await User.findOne({ email: body.email });
    if (existing) throw new AppError("Email already exists.", 409);

    // Generate membershipId
    let membershipId: string | undefined = undefined;
    if (body.role === "member") membershipId = generateRandomId("MEMB");
    if (body.role === "librarian") membershipId = generateRandomId("LIB");

    try {
      // Hash password BEFORE saving (very important)
      const hashedPassword = await bcrypt.hash(body.password!,10);

      const newUser = await User.create({
        ...body,
        password: hashedPassword,
        membershipId,
      });

      const { password: _, ...safeUser } = newUser.toObject();

      return {
        message: "User created successfully",
        user: safeUser,
      };
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }
      throw err;
    }
  }

  async getAllUserDetails() {
    const users = await User.find().select("-password").lean();

    const enhanced = await Promise.all(
      users.map(async (user) => {
        const userId = user._id;

        const lastBorrow = await Borrow.findOne({ userId })
          .sort({ issueDate: -1 })
          .lean();
        const lastBorrowStatus = lastBorrow ? lastBorrow.status : "none";

        const pendingFineBorrow = await Borrow.findOne({
          userId,
          fine: { $gt: 0 },
        }).lean();
        const pendingFines = pendingFineBorrow ? pendingFineBorrow.fine : 0;

        const reservationsCount = await Reservation.countDocuments({
          userId,
          status: "active",
        });

        return {
          ...user,
          lastBorrowStatus,
          pendingFines,
          reservations: reservationsCount,
        };
      })
    );

    return enhanced;
  }
  async getUserById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userId = user._id;

    // 📌 Last Borrow Status
    const lastBorrow = await Borrow.findOne({ userId })
      .sort({ issueDate: -1 })
      .lean();

    const lastBorrowStatus = lastBorrow ? lastBorrow.status : "none";

    // 📌 Pending Fines
    const pendingFineBorrow = await Borrow.findOne({
      userId,
      fine: { $gt: 0 },
    }).lean();

    const pendingFines = pendingFineBorrow ? pendingFineBorrow.fine : 0;

    // 📌 Active reservations count
    const reservations = await Reservation.countDocuments({
      userId,
      status: "active",
    });

    return {
      ...user,
      lastBorrowStatus,
      pendingFines,
      reservations,
    };
  }

  async updateUser(id: string, data: unknown) {
    assertIsObject(data, "Invalid request body");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", 400);
    }

    const existingUser = await User.findById(id);
    if (!existingUser) throw new AppError("User not found", 404);

    const body = data as Partial<UpdateUserFields>;

    // Prevent updating protected fields
    delete (body as any).email;
    delete (body as any).password;
    delete (body as any).membershipId;

    // Preserve membershipId for members
    if (existingUser.role === "member") {
      body.membershipId = existingUser.membershipId;
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      })
        .select("-password")
        .lean();

      return {
        message: "User updated successfully",
        updatedUser,
      };
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }
      throw err;
    }
  }

  async searchUser(query: unknown) {
    assertIsObject(query, "Invalid search query");

    const q = query as Record<string, unknown>;
    const fields = ["name", "email", "role", "membershipId", "phone"] as const;

    const filter = buildSearchFilter(q, fields);

    if (Object.keys(filter).length === 0) {
      throw new AppError(
        "Please provide at least one search parameter (name, email, role, membershipId, phone).",
        400
      );
    }

    return User.find(filter).select("-password").lean();
  }
}

export default new UserService();
