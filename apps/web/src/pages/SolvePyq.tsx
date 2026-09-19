import { useState, useEffect } from 'react'
import mockQuestionsData from '../lib/neet_2024_physics.json'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Radio, Space, Spin, message, Progress, Divider, Statistic, Row, Col } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import AppLayout from '../components/AppLayout'
import { getPyqPaperQuestions, PyqPaper, PyqQuestion } from '../lib/api'

const { Title, Text, Paragraph } = Typography

export default function SolvePyq() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [paper, setPaper] = useState<PyqPaper | null>(null)
  const [questions, setQuestions] = useState<PyqQuestion[]>([])
  const [loading, setLoading] = useState(true)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Results State
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)

  useEffect(() => {
    async function loadTest() {
      try {
        if (!id) return
        const data = await getPyqPaperQuestions(id)
        if (data.questions.length === 0) throw new Error('No questions found in API')
        setPaper(data.paper)
        setQuestions(data.questions)
      } catch (err) {
        console.warn('API failed or empty, falling back to local JSON data')
        if (id === '2024') {
          setPaper({
            _id: '2024',
            year: 2024,
            title: 'NEET 2024',
            code: 'T3',
            subject: 'physics'
          })
          const mockWithIds = mockQuestionsData.map((q, idx) => ({
            ...q,
            _id: `mock_q_${idx}`,
            paperId: '2024'
          }))
          setQuestions(mockWithIds as unknown as PyqQuestion[])
        } else {
          message.error('Demo data only available for 2024.')
          navigate('/pyq')
        }
      } finally {
        setLoading(false)
      }
    }
    loadTest()
  }, [id, navigate])

  const handleOptionChange = (qId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = () => {
    let currentScore = 0
    let correct = 0
    let incorrect = 0

    questions.forEach(q => {
      const userAnswer = answers[q._id]
      if (userAnswer !== undefined) {
        if (userAnswer === q.correctOptionIndex) {
          currentScore += 4
          correct += 1
        } else {
          currentScore -= 1
          incorrect += 1
        }
      }
    })

    setScore(currentScore)
    setCorrectCount(correct)
    setIncorrectCount(incorrect)
    
    setSubmitted(true)
    setShowResults(true)
    message.success('Test submitted successfully!')
    window.scrollTo(0, 0)
  }

  if (loading) {
    return (
      <AppLayout title="Solving PYQ">
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      </AppLayout>
    )
  }

  if (!paper || questions.length === 0) {
    return (
      <AppLayout title="Error">
        <div className="p-6 text-center">
          <Text type="secondary">Paper not found or has no questions.</Text>
        </div>
      </AppLayout>
    )
  }

  const currentQ = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progressPercent = Math.round((answeredCount / questions.length) * 100)
  const unansweredCount = questions.length - correctCount - incorrectCount

  return (
    <AppLayout title={paper.title}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/pyq')}>
            Back to PYQ Section
          </Button>
          {!showResults && (
            <Text className="text-gray-500 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </Text>
          )}
        </div>

        {/* Results Summary View */}
        {showResults ? (
          <div className="space-y-6">
            <Card className="shadow-sm rounded-xl border-slate-200 text-center py-6">
              <Title level={2} className="!mb-2 !mt-0 text-emerald-700">
                Test Completed
              </Title>
              <Text className="text-gray-500 block mb-8">Here is how you performed on {paper.title}</Text>
              
              <Row gutter={[24, 24]} className="mb-6">
                <Col xs={12} sm={6}>
                  <Statistic title="Total Score" value={score} suffix={`/ ${questions.length * 4}`} valueStyle={{ color: '#059669', fontWeight: 600 }} />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic title="Correct" value={correctCount} valueStyle={{ color: '#059669' }} />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic title="Incorrect" value={incorrectCount} valueStyle={{ color: '#dc2626' }} />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic title="Unanswered" value={unansweredCount} valueStyle={{ color: '#6b7280' }} />
                </Col>
              </Row>

              <Divider />
              
              <div className="flex gap-4 justify-center mt-6">
                <Button size="large" onClick={() => navigate('/pyq')}>
                  Back to Papers
                </Button>
                <Button type="primary" size="large" onClick={() => setShowResults(false)} className="bg-emerald-600">
                  Review Answers
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* Question Solving / Review View */
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
              <Progress percent={progressPercent} status="active" strokeColor="#059669" className="flex-1 m-0" />
              <Text className="text-sm font-semibold text-emerald-700 whitespace-nowrap">{answeredCount} Answered</Text>
            </div>

            <Card className="shadow-sm rounded-xl border-slate-200">
              <div className="mb-2">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                  {currentQ.subject}
                </span>
                {currentQ.chapter && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                    {currentQ.chapter}
                  </span>
                )}
              </div>
              
              <Title level={5} className="!mt-4 !mb-6 leading-relaxed text-gray-800">
                {currentQ.text}
              </Title>

              <Radio.Group 
                onChange={(e) => handleOptionChange(currentQ._id, e.target.value)} 
                value={answers[currentQ._id]}
                className="w-full"
                disabled={submitted}
              >
                <Space direction="vertical" className="w-full" size="middle">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = answers[currentQ._id] === idx
                    const isCorrect = submitted && idx === currentQ.correctOptionIndex
                    const isWrongSelected = submitted && isSelected && idx !== currentQ.correctOptionIndex

                    let bgClass = 'hover:bg-slate-50'
                    let borderClass = 'border-slate-200'
                    let textClass = 'text-gray-700'
                    
                    if (submitted) {
                      bgClass = ''
                      if (isCorrect) {
                        bgClass = 'bg-emerald-50'
                        borderClass = 'border-emerald-500'
                        textClass = 'text-emerald-700 font-medium'
                      } else if (isWrongSelected) {
                        bgClass = 'bg-red-50'
                        borderClass = 'border-red-400'
                        textClass = 'text-red-700 font-medium'
                      } else if (isSelected) {
                        // Shouldn't hit this if the logic above is correct, but just in case
                        borderClass = 'border-gray-300'
                      }
                    } else if (isSelected) {
                      bgClass = 'bg-emerald-50'
                      borderClass = 'border-emerald-500'
                      textClass = 'text-emerald-700 font-medium'
                    }

                    return (
                      <Radio 
                        key={idx} 
                        value={idx}
                        className={`w-full p-4 rounded-lg border transition-all m-0 ${bgClass} ${borderClass}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Text className={`text-base ${textClass}`}>
                            {opt}
                          </Text>
                          {submitted && isCorrect && <CheckCircleOutlined className="text-emerald-500 text-lg ml-2" />}
                          {submitted && isWrongSelected && <CloseCircleOutlined className="text-red-500 text-lg ml-2" />}
                        </div>
                      </Radio>
                    )
                  })}
                </Space>
              </Radio.Group>

              {/* Show Explanation if submitted */}
              {submitted && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <Text strong className="text-blue-800 mb-2 block">Explanation:</Text>
                  <Paragraph className="text-blue-900 mb-0">
                    {currentQ.explanation || "No explanation available for this question."}
                  </Paragraph>
                </div>
              )}
            </Card>

            <div className="flex justify-between mt-6">
              <Button 
                size="large" 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="rounded-lg font-medium min-w-[100px]"
              >
                Previous
              </Button>

              {submitted ? (
                <div className="flex gap-3">
                  {currentIndex === questions.length - 1 ? (
                    <Button 
                      type="primary" 
                      size="large" 
                      onClick={() => setShowResults(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium min-w-[120px]"
                    >
                      View Results
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      size="large" 
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-500 rounded-lg font-medium min-w-[100px]"
                    >
                      Next
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {currentIndex === questions.length - 1 ? (
                    <Button 
                      type="primary" 
                      size="large" 
                      onClick={handleSubmit}
                      className="bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium min-w-[120px]"
                    >
                      Submit Test
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      size="large" 
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-500 rounded-lg font-medium min-w-[100px]"
                    >
                      Next
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
