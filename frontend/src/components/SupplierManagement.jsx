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
import { supplierApi } from "../api/supplierApi";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierApi.getAll();
      setSuppliers(data.data);
      setFilteredSuppliers(data.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(value.toLowerCase()) ||
        supplier.email.toLowerCase().includes(value.toLowerCase()) ||
        supplier.nic.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  // Generate PDF Report
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const timestamp = moment().format("YYYYMMDD_HHmmss");
      const fileName = `suppliers_report_${timestamp}.pdf`;

      // Add title to the PDF
      doc.setFontSize(16);
      doc.text("Supplier Management Report", 14, 15);
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
        "Contact",
        "Address",
        "NIC",
        "Business Reg. No.",
      ];
      const tableRows = filteredSuppliers.map((supplier) => [
        supplier.name,
        supplier.email,
        supplier.contactNumber,
        supplier.address,
        supplier.nic,
        supplier.businessRegisteredNumber,
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

  // Handle modal operations
  const showModal = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      form.setFieldsValue(supplier);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingSupplier(null);
    form.resetFields();
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, values);
        message.success("Supplier updated successfully");
      } else {
        await supplierApi.create(values);
        message.success("Supplier created successfully");
      }
      handleCancel();
      fetchSuppliers();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle supplier deletion
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await supplierApi.delete(id);
      message.success("Supplier deleted successfully");
      fetchSuppliers();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "Supplier ID",
      dataIndex: "supplierSlug",
      key: "supplierSlug",
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "NIC",
      dataIndex: "nic",
      key: "nic",
    },
    {
      title: "Business Reg. No.",
      dataIndex: "businessRegisteredNumber",
      key: "businessRegisteredNumber",
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
            title="Are you sure you want to delete this supplier?"
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
        <h3 style={{ color: "white" }}>Supplier Management</h3>
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
                Add Supplier
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
            dataSource={filteredSuppliers}
            rowKey="id"
            loading={loading}
          />
        </Card>

        <Modal
          title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
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

            <Form.Item
              name="contactNumber"
              label="Contact Number"
              rules={[
                { required: true, message: "Please input the contact number!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Contact number must be exactly 10 digits!",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please input the address!" }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              name="nic"
              label="NIC"
              rules={[{ required: true, message: "Please input the NIC!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="businessRegisteredNumber"
              label="Business Registration Number"
              rules={[
                {
                  required: true,
                  message: "Please input the business registration number!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingSupplier ? "Update" : "Create"}
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

export default SupplierManagement;
