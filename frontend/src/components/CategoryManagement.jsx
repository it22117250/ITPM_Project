import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Card,
} from "antd";
import { Content, Header } from "antd/es/layout/layout";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { categoryApi } from "../api/categoryApi";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAll();
      setCategories(data.data);
      setFilteredCategories(data.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // Generate PDF Report
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const timestamp = moment().format("YYYYMMDD_HHmmss");
      const fileName = `categories_report_${timestamp}.pdf`;

      // Add title to the PDF
      doc.setFontSize(16);
      doc.text("Category Management Report", 14, 15);
      doc.setFontSize(12);
      doc.text(
        `Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`,
        14,
        23
      );

      // Prepare table data
      const tableColumn = ["Name"];
      const tableRows = filteredCategories.map((category) => [category.name]);

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

  // Handle modal operations
  const showModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, values);
        message.success("Category updated successfully");
      } else {
        await categoryApi.create(values);
        message.success("Category created successfully");
      }
      handleCancel();
      fetchCategories();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await categoryApi.delete(id);
      message.success("Category deleted successfully");
      fetchCategories();
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
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Header>
        <h3 style={{ color: "white" }}>Category Management</h3>
      </Header>
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
                Add Category
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={generatePDF}>
                Generate Report
              </Button>
            </Space>
            <Input
              placeholder="Search by name"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Space>

          <Table
            columns={columns}
            dataSource={filteredCategories}
            rowKey="id"
            loading={loading}
          />
        </Card>

        <Modal
          title={editingCategory ? "Edit Category" : "Add Category"}
          open={modalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please input the name!" },
                {
                  pattern: /^[A-Za-z\s]+$/,
                  message: "Name can only contain letters and spaces!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingCategory ? "Update" : "Create"}
                </Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </>
  );
};

export default CategoryManagement;
