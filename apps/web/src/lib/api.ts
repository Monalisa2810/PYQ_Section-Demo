import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 120_000,
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export type TopicDescription = {
  shortDescription: string
  longDescription: string
  keyPoints: string[]
}

export type TopicDraft = TopicDescription & {
  subject: string
  chapter: string
  topic: string
  rawNotes: string
}

export async function generateTopicDescription(input: Omit<TopicDraft, keyof TopicDescription>) {
  const response = await api.post<{ data: TopicDescription }>('/admin/topics/generate-description', input)
  return response.data.data
}

export async function saveTopicDraft(draft: TopicDraft) {
  const response = await api.post<{ data: { _id: string } }>('/admin/topics', draft)
  return response.data.data
}

export async function approveTopic(id: string) {
  const response = await api.patch(`/admin/topics/${id}/approve`)
  return response.data.data
}

export type PyqPaper = {
  _id: string
  year: number
  title: string
  code: string
  subject: string
}

export type PyqQuestion = {
  _id: string
  paperId: string
  subject: string
  chapter: string
  text: string
  options: string[]
  correctOptionIndex: number
  explanation: string
}

export async function getPyqPapers() {
  const response = await api.get<{ data: { papers: PyqPaper[] } }>('/pyq/papers')
  return response.data.data.papers
}

export async function getPyqPaperQuestions(id: string) {
  const response = await api.get<{ data: { paper: PyqPaper, questions: PyqQuestion[] } }>(`/pyq/papers/${id}/questions`)
  return response.data.data
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // TODO: on 401, attempt /auth/refresh, retry once, else redirect to /login.
    return Promise.reject(err)
  },
)
