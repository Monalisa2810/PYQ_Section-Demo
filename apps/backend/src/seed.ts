import mongoose from 'mongoose'
import { env } from './config/env.js'
const logger = console
import { PyqPaper } from './models/PyqPaper.js'
import { Question } from './models/Question.js'

const seedData = [
  {
    chapter: 'Moving Charges and Magnetism',
    text: 'A tightly wound 100 turns coil of radius 10 cm carries a current of 7 A. The magnitude of the magnetic field at the centre of the coil is (Take permeability of free space as 4π×10⁻⁷ SI units):',
    options: ['4.4 mT', '44 T', '44 mT', '4.4 T'],
    correctOptionIndex: 0,
    explanation: 'Magnetic field B = μ₀NI / 2r\n= (4π×10⁻⁷ × 100 × 7) / (2 × 100 × 10⁻²) = 0.0044 T\n= 4.4 mT',
  },
  {
    chapter: 'Magnetism and Matter',
    text: 'Match List-I with List-II.\nList-I (Material)\n(A) Diamagnetic\n(B) Ferromagnetic\n(C) Paramagnetic\n(D) Non-magnetic\n\nList-II (Susceptibility (χ))\n(I) χ = 0\n(II) 0 > χ ≥ -1\n(III) χ >> 1\n(IV) 0 < χ < ε (a small positive number)\n\nChoose the correct answer from the options given below:',
    options: [
      'A-III, B-II, C-I, D-IV',
      'A-IV, B-III, C-II, D-I',
      'A-II, B-III, C-IV, D-I',
      'C-II, B-I, C-III, D-IV',
    ],
    correctOptionIndex: 2,
    explanation: 'Diamagnetic: 0 > χ ≥ -1\nParamagnetic: 0 < χ < ε\nFerromagnetic: χ >> 1\nNon-magnetic: χ = 0',
  },
  {
    chapter: 'Thermodynamics',
    text: 'A thermodynamic system is taken through the cycle abcda. The work done by the gas along the path bc is:',
    options: ['–90 J', '–60 J', 'zero', '30 J'],
    correctOptionIndex: 2,
    explanation: 'As volume is constant along path bc, hence the work done, W = ∫ P dV = 0.',
  },
]

async function runSeed() {
  try {
    await mongoose.connect(env.MONGO_URI)
    logger.info('Connected to MongoDB for seeding...')

    await PyqPaper.deleteMany({ code: 'T3', year: 2024 })
    await Question.deleteMany({ subject: 'physics' })

    const paper = await PyqPaper.create({
      year: 2024,
      title: 'NEET UG 2024',
      code: 'T3',
      subject: 'physics',
    })

    const questionsToInsert = seedData.map((q) => ({
      ...q,
      paperId: paper._id,
      subject: 'physics',
    }))

    await Question.insertMany(questionsToInsert)

    logger.info('Successfully seeded PYQ Data!')
    process.exit(0)
  } catch (error) {
    logger.error({ error }, 'Failed to seed data')
    process.exit(1)
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1].endsWith('seed.ts')) {
  runSeed()
}
