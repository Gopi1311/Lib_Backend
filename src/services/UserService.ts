import mongoose from "mongoose";
import { User } from "../models/User";
import { Borrow } from "../models/Borrow";
import { Reservation } from "../models/Reservation";
import { buildSearchFilter } from "../utils/buildSearchFilter";
import { generateRandomId } from "../utils/generateRandomId";

class UserService {

  /* --------------------------------------------------
   * ADD USER
   * -------------------------------------------------- */
  async addUser(data: any) {
    const { name, email, phone, address, role, password } = data;

    const existing = await User.findOne({ email });
    if (existing) throw { status: 409, message: "Email already exists." };

    let membershipId = null;

    if (role === "member") {
      membershipId = generateRandomId("MEMB");
    } else if (role === "librarian") {
      membershipId = generateRandomId("LIB");
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      address,
      role,
      password,
      membershipId,
    });

    const { password: _, ...safeUser } = newUser.toObject();

    return {
      message: "User created successfully",
      user: safeUser,
    };
  }

  /* --------------------------------------------------
   * GET ALL USERS + computed fields
   * -------------------------------------------------- */
  async getAllUserDetails() {
    const users = await User.find().select("-password").lean();

    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const userId = user._id;

        // LAST BORROW STATUS
        const lastBorrow = await Borrow.findOne({ userId })
          .sort({ issueDate: -1 })
          .lean();

        const lastBorrowStatus = lastBorrow ? lastBorrow.status : "none";

        // PENDING FINES
        const pendingBorrow = await Borrow.findOne({
          userId,
          fine: { $gt: 0 },
        }).lean();

        const pendingFines = pendingBorrow ? pendingBorrow.fine : 0;

        // ACTIVE RESERVATIONS
        const reservationsCount = await Reservation.countDocuments({
          userId,
          status: "active",
        });

        return {
          ...user,
          lastBorrowStatus,
          reservations: reservationsCount,
          pendingFines,
        };
      })
    );

    return enhancedUsers;
  }

  /* --------------------------------------------------
   * GET USER BY ID
   * -------------------------------------------------- */
  async getUserById(id: string) {
    const user = await User.findById(id).select("-password").lean();

    if (!user) throw { status: 404, message: "User not found" };

    return user;
  }

  /* --------------------------------------------------
   * UPDATE USER 
   * -------------------------------------------------- */
  async updateUser(id: string, data: any) {
    const existingUser = await User.findById(id);
    if (!existingUser) throw { status: 404, message: "User not found" };

    // prevent restricted fields
    delete data.email;
    delete data.password;

    if (existingUser.role === "member") {
      data.membershipId = existingUser.membershipId;
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    return {
      message: "User updated successfully",
      updatedUser,
    };
  }

  /* --------------------------------------------------
   * SEARCH USER
   * -------------------------------------------------- */
  async searchUser(query: any) {
    const fields = ["name", "email", "role", "membershipId", "phone"] as const;

    const filter = buildSearchFilter(query, fields);

    if (Object.keys(filter).length === 0) {
      throw {
        status: 400,
        message:
          "Please provide at least one search parameter (name, email, role, membershipId, phone).",
      };
    }

    const users = await User.find(filter).select("-password").lean();
    return users;
  }
}

export default new UserService();
