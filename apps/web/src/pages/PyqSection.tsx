import { useState, useEffect } from 'react'
import { Card, Tabs, Segmented, Typography, Button, message, List, Spin } from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined, 
  RightOutlined,
  BulbOutlined 
} from '@ant-design/icons'
import AppLayout from '../components/AppLayout'
import { mockPyqChapters, mockPyqYears } from '../lib/mockPyqData'
import { getPyqPapers, PyqPaper } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export default function PyqSection() {
  const [subject, setSubject] = useState('physics')
  const [mode, setMode] = useState<'year' | 'chapter'>('year')
  const [papers, setPapers] = useState<PyqPaper[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadPapers() {
      try {
        const fetchedPapers = await getPyqPapers()
        if (fetchedPapers.length > 0) {
          setPapers(fetchedPapers)
          setSelectedYear(fetchedPapers[0].year)
        } else {
          throw new Error('No papers from API')
        }
      } catch (err) {
        console.warn('API failed or returned empty. Falling back to mock data.')
        const fallbackPapers: PyqPaper[] = mockPyqYears.map(y => ({
          _id: y.id,
          year: y.year,
          title: `NEET ${y.year}`,
          code: 'T3',
          subject: 'physics'
        }))
        setPapers(fallbackPapers)
        setSelectedYear(fallbackPapers[0].year)
      } finally {
        setLoading(false)
      }
    }
    loadPapers()
  }, [])

  const handleStartSolving = () => {
    if (activePaper) {
      navigate(`/pyq/solve/${activePaper._id}`)
    } else {
      message.info('The solving flow is currently under development.')
    }
  }

  const activePaper = papers.find((p) => p.year === selectedYear)
  const otherPapers = papers.filter((p) => p.year !== selectedYear)

  if (loading) {
    return (
      <AppLayout title="PYQ Section">
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      </AppLayout>
    )
  }

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
            {papers.length === 0 ? (
              <Text type="secondary">No PYQ papers available yet.</Text>
            ) : (
              <>
                <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                  {papers.map((p) => (
                    <Button
                      key={p._id}
                      type={selectedYear === p.year ? 'primary' : 'default'}
                      onClick={() => setSelectedYear(p.year)}
                      className={`min-w-[80px] rounded-lg ${
                        selectedYear === p.year ? 'bg-emerald-600 hover:bg-emerald-500' : ''
                      }`}
                    >
                      {p.year}
                    </Button>
                  ))}
                </div>

                {activePaper && (
                  <Card className="mt-4 bg-emerald-50 border-emerald-100 rounded-xl">
                    <div className="flex justify-between items-center text-emerald-800 text-sm sm:text-base">
                      <div className="flex flex-col items-center">
                        <FileTextOutlined className="text-xl mb-1 text-emerald-600" />
                        <span className="font-semibold">Full Test</span>
                        <span className="text-xs">Questions</span>
                      </div>
                      <div className="w-px h-10 bg-emerald-200"></div>
                      <div className="flex flex-col items-center">
                        <ClockCircleOutlined className="text-xl mb-1 text-blue-500" />
                        <span className="font-semibold">3 Hours</span>
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
                )}

                {otherPapers.length > 0 && (
                  <div className="mt-8">
                    <Title level={5} className="!mb-4 text-gray-800">Other Years</Title>
                    <List
                      dataSource={otherPapers}
                      renderItem={(item) => (
                        <List.Item className="border border-slate-100 rounded-xl mb-3 px-4 py-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm" onClick={() => setSelectedYear(item.year)}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                <FileTextOutlined className="text-lg" />
                              </div>
                              <div>
                                <Text strong className="block text-gray-800">{item.title}</Text>
                                <Text type="secondary" className="text-xs">NEET {item.year}</Text>
                              </div>
                            </div>
                            <RightOutlined className="text-gray-400" />
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <Text strong className="mb-3 block text-gray-700">Select Chapter</Text>
            <List
              dataSource={mockPyqChapters}
              renderItem={(chapter: string) => (
                <List.Item className="border border-slate-100 rounded-xl mb-3 px-4 py-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm" onClick={() => message.info('Chapter flow under development.')}>
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
