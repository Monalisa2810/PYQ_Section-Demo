import { Layout, Menu, Typography, Space, Tag } from 'antd'
import {
  DashboardOutlined,
  ExperimentOutlined,
  ReadOutlined,
  TrophyOutlined,
  RobotOutlined,
  BellOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout
const { Title } = Typography

export default function AppLayout({ children, title = 'Welcome back' }: { children: React.ReactNode, title?: string }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine selected key based on current path
  const selectedKey = location.pathname.substring(1) || 'dashboard'

  return (
    <Layout className="min-h-screen">
      <Sider theme="light" width={220} className="border-r border-slate-200">
        <div className="flex h-16 items-center justify-center border-b border-slate-200 font-semibold text-lg cursor-pointer" onClick={() => navigate('/')}>
          NEET Community
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }: { key: string }) => navigate(`/${key}`)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: 'quizzes', icon: <ExperimentOutlined />, label: 'Quizzes' },
            { key: 'tests', icon: <ReadOutlined />, label: 'Tests' },
            { key: 'pyq', icon: <HistoryOutlined />, label: 'PYQ Section' },
            { key: 'leaderboard', icon: <TrophyOutlined />, label: 'Leaderboard' },
            { key: 'ai-doubt', icon: <RobotOutlined />, label: 'AI Doubt' },
            { key: 'admin/topics', icon: <RobotOutlined />, label: 'Admin topics' },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between bg-white px-6 shadow-sm">
          <Title level={4} className="!mb-0">
            {title}
          </Title>
          <Space>
            <BellOutlined className="text-xl" />
            <Tag color="blue">Student</Tag>
          </Space>
        </Header>
        <Content className="p-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
