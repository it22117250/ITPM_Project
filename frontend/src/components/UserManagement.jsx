import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  message,
  Popconfirm,
  Card,
} from "antd";
import { Content } from "antd/es/layout/layout";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { userApi } from "../api/userApi";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ChangePasswordForm from "./ChangePasswordForm";

function formatSupplierManager(inputString) {
  if (typeof inputString !== "string") {
    return "Invalid input: Please provide a string."; // Handle non-string input
  }

  // 1. Convert to lowercase:
  const lowerCaseString = inputString.toLowerCase();

  // 2. Replace underscores and hyphens with spaces:
  const spacedString = lowerCaseString.replace(/[-_]+/g, " ");

  // 3. Capitalize the first letter of each word:
  const words = spacedString.split(" ");
  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      // Handle empty words (e.g., from double spaces)
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return ""; // Return empty string for empty words
  });

  // 4. Join the words back together with spaces:
  const formattedString = capitalizedWords.join(" ");

  return formattedString;
}

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.nic.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Generate PDF Report
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const timestamp = moment().format("YYYYMMDD_HHmmss");
      const fileName = `users_report_${timestamp}.pdf`;

      // Add title to the PDF
      doc.setFontSize(16);
      doc.text("User Management Report", 14, 15);
      doc.setFontSize(12);
      doc.text(
        `Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`,
        14,
        23
      );

      // Prepare table data
      const tableColumn = [
        "Name",
        "Email",
        "NIC",
        "Contact",
        "Role",
        "Work Start Date",
      ];
      const tableRows = filteredUsers.map((user) => [
        user.name,
        user.email,
        user.nic,
        user.contactNumber || "N/A",
        user.role,
        moment(user.workStartDate).format("YYYY-MM-DD"),
      ]);

      // Add table to PDF
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
        },
      });

      // Save PDF
      doc.save(fileName);
      message.success("PDF report generated successfully!");
    } catch (error) {
      message.error("Failed to generate PDF report");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle modal operations
  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        ...user,
        workStartDate: moment(user.workStartDate),
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingUser) {
        await userApi.update(editingUser.id, {
          ...values,
          workStartDate: values.workStartDate.toISOString(),
        });
        message.success("User updated successfully");
      } else {
        await userApi.create({
          ...values,
          workStartDate: values.workStartDate.toISOString(),
        });
        message.success("User created successfully");
      }
      handleCancel();
      fetchUsers();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await userApi.delete(id);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "NIC",
      dataIndex: "nic",
      key: "nic",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <p>{formatSupplierManager(role)}</p>,
    },
    {
      title: "Work Start Date",
      dataIndex: "workStartDate",
      key: "workStartDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
      sorter: (a, b) =>
        moment(a.workStartDate).unix() - moment(b.workStartDate).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          ></Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: "20px" }}>
      <Card style={{ marginBottom: 16 }}>
        <Space
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Add User
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={generatePDF}>
              Generate Report
            </Button>
          </Space>
          <Input
            placeholder="Search by name, email, or NIC"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input the password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="nic"
            label="NIC"
            rules={[{ required: true, message: "Please input the NIC!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="contactNumber" label="Contact Number">
            <Input />
          </Form.Item>

          <Form.Item
            name="workStartDate"
            label="Work Start Date"
            rules={[
              { required: true, message: "Please select the work start date!" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select the role!" }]}
            initialValue="manager"
          >
            <Select>
              <Select.Option value="product_manager">
                Product Manager
              </Select.Option>
              <Select.Option value="supplier_manager">
                Supplier Manager
              </Select.Option>
              <Select.Option value="order_manager">Order Manager</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? "Update" : "Create"}
              </Button>
              {editingUser && (
                <Button
                  type="primary"
                  onClick={() => {
                    setChangePasswordModalVisible(true);
                  }}
                  loading={loading}
                >
                  {"Change Password"}
                </Button>
              )}
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={changePasswordModalVisible}
        onCancel={() => {
          setChangePasswordModalVisible(false);
        }}
        footer={null}
      >
        <ChangePasswordForm
          userId={editingUser?.id}
          onSuccess={() => {
            setChangePasswordModalVisible(false);
          }}
        />
      </Modal>
    </Content>
  );
};

export default UserManagement;
