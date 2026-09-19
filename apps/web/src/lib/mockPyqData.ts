export interface PyqYearData {
  id: string
  year: number
  questionCount: number
  suggestedTime: string
  isRealExamPattern: boolean
}

export const mockPyqYears: PyqYearData[] = [
  { id: '2024', year: 2024, questionCount: 180, suggestedTime: '3 Hours', isRealExamPattern: true },
  { id: '2023', year: 2023, questionCount: 180, suggestedTime: '3 Hours', isRealExamPattern: true },
  { id: '2022', year: 2022, questionCount: 180, suggestedTime: '3 Hours', isRealExamPattern: true },
  { id: '2021', year: 2021, questionCount: 180, suggestedTime: '3 Hours', isRealExamPattern: true },
  { id: '2020', year: 2020, questionCount: 180, suggestedTime: '3 Hours', isRealExamPattern: true },
  { id: '2019', year: 2019, questionCount: 180, suggestedTime: '3 Hours', isRealExamPattern: true },
]

export const mockPyqChapters = [
  'Kinematics',
  'Laws of Motion',
  'Work, Energy and Power',
  'Rotational Motion',
  'Gravitation',
]
