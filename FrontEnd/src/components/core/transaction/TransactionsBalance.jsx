import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';

const TransactionsBalance = ({ balance }) => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('transaction.totalIncome'),
      value: balance.totalIncome,
      color: '#3f8600',
      prefix: <ArrowUpOutlined />
    },
    {
      title: t('transaction.totalExpense'),
      value: balance.totalExpense,
      color: '#cf1322',
      prefix: <ArrowDownOutlined />
    },
    {
      title: t('transaction.totalBalance'),
      value: balance.totalBalance,
      color: balance.totalBalance > 0 ? '#3f8600' : '#cf1322',
      prefix: balance.totalBalance > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
    }
  ];

  return (
    <Row gutter={15} style={{ marginBottom: 16 }}>
      {stats.map(stat => (
        <Col key={stat.title} xs={24} sm={12} md={8}>
          <Card variant="borderless">
            <Statistic
              title={stat.title}
              value={stat.value}
              precision={2}
              valueStyle={{ color: stat.color }}
              prefix={stat.prefix}
              suffix="€"
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};
export default TransactionsBalance;
