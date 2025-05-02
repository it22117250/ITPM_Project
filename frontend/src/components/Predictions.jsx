import React, { useEffect, useState } from "react";
import { Layout, Table, Card, Modal } from "antd";
import { orderApi } from "../api/orderApi";
import { predictSales } from "../api/predictApi";
import { productApi } from "../api/productApi";

const { Header, Content } = Layout;

const Predictions = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModalOpened, setAlertModalOpened] = useState(false);

  const processOrders = async (orders) => {
    const salesByProductMonth = {};

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const monthYear = `${orderDate.getFullYear()}-${String(
        orderDate.getMonth() + 1
      ).padStart(2, "0")}`;

      order.products.forEach((product) => {
        const key = `${product.id}-${monthYear}`;

        if (!salesByProductMonth[key]) {
          salesByProductMonth[key] = {
            key,
            productId: product.id,
            productName: product.name,
            month: monthYear,
            totalSales: 0,
            currentStock: 0,
            totalQuantity: 0,
            category: product.category.name,
            productSlug: product.productSlug,
            nextMonthSales: 0,
          };
        }

        salesByProductMonth[key].totalSales +=
          product.unitPrice * product.quantity;
        salesByProductMonth[key].totalQuantity += product.quantity;
      });
    });

    const sortedEntries = Object.values(salesByProductMonth).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    for (let i = 0; i < sortedEntries.length; i++) {
      const currentEntry = sortedEntries[i];

      let [predict, product] = await Promise.all([
        predictSales(currentEntry.totalQuantity, 6),
        (await productApi.getById(currentEntry.productId)).data,
      ]);

      predict = Math.round(predict ?? 0);
      currentEntry.nextMonthSales = predict;
      currentEntry.currentStock = product ? product.quantity : 0;

      if (currentEntry.currentStock < predict) {
        setAlertModalOpened(true);
      }
    }

    return sortedEntries.sort(
      (a, b) => b.month.localeCompare(a.month) || b.totalSales - a.totalSales
    );
  };

  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      sorter: (a, b) => a.month.localeCompare(b.month),
    },
    {
      title: "Product ID",
      dataIndex: "productSlug",
      key: "productSlug",
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Quantity Sold",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "right",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      align: "right",
    },
    {
      title: "Next Month Sales",
      dataIndex: "nextMonthSales",
      key: "nextMonthSales",
      align: "right",
      sorter: (a, b) => a.nextMonthSales - b.nextMonthSales,
    },
    {
      title: "Total Sales ($)",
      dataIndex: "totalSales",
      key: "totalSales",
      align: "right",
      sorter: (a, b) => a.totalSales - b.totalSales,
      render: (value) =>
        value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      const processedSales = await processOrders(response.data);
      setSalesData(processedSales);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <Header>
        <h3 style={{ color: "white" }}>Future Sales Prediction</h3>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Card title="Monthly Sales Analysis">
          <Table
            columns={columns}
            dataSource={salesData}
            loading={loading}
            scroll={{ x: true }}
            rowClassName={(record) => {
              if (record.currentStock < record.nextMonthSales) {
                return "ant-table-row-danger";
              }
              return "";
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Card>
      </Content>
      <Modal
        title="These stocks running low"
        width={800}
        open={alertModalOpened}
        onCancel={() => setAlertModalOpened(false)}
        footer={null}
      >
        <Table
          columns={columns}
          dataSource={salesData.filter(
            (sale) => sale.currentStock < sale.nextMonthSales
          )}
          pagination={false}
          scroll={{ x: true }}
        />
      </Modal>
    </Layout>
  );
};

export default Predictions;
