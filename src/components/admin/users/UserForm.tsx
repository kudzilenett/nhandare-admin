"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { CreateUserData, UpdateUserData } from "@/services/UserService";

const userFormSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Please enter a valid email address"),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name is too long"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name is too long"),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^\+?[1-9]\d{1,14}$/.test(value),
        "Please enter a valid phone number"
      ),
    role: z.enum(["user", "admin", "moderator"], {
      error: "Please select a role",
    }),
    status: z.enum(["active", "inactive"], {
      error: "Please select a status",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string(),
    walletBalance: z
      .number()
      .min(0, "Wallet balance cannot be negative")
      .optional(),
    isEmailVerified: z.boolean().optional(),
    isPhoneVerified: z.boolean().optional(),
    sendWelcomeEmail: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: "user" | "admin" | "moderator";
    status: "active" | "inactive" | "banned" | "pending";
    walletBalance: number;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  title?: string;
}

export default function UserForm({
  user,
  isOpen,
  onClose,
  onSubmit,
  title,
}: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditing = !!user;
  const modalTitle = title || (isEditing ? "Edit User" : "Create New User");

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "user",
      status: "active",
      password: "",
      confirmPassword: "",
      walletBalance: 0,
      isEmailVerified: false,
      isPhoneVerified: false,
      sendWelcomeEmail: true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = form;

  // Update form when user changes
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        status: user.status as "active" | "inactive",
        password: "", // Don't populate password for editing
        confirmPassword: "",
        walletBalance: user.walletBalance,
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
        sendWelcomeEmail: false, // Don't send welcome email when editing
      });
    } else {
      reset({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: "user",
        status: "active",
        password: "",
        confirmPassword: "",
        walletBalance: 0,
        isEmailVerified: false,
        isPhoneVerified: false,
        sendWelcomeEmail: true,
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);

      const submitData: CreateUserData | UpdateUserData = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        status: data.status,
        ...(isEditing
          ? {
              walletBalance: data.walletBalance,
              isEmailVerified: data.isEmailVerified,
              isPhoneVerified: data.isPhoneVerified,
            }
          : {
              password: data.password,
              sendWelcomeEmail: data.sendWelcomeEmail,
            }),
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting user form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="max-h-[calc(90vh-140px)] overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <IdentificationIcon className="h-5 w-5 text-gray-400 mr-2" />
                Basic Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username *
                  </label>
                  <input
                    {...register("username")}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      {...register("email")}
                      type="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                      placeholder="Enter email address"
                    />
                    <EnvelopeIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name *
                  </label>
                  <input
                    {...register("firstName")}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name *
                  </label>
                  <input
                    {...register("lastName")}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      {...register("phoneNumber")}
                      type="tel"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                      placeholder="Enter phone number"
                    />
                    <PhoneIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                Account Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role *
                  </label>
                  <select
                    {...register("role")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status *
                  </label>
                  <select
                    {...register("status")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Verification Status (for editing) */}
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center">
                    <input
                      {...register("isEmailVerified")}
                      type="checkbox"
                      className="h-4 w-4 text-admin-accent border-gray-300 rounded focus:ring-admin-accent"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Email Verified
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      {...register("isPhoneVerified")}
                      type="checkbox"
                      className="h-4 w-4 text-admin-accent border-gray-300 rounded focus:ring-admin-accent"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Phone Verified
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Password (for new users) */}
            {!isEditing && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Password
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        {...register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Balance (for editing) */}
            {isEditing && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Wallet Balance
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="walletBalance"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Balance (USD)
                    </label>
                    <input
                      {...register("walletBalance", { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                      placeholder="0.00"
                    />
                    {errors.walletBalance && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.walletBalance.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Options */}
            {!isEditing && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Additional Options
                </h4>

                <div className="flex items-center">
                  <input
                    {...register("sendWelcomeEmail")}
                    type="checkbox"
                    className="h-4 w-4 text-admin-accent border-gray-300 rounded focus:ring-admin-accent"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Send welcome email to user
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-admin-accent border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
