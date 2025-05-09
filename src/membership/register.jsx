import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export function Membership_Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_number: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");

  // Load registration success from sessionStorage (in case of re-render)
  useEffect(() => {
    const success = sessionStorage.getItem("registrationSuccess");
    const code = sessionStorage.getItem("registrationCode");
    if (success === "true" && code) {
      setRegistrationSuccess(true);
      setRegistrationCode(code);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "student_number") {
      if (value === "" || /^[0-9]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student_number.trim()) {
      newErrors.student_number = "Student number is required";
    } else if (formData.student_number.length < 4) {
      newErrors.student_number = "Student number must be at least 4 digits";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/membership/register`,
        {
          student_number: formData.student_number.toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.message === "student number already exist!") {
        setErrors({
          student_number: "This student number is already registered",
        });
      } else {
        sessionStorage.setItem("registrationSuccess", "true");
        sessionStorage.setItem("registrationCode", data.code);

        setRegistrationSuccess(true);
        setRegistrationCode(data.code);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    // Clear sessionStorage and redirect
    sessionStorage.removeItem("registrationSuccess");
    sessionStorage.removeItem("registrationCode");
    navigate("/");
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Registration Successful!
              </h2>
              <p className="text-gray-700">Registered Thank you!</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <p className="text-sm text-gray-600 mb-1">Your unique code:</p>
              <p className="text-2xl font-mono font-bold text-blue-700">
                {registrationCode}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Please keep this code safe. You'll need it for account
                verification.
              </p>
            </div>

            <button
              onClick={handleGoHome}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-blue-600 mb-2">SWAVE</h1>
          <p className="text-gray-600">Create your student account</p>
        </div>

        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="student_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Student Number *
              </label>
              <input
                type="text"
                id="student_number"
                name="student_number"
                value={formData.student_number}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.student_number ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your student number"
                required
              />
              {errors.student_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.student_number}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your full name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Create a password"
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-red-800 py-4">
        <div className="container mx-auto px-4 text-center text-white">
          <p>
            © {new Date().getFullYear()} SWAVE Student Portal. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
