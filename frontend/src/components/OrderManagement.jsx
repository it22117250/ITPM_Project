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
  AutoComplete,
  Badge,
  Tag,
} from "antd";
import { Content } from "antd/es/layout/layout";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { orderApi } from "../api/orderApi";
import { productApi } from "../api/productApi";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productStockModalOpened, setProductStockModalOpened] = useState(false);
  const [productStocks, setProductStocks] = useState([]);
  const [form] = Form.useForm();

  const getStockOutProducts = async () => {
    const products = (await productApi.getAll()).data;
    let found = false;
    const productStocks = [];
    for (const product of products) {
      if (product.quantity < 5) {
        productStocks.push(product);
        found = true;
      }
    }
    setProductStocks(productStocks);
    if (found) {
      setProductStockModalOpened(true);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        orderApi.getAll(),
        productApi.getAll(),
      ]);
      setOrders(ordersData.data);
      setFilteredOrders(ordersData.data);
      setProducts(productsData.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Search products
  const searchProducts = async (value) => {
    if (!value) {
      setProductSearchResults([]);
      return;
    }
    try {
      const result = products.filter((product) => {
        return (
          product.name.toLowerCase().includes(value.toLowerCase()) ||
          product.productSlug.toLowerCase().includes(value.toLowerCase())
        );
      });
      setProductSearchResults(result ?? []);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };
  // Handle product selection
  const handleProductSelect = (value, option) => {
    const product = productSearchResults.find((p) => p.id === option.key);
    if (product) {
      const existingProduct = selectedProducts.find((p) => p.id === product.id);
      if (existingProduct) {
        message.warning("Product already added to order");
        return;
      }
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
      form.setFieldsValue({ productSearch: "" });
    }
  };

  // Update product quantity
  const updateProductQuantity = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map((p) => (p.id === productId ? { ...p, quantity } : p))
    );
  };

  // Remove product from order
  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  // Search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = orders.filter(
      (order) =>
        order.orderSlug.toLowerCase().includes(value.toLowerCase()) ||
        order.customerName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  // Generate PDF Report
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const timestamp = moment().format("YYYYMMDD_HHmmss");
      const fileName = `orders_report_${timestamp}.pdf`;

      doc.setFontSize(16);
      doc.text("Order Management Report", 14, 15);
      doc.setFontSize(12);
      doc.text(
        `Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`,
        14,
        23
      );

      const tableColumn = [
        "Order ID",
        "Customer",
        "Status",
        "Payment Method",
        "Contact",
        "Date",
      ];
      const tableRows = filteredOrders.map((order) => [
        order.orderSlug,
        order.customerName,
        order.status,
        order.paymentMethod,
        order.contactNumber,
        moment(order.createdAt).format("YYYY-MM-DD"),
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

  // Modal operations
  const showModal = (order = null) => {
    setEditingOrder(order);
    if (order) {
      setSelectedProducts(order.products);
      form.setFieldsValue({
        ...order,
        products: undefined,
      });
    } else {
      setSelectedProducts([]);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingOrder(null);
    setSelectedProducts([]);
    form.resetFields();
  };

  // Form submission
  const handleSubmit = async (values) => {
    if (selectedProducts.length === 0) {
      message.error("Please add at least one product to the order");
      return;
    }

    const orderData = {
      ...values,
      products: selectedProducts,
    };

    try {
      setLoading(true);
      if (editingOrder) {
        await orderApi.update(editingOrder.id, orderData);
        await getStockOutProducts();
        message.success("Order updated successfully");
      } else {
        await orderApi.create(orderData);
        message.success("Order created successfully");
        await getStockOutProducts();
      }
      handleCancel();
      fetchOrders();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await orderApi.delete(id);
      message.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "warning",
      Processing: "processing",
      Shipped: "success",
      Delivered: "success",
      Cancelled: "error",
    };
    return colors[status] || "default";
  };
  const stockColumns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Stock Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  // Table columns
  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderSlug",
      key: "orderSlug",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge status={getStatusColor(status)} text={status} />
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => (
        <Tag color={method === "card" ? "blue" : "green"}>{method}</Tag>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
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
            title="Are you sure you want to delete this order?"
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
              Add Order
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={generatePDF}>
              Generate Report
            </Button>
          </Space>
          <Input
            placeholder="Search by order ID or customer name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingOrder ? "Edit Order" : "Add Order"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[{ required: true, message: "Please input customer name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="shippingAddress"
            label="Shipping Address"
            rules={[
              { required: true, message: "Please input shipping address!" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="contactNumber"
            label="Contact Number"
            rules={[
              { required: true, message: "Please input contact number!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[
              { required: true, message: "Please select payment method!" },
            ]}
          >
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
            </Select>
          </Form.Item>

          {editingOrder && (
            <Form.Item
              name="status"
              label="Order Status"
              rules={[
                { required: true, message: "Please select order status!" },
              ]}
            >
              <Select>
                <Option value="Pending">Pending</Option>
                <Option value="Processing">Processing</Option>
                <Option value="Shipped">Shipped</Option>
                <Option value="Delivered">Delivered</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Add Products">
            <AutoComplete
              style={{ width: "100%" }}
              placeholder="Search products by name or ID"
              onSearch={searchProducts}
              onSelect={handleProductSelect}
              options={productSearchResults.map((product) => ({
                key: product.id,
                value: product.name,
                label: `${product.name} (${product.productSlug}) (In Stock Amount : ${product.quantity})`,
              }))}
            />
          </Form.Item>

          {selectedProducts.length > 0 && (
            <Card title="Selected Products" size="small">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span>{product.name}</span>
                  <Space>
                    <InputNumber
                      min={1}
                      value={product.quantity}
                      onChange={(value) =>
                        updateProductQuantity(product.id, value)
                      }
                    />
                    <Button
                      type="link"
                      danger
                      onClick={() => removeProduct(product.id)}
                    >
                      Remove
                    </Button>
                  </Space>
                </div>
              ))}
            </Card>
          )}

          <Form.Item style={{ marginTop: 16 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingOrder ? "Update" : "Create"}
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Below Products Going Low"
        open={productStockModalOpened}
        onCancel={() => setProductStockModalOpened(false)}
        footer={null}
      >
        <Table
          dataSource={productStocks.map((product, index) => ({
            ...product,
            key: index,
          }))}
          columns={stockColumns}
          pagination={false}
          scroll={{ y: 400 }}
        />
      </Modal>
    </Content>
  );
};

export default OrderManagement;
