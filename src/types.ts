export interface StudyMaterial {
  id: string;
  userId: string;
  title: string;
  subject: string;
  topic: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PdfDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  extractedText: string;
  topics: string[];
  subject: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  userId: string;
  title: string;
  subject: string;
  topic: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  estimatedMinutes?: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanSession {
  dayNumber: number;
  dateOffsetDays: number;
  subject: string;
  topic: string;
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high';
  objectives?: string[];
  studyTechnique?: string;
  completed?: boolean;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  examDate: string;
  dailyStudyHours: number;
  subjects: string[];
  schedule: StudyPlanSession[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  summary?: string;
  strategyTips?: string[];
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  sessionDate: string; // YYYY-MM-DD
  completedAt: string;
  notes?: string;
  createdAt: string;
}

export interface UserStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalStudyMinutes: number;
  completedTasksCount: number;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'model';
  text: string;
  persona?: 'mentor' | 'summarizer' | 'quizmaster' | 'planner' | 'solver';
  modelUsed?: string;
  createdAt: string;
}

export type ViewTab =
  | 'dashboard'
  | 'syllabus'
  | 'materials'
  | 'pdfs'
  | 'smart-plan'
  | 'planner'
  | 'tasks'
  | 'timer'
  | 'chat';

// ----------------- SYLLABUS & CURRICULUM EXPLAINER MODELS -----------------

export interface TopicPracticeQuestion {
  question: string;
  type: '2-mark' | '4-mark' | '6-mark' | 'mcq' | 'conceptual';
  hint?: string;
  expectedAnswerPoints?: string[];
}

export interface TopicKeyTerm {
  term: string;
  definition: string;
  simpleMeaning: string;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  simpleExplanationEn: string;
  simpleExplanationHi?: string;
  keyTerms?: TopicKeyTerm[];
  realWorldExample?: string;
  prerequisites?: string[];
  practiceQuestions?: TopicPracticeQuestion[];
  importanceLevel?: 'high' | 'medium' | 'foundational';
  status?: 'not_started' | 'in_progress' | 'completed';
}

export interface SyllabusUnit {
  id: string;
  unitNumber: number | string;
  title: string;
  overview: string;
  overviewHi?: string;
  estimatedHours?: number | string;
  topics: SyllabusTopic[];
  revisionChecklist?: string[];
  commonPitfalls?: string[];
}

export interface SyllabusSubject {
  id: string;
  name: string;
  code?: string;
  type: 'theory' | 'practical' | 'both';
  credits?: number | string;
  teachingHours?: string;
  overview: string;
  overviewHi?: string;
  importance: string;
  whatYouWillLearn: string[];
  prerequisites: string[];
  suggestedSequence: string[];
  commonPitfalls?: string[];
  revisionChecklist?: string[];
  units: SyllabusUnit[];
}

export interface SyllabusPractical {
  id: string;
  subjectName: string;
  experimentNumber: number | string;
  title: string;
  objective: string;
  prerequisites: string[];
  requiredTools?: string[];
  preparationChecklist: string[];
  isCompulsory: boolean;
  completed?: boolean;
  recordSubmitted?: boolean;
}

export interface TermWorkItem {
  id: string;
  title: string;
  subjectName: string;
  description: string;
  submissionRequirements: string;
  marks?: string;
  defaultDeadline?: string;
  customDeadline?: string;
  completed?: boolean;
}

export interface MicroProjectIdea {
  title: string;
  description: string;
  techStack?: string;
  realWorldRelevance?: string;
}

export interface MicroProjectInfo {
  id: string;
  subjectName: string;
  officialRequirements: string;
  evaluationCriteria?: string;
  stages: {
    stageName: string;
    description: string;
    deliverables: string;
    completed?: boolean;
  }[];
  suggestedIdeas?: MicroProjectIdea[];
  selectedTopic?: string;
  targetDeadline?: string;
  status?: 'topic_selection' | 'planning' | 'implementation' | 'testing' | 'documentation' | 'completed';
}

export interface CourseOutcome {
  code: string;
  description: string;
  mappedUnits?: string;
}

export interface EvaluationCriteria {
  internalAssessment?: string;
  externalExam?: string;
  marksDistribution?: string;
  passingCriteria?: string;
}

export interface CurriculumAnalysis {
  course: string;
  branch: string;
  semester: string;
  academicYear: string;
  university: string;
  overview: string;
  subjects: SyllabusSubject[];
  practicals: SyllabusPractical[];
  termWork: TermWorkItem[];
  microProjects: MicroProjectInfo[];
  courseOutcomes?: CourseOutcome[];
  evaluationCriteria?: EvaluationCriteria;
  recommendedPreparationStrategy?: string[];
}

export interface SyllabusDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  university?: string;
  course?: string;
  branch?: string;
  semester?: string;
  academicYear?: string;
  extractedText: string;
  analysis: CurriculumAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCurriculumProgress {
  id: string;
  userId: string;
  syllabusId: string;
  completedTopicIds: string[];
  inProgressTopicIds: string[];
  completedPracticalIds: string[];
  recordSubmittedPracticalIds: string[];
  completedTermWorkIds: string[];
  customTermWorkDeadlines?: Record<string, string>;
  microProjectStagesCompleted?: Record<string, string[]>;
  updatedAt: string;
}

