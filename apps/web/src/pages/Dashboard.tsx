import { Card, Statistic, Row, Col, Progress, Typography, Space } from 'antd'
import AppLayout from '../components/AppLayout'
const { Text } = Typography

export default function Dashboard() {
  return (
    <AppLayout title="Welcome back">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Current streak" value={0} suffix="days" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="AI doubts left today" value={5} suffix="/ 5" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Preparation score" value={0} suffix="/ 100" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Rank (this week)" value="—" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={16}>
          <Card title="Today's Quiz">
            <Text type="secondary">Placeholder — the daily quiz card lands here (NEET-18).</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Weak topics">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Kinematics</Text>
                <Progress percent={40} size="small" />
              </div>
              <div>
                <Text>Genetics</Text>
                <Progress percent={55} size="small" />
              </div>
              <div>
                <Text>Thermodynamics</Text>
                <Progress percent={62} size="small" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </AppLayout>
  )
}
