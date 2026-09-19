import { useState } from 'react'
import { Card, Tabs, Segmented, Typography, Button, message, List } from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined, 
  RightOutlined,
  BulbOutlined 
} from '@ant-design/icons'
import AppLayout from '../components/AppLayout'
import { mockPyqYears, mockPyqChapters, PyqYearData } from '../lib/mockPyqData'

const { Title, Text } = Typography

export default function PyqSection() {
  const [subject, setSubject] = useState('physics')
  const [mode, setMode] = useState<'year' | 'chapter'>('year')
  const [selectedYear, setSelectedYear] = useState<number>(2024)

  const handleStartSolving = () => {
    message.info('The solving flow is currently under development.')
  }

  const activeYearData = mockPyqYears.find((y) => y.year === selectedYear) || mockPyqYears[0]
  const otherYears = mockPyqYears.filter((y) => y.year !== selectedYear)

  return (
    <AppLayout title="PYQ Section">
      <div className="mx-auto max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <Tabs
          activeKey={subject}
          onChange={setSubject}
          centered
          items={[
            { key: 'physics', label: 'Physics' },
            { key: 'chemistry', label: 'Chemistry' },
            { key: 'biology', label: 'Biology' },
          ]}
        />

        <div className="mt-4 flex justify-center">
          <Segmented
            options={[
              { label: 'Year-wise', value: 'year' },
              { label: 'Chapter-wise', value: 'chapter' },
            ]}
            value={mode}
            onChange={(val: string | number) => setMode(val as 'year' | 'chapter')}
            className="w-full max-w-sm"
            block
          />
        </div>

        {mode === 'year' ? (
          <div className="mt-8">
            <Text strong className="mb-3 block text-gray-700">Select Year</Text>
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
              {mockPyqYears.map((y) => (
                <Button
                  key={y.year}
                  type={selectedYear === y.year ? 'primary' : 'default'}
                  onClick={() => setSelectedYear(y.year)}
                  className={`min-w-[80px] rounded-lg ${
                    selectedYear === y.year ? 'bg-emerald-600 hover:bg-emerald-500' : ''
                  }`}
                >
                  {y.year}
                </Button>
              ))}
            </div>

            <Card className="mt-4 bg-emerald-50 border-emerald-100 rounded-xl">
              {/* I will use flex instead of Row/Col to be simpler and closer to design */}
              <div className="flex justify-between items-center text-emerald-800 text-sm sm:text-base">
                <div className="flex flex-col items-center">
                  <FileTextOutlined className="text-xl mb-1 text-emerald-600" />
                  <span className="font-semibold">{activeYearData.questionCount}</span>
                  <span className="text-xs">Questions</span>
                </div>
                <div className="w-px h-10 bg-emerald-200"></div>
                <div className="flex flex-col items-center">
                  <ClockCircleOutlined className="text-xl mb-1 text-blue-500" />
                  <span className="font-semibold">{activeYearData.suggestedTime}</span>
                  <span className="text-xs">Suggested Time</span>
                </div>
                <div className="w-px h-10 bg-emerald-200"></div>
                <div className="flex flex-col items-center">
                  <TrophyOutlined className="text-xl mb-1 text-orange-500" />
                  <span className="font-semibold text-center leading-tight">Real Exam<br/>Pattern</span>
                </div>
              </div>

              <Button 
                type="primary" 
                block 
                size="large" 
                className="mt-6 bg-emerald-600 hover:bg-emerald-500 h-12 text-lg rounded-xl font-medium shadow-md shadow-emerald-200"
                onClick={handleStartSolving}
              >
                Start Solving
              </Button>
            </Card>

            <div className="mt-8">
              <Title level={5} className="!mb-4 text-gray-800">Other Years</Title>
              <List
                dataSource={otherYears}
                renderItem={(item: PyqYearData) => (
                  <List.Item className="border border-slate-100 rounded-xl mb-3 px-4 py-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm" onClick={() => setSelectedYear(item.year)}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                          <FileTextOutlined className="text-lg" />
                        </div>
                        <div>
                          <Text strong className="block text-gray-800">NEET {item.year}</Text>
                          <Text type="secondary" className="text-xs">{item.questionCount} Questions</Text>
                        </div>
                      </div>
                      <RightOutlined className="text-gray-400" />
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <Text strong className="mb-3 block text-gray-700">Select Chapter</Text>
            <List
              dataSource={mockPyqChapters}
              renderItem={(chapter: string) => (
                <List.Item className="border border-slate-100 rounded-xl mb-3 px-4 py-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm" onClick={handleStartSolving}>
                  <div className="flex items-center justify-between w-full">
                    <Text strong className="text-gray-800">{chapter}</Text>
                    <RightOutlined className="text-gray-400" />
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <BulbOutlined className="text-blue-500 text-xl mt-0.5" />
          <Text className="text-blue-800 text-sm">
            Tip: Solve PYQs regularly to understand the exam pattern and important topics.
          </Text>
        </div>
      </div>
    </AppLayout>
  )
}
