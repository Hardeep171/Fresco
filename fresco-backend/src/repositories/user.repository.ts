import { UserModel } from "../models/user.model.js";
import { OrderModel } from "../models/order.model.js";
import type { UpdateProfileInput } from "../validators/user.validator.js";

/** Repository handling database operations for User module. */
export const userRepository = {
  /**
   * Finds a user document by ID explicitly excluding sensitive fields (password, refreshToken).
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserById(userId: string) {
    return UserModel.findById(userId).select("-password -refreshToken").exec();
  },

  /**
   * Updates user profile fields excluding sensitive fields (password, refreshToken).
   *
   * @param userId - The user's unique identifier.
   * @param updateData - Validated profile update properties.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async updateUserProfile(userId: string, updateData: UpdateProfileInput) {
    return UserModel.findByIdAndUpdate(userId, updateData, { returnDocument: "after" })
      .select("-password -refreshToken")
      .exec();
  },

  /**
   * Finds a user document by ID including sensitive fields (password, refreshToken).
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByIdWithPasswordAndRefreshToken(userId: string) {
    return UserModel.findById(userId).select("+password +refreshToken").exec();
  },

  /**
   * Updates a user's password and clears the stored refresh token in a single operation.
   *
   * @param userId - The user's unique identifier.
   * @param hashedPassword - The hashed new password.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async updatePasswordAndClearRefreshToken(userId: string, hashedPassword: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        $unset: { refreshToken: 1 },
      },
      { returnDocument: "after" },
    ).exec();
  },

  /**
   * Finds a user document by email address.
   *
   * @param email - The user's email address.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  },

  /**
   * Saves the hashed password reset token and expiration date for a user.
   *
   * @param userId - The user's unique identifier.
   * @param passwordResetToken - Hashed reset token.
   * @param passwordResetTokenExpiresAt - Expiration timestamp.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async savePasswordResetToken(
    userId: string,
    passwordResetToken: string,
    passwordResetTokenExpiresAt: Date,
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        passwordResetToken,
        passwordResetTokenExpiresAt,
      },
      { returnDocument: "after" },
    ).exec();
  },

  /**
   * Finds a user document by hashed password reset token, explicitly selecting passwordResetTokenExpiresAt.
   *
   * @param passwordResetToken - Hashed reset token.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByPasswordResetToken(passwordResetToken: string) {
    return UserModel.findOne({ passwordResetToken })
      .select("+passwordResetToken +passwordResetTokenExpiresAt")
      .exec();
  },

  /**
   * Performs ONE atomic update that sets the new hashed password and removes
   * passwordResetToken, passwordResetTokenExpiresAt, and refreshToken.
   *
   * @param userId - The user's unique identifier.
   * @param hashedPassword - The new hashed password.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async resetPasswordAndClearTokens(userId: string, hashedPassword: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        $unset: {
          passwordResetToken: 1,
          passwordResetTokenExpiresAt: 1,
          refreshToken: 1,
        },
      },
      { returnDocument: "after" },
    ).exec();
  },

  /**
   * Saves the hashed email verification token and expiration date for a user.
   *
   * @param userId - The user's unique identifier.
   * @param emailVerificationToken - Hashed email verification token.
   * @param emailVerificationTokenExpiresAt - Expiration timestamp.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async saveEmailVerificationToken(
    userId: string,
    emailVerificationToken: string,
    emailVerificationTokenExpiresAt: Date,
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        emailVerificationToken,
        emailVerificationTokenExpiresAt,
      },
      { returnDocument: "after" },
    ).exec();
  },

  /**
   * Finds a user document by hashed email verification token, explicitly selecting emailVerificationToken and emailVerificationTokenExpiresAt.
   *
   * @param emailVerificationToken - Hashed email verification token.
   * @returns Promise resolving to the user document if found, or null.
   */
  async findUserByEmailVerificationToken(emailVerificationToken: string) {
    return UserModel.findOne({ emailVerificationToken })
      .select("+emailVerificationToken +emailVerificationTokenExpiresAt")
      .exec();
  },

  /**
   * Atomically marks user email as verified and clears email verification token fields.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the updated user document if found, or null.
   */
  async verifyEmailAndClearToken(userId: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        $unset: {
          emailVerificationToken: 1,
          emailVerificationTokenExpiresAt: 1,
        },
      },
      { returnDocument: "after" },
    ).exec();
  },

  /**
   * Finds users matching optional query filters (role, status, search string).
   * Excludes password and refresh token.
   */
  async findUsers(filters: { role?: string; status?: string; search?: string } = {}) {
    const query: Record<string, any> = {};
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }
    return UserModel.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  /**
   * Updates user account status (ACTIVE, INACTIVE, SUSPENDED).
   */
  async updateUserStatus(userId: string, status: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { status },
      { returnDocument: "after" },
    )
      .select("-password -refreshToken")
      .exec();
  },

  /**
   * Aggregates live platform operational statistics for admin dashboard.
   */
  async getAdminStats() {
    const [
      totalCustomers,
      totalPartners,
      activeCustomers,
      activePartners,
      orders,
    ] = await Promise.all([
      UserModel.countDocuments({ role: "CUSTOMER" }),
      UserModel.countDocuments({ role: "DELIVERY_PARTNER" }),
      UserModel.countDocuments({ role: "CUSTOMER", status: "ACTIVE" }),
      UserModel.countDocuments({ role: "DELIVERY_PARTNER", status: "ACTIVE" }),
      OrderModel.find({}, { status: 1, "pricing.totalAmount": 1 }).lean(),
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "PLACED" || o.status === "CONFIRMED").length;
    const activeOrders = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;
    const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
    const totalRevenue = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum: number, o: any) => sum + (Number(o.pricing?.totalAmount) || 0), 0);

    return {
      totalCustomers,
      totalPartners,
      activeCustomers,
      activePartners,
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      totalRevenue,
    };
  },
};


