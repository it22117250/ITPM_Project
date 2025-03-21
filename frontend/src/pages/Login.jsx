import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/userApi";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Add form instance

  const onFinish = async (values) => {
    const { email, password } = values;

    try {
      setLoading(true);
      const data = await userApi.login({ email, password });

      // Store the token in localStorage
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        message.success({
          content: "Login successful!",
          duration: 3,
          key: "login_success",
        });
        navigate("/");
      } else {
        message.error({
          content: "Login failed: No token received",
          duration: 3,
          key: "login_error",
        });
      }
    } catch (error) {
      // Handle specific error messages from the backend
      const errorMessage =
        error.message || "Invalid credentials. Please try again.";
      message.error({
        content: errorMessage,
        duration: 3,
        key: "login_error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error({
      content: "Please fill out all required fields correctly.",
      duration: 3,
      key: "form_error",
    });
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card style={{ width: 600 }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h1>
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%" }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
