import React from "react";
import { Layout, Table, Card, Modal } from "antd";

const { Header, Content } = Layout;

const Predictions = () => {
  return (
    <Layout>
      <Header>
      <h3 style={{ color: "white" }}>Future Sales Prediction</h3>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Card title="Monthly Sales Analysis">
          <Table
            columns={[]} // Placeholder for table columns
            dataSource={[]} // Placeholder for table data
            scroll={{ x: true }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Card>
      </Content>
      <Modal
        title="These stocks running low"
        width={800}
        open={false} // Placeholder for modal state
        footer={null}
      >
        <Table columns={[]} dataSource={[]} />
      </Modal>
    </Layout>
  );
};

export default Predictions;
