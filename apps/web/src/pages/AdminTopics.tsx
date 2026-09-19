import { useState } from 'react'
import { Alert, App, Button, Card, Form, Input, Select, Space, Tag, Typography } from 'antd'
import {
  BookOutlined,
  CheckOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  RobotOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { jsPDF } from 'jspdf'
import { approveTopic, generateTopicDescription, saveTopicDraft, type TopicDescription, type TopicDraft } from '../lib/api'

GlobalWorkerOptions.workerSrc = pdfWorker

const { Title, Text } = Typography

const initialDescription: TopicDescription = { shortDescription: '', longDescription: '', keyPoints: [] }
const MAX_SOURCE_NOTES_LENGTH = 20_000
const currentDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())

export default function AdminTopics() {
  const { message } = App.useApp()
  const [form] = Form.useForm<TopicDraft>()
  const [description, setDescription] = useState(initialDescription)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [loading, setLoading] = useState<'generate' | 'save' | 'approve' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)

  async function handlePdfUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setLoading('pdf')
    setError(null)
    try {
      const pdf = await getDocument({ data: await file.arrayBuffer() }).promise
      const pages: string[] = []
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber)
        const content = await page.getTextContent()
        pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '))
      }
      const normalizedNotes = pages.join('\n\n').replace(/\s+/g, ' ').trim()
      if (normalizedNotes.length < 20) throw new Error('This PDF does not contain enough selectable text.')
      const wasTruncated = normalizedNotes.length > MAX_SOURCE_NOTES_LENGTH
      const extractedNotes = wasTruncated
        ? normalizedNotes.slice(0, MAX_SOURCE_NOTES_LENGTH).replace(/\s+\S*$/, '')
        : normalizedNotes
      form.setFieldValue('rawNotes', extractedNotes)
      setPdfName(file.name)
      if (wasTruncated) {
        message.warning('This PDF was shortened to the first 20,000 characters. Review the notes before generating.')
      } else {
        message.success('PDF notes imported. Review them before generating.')
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not read this PDF.')
    } finally {
      setLoading(null)
    }
  }

  async function handleGenerate() {
    try {
      const values = await form.validateFields(['subject', 'chapter', 'topic', 'rawNotes'])
      setLoading('generate')
      setError(null)
      setDescription(await generateTopicDescription(values))
      message.success('Draft generated. Review it before saving.')
    } catch (requestError) {
      if ((requestError as { errorFields?: unknown }).errorFields) return
      const responseMessage = (requestError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
      setError(responseMessage ?? 'Generation failed. Check the notes and try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleSave() {
    try {
      const values = await form.validateFields()
      if (!description.shortDescription || !description.longDescription || !description.keyPoints.length) {
        setError('Generate or enter all description fields before saving.')
        return
      }
      setLoading('save')
      const saved = await saveTopicDraft({ ...values, ...description })
      setSavedId(saved._id)
      message.success('Saved as a draft. It is not approved yet.')
    } catch (requestError) {
      if ((requestError as { errorFields?: unknown }).errorFields) return
      setError('Could not save the draft.')
    } finally {
      setLoading(null)
    }
  }

  async function handleApprove() {
    if (!savedId) return
    setLoading('approve')
    try {
      await approveTopic(savedId)
      message.success('Topic approved for publication.')
    } catch {
      setError('Could not approve the topic.')
    } finally {
      setLoading(null)
    }
  }

  function handleDownload() {
    if (!description.shortDescription || !description.longDescription || !description.keyPoints.length) {
      setError('Generate or complete the descriptions before downloading.')
      return
    }

    const values = form.getFieldsValue()
    const document = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = document.internal.pageSize.getWidth()
    const margin = 18
    const contentWidth = pageWidth - margin * 2
    let currentY = 22

    document.setTextColor(7, 83, 75)
    document.setFont('helvetica', 'bold')
    document.setFontSize(20)
    document.text(values.topic || 'NEET Topic Description', margin, currentY)
    currentY += 9
    document.setTextColor(93, 119, 123)
    document.setFont('helvetica', 'normal')
    document.setFontSize(10)
    document.text(`${values.subject || 'NEET'}  |  ${values.chapter || 'Study notes'}`, margin, currentY)
    currentY += 14

    const addSection = (heading: string, content: string) => {
      document.setTextColor(7, 83, 75)
      document.setFont('helvetica', 'bold')
      document.setFontSize(12)
      document.text(heading, margin, currentY)
      currentY += 7
      document.setTextColor(48, 73, 79)
      document.setFont('helvetica', 'normal')
      document.setFontSize(10)
      const lines = document.splitTextToSize(content, contentWidth)
      document.text(lines, margin, currentY)
      currentY += lines.length * 5 + 9
    }

    addSection('Short description', description.shortDescription)
    addSection('Long description', description.longDescription)
    addSection('Key points', description.keyPoints.map((point) => `- ${point}`).join('\n'))
    document.save(`${(values.topic || 'neet-topic').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`)
    message.success('Description downloaded as PDF.')
  }

  return (
    <div className="admin-studio">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark"><RobotOutlined /></div>
          <div><strong>SUSHRUTA</strong><span>Admin Panel</span></div>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-label">Workspace</div>
          <a className="admin-nav-item active" href="#source"><BookOutlined /> Topic studio</a>
          <a className="admin-nav-item" href="#descriptions"><FileTextOutlined /> Descriptions</a>
          <a className="admin-nav-item" href="#assistant"><RobotOutlined /> AI assistant</a>
        </nav>
        <div className="admin-sidebar-footer">NEET Community<br /><span>Content operations</span></div>
        <div className="sidebar-leaves" aria-hidden="true">
          <span className="leaf leaf-one" />
          <span className="leaf leaf-two" />
          <span className="leaf leaf-three" />
          <span className="leaf leaf-four" />
          <span className="leaf leaf-five" />
        </div>
      </aside>

      <main className="admin-main">
        <div className="page-leaves page-leaves-left" aria-hidden="true">
          <span className="page-leaf page-leaf-a" />
          <span className="page-leaf page-leaf-b" />
          <span className="page-leaf page-leaf-c" />
        </div>
        <div className="page-leaves page-leaves-right" aria-hidden="true">
          <span className="page-leaf page-leaf-a" />
          <span className="page-leaf page-leaf-b" />
          <span className="page-leaf page-leaf-c" />
        </div>
        <header className="admin-topbar">
          <div className="admin-search"><span>⌕</span> Search users, topics, chapters...</div>
          <div className="admin-profile"><span className="admin-status-dot" /> Admin workspace <div className="admin-avatar">A</div></div>
        </header>
        <div className="admin-content">
          <div className="admin-page-heading">
            <div><Tag className="admin-eyebrow">CONTENT STUDIO</Tag><Title level={2}>Topic descriptions</Title><Text>Generate, review, and approve clear study content for NEET students.</Text></div>
            <div className="admin-heading-meta"><span>Today</span><strong>{currentDate}</strong></div>
          </div>
          {error && <Alert className="admin-alert" type="error" showIcon message={error} closable onClose={() => setError(null)} />}
          <Form form={form} layout="vertical" initialValues={{ subject: 'Biology' }}>
            <div className="admin-metric-row">
              <div className="admin-metric"><span className="metric-icon mint"><BookOutlined /></span><div><small>Content area</small><strong>Topic descriptions</strong></div></div>
              <div className="admin-metric"><span className="metric-icon blue"><FileTextOutlined /></span><div><small>Draft status</small><strong>{savedId ? 'Ready for approval' : 'Unapproved draft'}</strong></div></div>
              <div className="admin-metric"><span className="metric-icon lilac"><RobotOutlined /></span><div><small>AI assistant</small><strong>Grounded generation</strong></div></div>
            </div>
            <div className="admin-work-grid">
              <Card className="admin-panel source-panel" title={<span><span className="panel-kicker">01</span> Source context</span>} extra={<Tag className="draft-tag">{savedId ? 'Draft saved' : 'In progress'}</Tag>}>
                <div className="admin-form-grid">
                  <Form.Item name="subject" label="Subject" rules={[{ required: true }]}><Select options={['Biology', 'Physics', 'Chemistry'].map((value) => ({ label: value, value }))} /></Form.Item>
                  <Form.Item name="chapter" label="Chapter" rules={[{ required: true }]}><Input placeholder="Human Physiology" /></Form.Item>
                  <Form.Item name="topic" label="Topic" rules={[{ required: true }]}><Input placeholder="Mechanism of inspiration" /></Form.Item>
                </div>
                <Form.Item name="rawNotes" label="Raw academic notes" rules={[{ required: true, min: 20 }]}><Input.TextArea rows={7} placeholder="Paste the source notes used to ground this draft..." /></Form.Item>
                <div className="pdf-upload-row"><label className="pdf-upload-button"><FilePdfOutlined /> {loading === 'pdf' ? 'Reading PDF...' : 'Upload notes as PDF'}<input type="file" accept="application/pdf,.pdf" onChange={handlePdfUpload} disabled={loading === 'pdf'} /></label>{pdfName && <span className="pdf-name">{pdfName}</span>}</div>
                <div className="panel-actions"><Text type="secondary">Use source notes as the academic authority.</Text><Button className="mint-button" type="primary" icon={<RobotOutlined />} loading={loading === 'generate'} onClick={() => void handleGenerate()}>Generate description</Button></div>
              </Card>
              <Card className="admin-panel insight-panel" title={<span><span className="panel-kicker">02</span> Studio guidance</span>}>
                <div className="guidance-illustration"><RobotOutlined /></div>
                <Title level={4}>Make every concept easier to remember.</Title>
                <Text type="secondary">The generated draft stays grounded in your notes. Review the science, then approve it for the student content library.</Text>
                <div className="guidance-list"><span><CheckOutlined /> Short answer for quick revision</span><span><CheckOutlined /> Long explanation for understanding</span><span><CheckOutlined /> Key points for recall</span></div>
              </Card>
            </div>
            <Card className="admin-panel review-panel" title={<span><span className="panel-kicker">03</span> Review and edit</span>} extra={<Tag className={savedId ? 'approved-tag' : 'draft-tag'}>{savedId ? 'Draft saved' : 'Unapproved draft'}</Tag>}>
              <div className="description-grid">
                <Form.Item label="Short description"><Input.TextArea rows={5} value={description.shortDescription} onChange={(event) => setDescription({ ...description, shortDescription: event.target.value })} placeholder="A concise explanation for quick revision..." /></Form.Item>
                <Form.Item label="Long description"><Input.TextArea rows={5} value={description.longDescription} onChange={(event) => setDescription({ ...description, longDescription: event.target.value })} placeholder="A complete explanation with the reasoning and context..." /></Form.Item>
              </div>
              <Form.Item label="Key points" help="One point per line"><Input.TextArea rows={4} value={description.keyPoints.join('\n')} onChange={(event) => setDescription({ ...description, keyPoints: event.target.value.split('\n').map((point) => point.trim()).filter(Boolean) })} placeholder="Important facts students should remember..." /></Form.Item>
              <div className="panel-actions review-actions"><Text type="secondary">Changes remain editable until approval.</Text><Space><Button icon={<DownloadOutlined />} onClick={handleDownload}>Download PDF</Button><Button icon={<SaveOutlined />} loading={loading === 'save'} onClick={() => void handleSave()}>Save as draft</Button><Button className="mint-button" type="primary" icon={<CheckOutlined />} disabled={!savedId} loading={loading === 'approve'} onClick={() => void handleApprove()}>Approve topic</Button></Space></div>
            </Card>
          </Form>
        </div>
      </main>
    </div>
  )
}