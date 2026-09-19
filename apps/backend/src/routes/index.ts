import { Router } from 'express'
import { healthRouter } from './health.js'
import { pyqRouter } from './pyq.js'
import { adminRouter } from './admin.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/pyq', pyqRouter)

// Feature routers land here as tickets close:
// apiRouter.use('/auth', authRouter)
// apiRouter.use('/quizzes', quizRouter)
// apiRouter.use('/doubts', doubtRouter)
apiRouter.use('/admin', adminRouter)
