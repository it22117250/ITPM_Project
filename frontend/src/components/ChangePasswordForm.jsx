import React from "react";
import { Form, Input, Button, message } from "antd";
import { userApi } from "../api/userApi";

const ChangePasswordForm = ({ onSuccess, userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await userApi.changePassword(userId, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Password changed successfully");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="max-w-md mx-auto py-4"
    >
      <Form.Item
        name="currentPassword"
        label="Current Password"
        rules={[
          {
            required: true,
            message: "Please input your current password",
          },
        ]}
      >
        <Input.Password placeholder="Enter current password" />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[
          {
            required: true,
            message: "Please input your new password",
          },
          {
            min: 8,
            message: "Password must be at least 8 characters",
          },
        ]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm New Password"
        dependencies={["newPassword"]}
        rules={[
          {
            required: true,
            message: "Please confirm your new password",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The two passwords do not match")
              );
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm new password" />
      </Form.Item>

      <Form.Item className="mb-0">
        <div className="flex justify-end gap-2">
          <Button onClick={() => form.resetFields()}>Reset</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;
