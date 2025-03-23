import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/userApi";
import loginPageImage from "./login_page.png"; // Import the image

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State to hold error message
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { email, password } = values;

    try {
      setLoading(true);
      setError(""); // Reset error message on new attempt
      const data = await userApi.login({ email, password });

      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        message.success("Login successful!");
        navigate("/");
      } else {
        setError("Invalid credentials. Please check your email and password."); // Set error message if login fails
      }
    } catch (error) {
      setError(error.message || "Invalid Credentials. Please try again."); // Handle any unexpected errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "radial-gradient(circle, #1897a6, #21243b)" }}>
      <div style={{ background: "white", display: "flex", overflow: "hidden", borderRadius: "20px", width: 800, height: 500, backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
        
        {/* Left Section - Image */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f0f2f5", overflow: "hidden", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px" }}>
          <img src={loginPageImage} alt="Login" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        
        {/* Right Section - Login Form */}
        <div style={{ flex: 1, padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backdropFilter: "blur(15px)", backgroundColor: "rgba(255, 255, 255, 0.3)", borderTopRightRadius: "20px", borderBottomRightRadius: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
          <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#fff" }}>Login</h1>
          
          {/* Display error message if there is one */}
          {error && (
            <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
              <strong>{error}</strong>
            </div>
          )}
          
          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            style={{ width: "100%" }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email address!" }
              ]}
            >
              <Input placeholder="Email" style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", border: "none", padding: "10px", borderRadius: "10px" }} />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="Password" style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", border: "none", padding: "10px", borderRadius: "10px" }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: "100%", padding: "10px", borderRadius: "10px" }}>
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
