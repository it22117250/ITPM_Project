import React, { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import CategoryManagement from "../components/CategoryManagement";
import SupplierManagement from "../components/SupplierManagement";
import OrderManagement from "../components/OrderManagement";
import ProductManagement from "../components/ProductManagement";

const { Sider } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1);

  const menuItems = [
    {
      key: "suppliers",
      icon: <TeamOutlined />,
      label: "Supplier Management",
      onClick: () => setActiveIndex(1),
    },
    {
      key: "categories",
      icon: <AppstoreOutlined />,
      label: "Category Management",
      onClick: () => setActiveIndex(2),
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Product Management",
      onClick: () => setActiveIndex(3),
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Order Management",
      onClick: () => setActiveIndex(4),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Title level={5} style={{ color: "white", margin: 0 }}>
            Dashboard
          </Title>
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}>
        {activeIndex === 1 && <SupplierManagement />}
        {activeIndex === 2 && <CategoryManagement />}
        {activeIndex === 3 && <ProductManagement />}
        {activeIndex === 4 && <OrderManagement />}
      </Layout>
    </Layout>
  );
};

export default Dashboard;
