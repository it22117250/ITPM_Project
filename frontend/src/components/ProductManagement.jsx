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
  Select,
  InputNumber,
} from "antd";
import { Content } from "antd/es/layout/layout";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { supplierApi } from "../api/supplierApi";
import { categoryApi } from "../api/categoryApi";
import { productApi } from "../api/productApi";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        supplierApi.getAll(),
      ]);

      setProducts(productsData.data);
      setFilteredProducts(productsData.data);
      setCategories(categoriesData.data);
      setSuppliers(suppliersData.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.productSlug.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Generate PDF Report
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const timestamp = moment().format("YYYYMMDD_HHmmss");
      const fileName = `products_report_${timestamp}.pdf`;

      doc.setFontSize(16);
      doc.text("Product Management Report", 14, 15);
      doc.setFontSize(12);
      doc.text(
        `Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`,
        14,
        23
      );

      const tableColumn = [
        "Product ID",
        "Name",
        "Category",
        "Supplier",
        "Unit Price",
        "Quantity",
      ];
      const tableRows = filteredProducts.map((product) => [
        product.productSlug,
        product.name,
        product.category.name,
        product.supplier.name,
        product.unitPrice,
        product.quantity,
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      doc.save(fileName);
      message.success("PDF report generated successfully!");
    } catch (error) {
      message.error("Failed to generate PDF report");
      console.error(error);
    }
  };

  // Handle modal operations
  const showModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue({
        ...product,
        categoryId: product.category.id,
        supplierId: product.supplier.id,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingProduct) {
        await productApi.update(editingProduct.id, values);
        message.success("Product updated successfully");
      } else {
        await productApi.create(values);
        message.success("Product created successfully");
      }
      handleCancel();
      fetchData();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await productApi.delete(id);
      message.success("Product deleted successfully");
      fetchData();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "Product ID",
      dataIndex: "productSlug",
      key: "productSlug",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: "Supplier",
      dataIndex: ["supplier", "name"],
      key: "supplier",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
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
            title="Are you sure you want to delete this product?"
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
              Add Product
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={generatePDF}>
              Generate Report
            </Button>
          </Space>
          <Input
            placeholder="Search by name or product ID"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
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
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select>
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="supplierId"
            label="Supplier"
            rules={[{ required: true, message: "Please select a supplier!" }]}
          >
            <Select>
              {suppliers.map((supplier) => (
                <Select.Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="Unit Price"
            rules={[
              { required: true, message: "Please input the unit price!" },
            ]}
          >
            <InputNumber
              min={0}
              step={0.01}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please input the quantity!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProduct ? "Update" : "Create"}
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default ProductManagement;
