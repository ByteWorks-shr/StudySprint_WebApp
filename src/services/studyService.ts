import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  StudyMaterial,
  PdfDocument,
  StudyTask,
  StudyPlan,
  StudySession,
  UserStats,
  ChatMessage,
  SyllabusDocument,
  StudentCurriculumProgress,
} from '../types';

// Helper to generate IDs
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ----------------- MATERIALS -----------------
export function subscribeMaterials(
  userId: string,
  onData: (materials: StudyMaterial[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'materials');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: StudyMaterial[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'materials');
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function saveMaterial(material: StudyMaterial): Promise<void> {
  const path = `materials/${material.id}`;
  try {
    await setDoc(doc(db, 'materials', material.id), material);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const path = `materials/${materialId}`;
  try {
    await deleteDoc(doc(db, 'materials', materialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- PDFS -----------------
export function subscribePdfs(
  userId: string,
  onData: (pdfs: PdfDocument[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'pdfs');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: PdfDocument[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'pdfs');
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function savePdf(pdf: PdfDocument): Promise<void> {
  const path = `pdfs/${pdf.id}`;
  try {
    await setDoc(doc(db, 'pdfs', pdf.id), pdf);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePdf(pdfId: string): Promise<void> {
  const path = `pdfs/${pdfId}`;
  try {
    await deleteDoc(doc(db, 'pdfs', pdfId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- TASKS -----------------
export function subscribeTasks(
  userId: string,
  onData: (tasks: StudyTask[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'tasks');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: StudyTask[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort pending first, then by dueDate
      items.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function saveTask(task: StudyTask): Promise<void> {
  const path = `tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'tasks', task.id), task);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed',
  completedAt?: string | null
): Promise<void> {
  const path = `tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      status,
      completedAt: completedAt !== undefined ? completedAt : (status === 'completed' ? new Date().toISOString() : null),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const path = `tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- STUDY PLANS -----------------
export function subscribeStudyPlans(
  userId: string,
  onData: (plans: StudyPlan[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'studyPlans');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: StudyPlan[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'studyPlans');
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function saveStudyPlan(plan: StudyPlan): Promise<void> {
  const path = `studyPlans/${plan.id}`;
  try {
    await setDoc(doc(db, 'studyPlans', plan.id), plan);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudyPlan(planId: string): Promise<void> {
  const path = `studyPlans/${planId}`;
  try {
    await deleteDoc(doc(db, 'studyPlans', planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- SESSIONS & STATS / STREAK -----------------
export function subscribeStudySessions(
  userId: string,
  onData: (sessions: StudySession[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'studySessions');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: StudySession[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'studySessions');
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function recordStudySession(
  session: StudySession,
  currentStats?: UserStats | null
): Promise<UserStats> {
  const sessionPath = `studySessions/${session.id}`;
  try {
    await setDoc(doc(db, 'studySessions', session.id), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, sessionPath);
  }

  // Calculate Streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = currentStats?.currentStreak || 0;
  let longest = currentStats?.longestStreak || 0;
  const lastDate = currentStats?.lastStudyDate;

  if (lastDate === today) {
    // Already studied today, maintain streak
  } else if (lastDate === yesterday) {
    // Consecutive day!
    streak += 1;
  } else {
    // Missed a day or first time
    streak = 1;
  }

  if (streak > longest) {
    longest = streak;
  }

  const newTotalMinutes = (currentStats?.totalStudyMinutes || 0) + session.durationMinutes;

  const updatedStats: UserStats = {
    userId: session.userId,
    currentStreak: streak,
    longestStreak: longest,
    lastStudyDate: today,
    totalStudyMinutes: newTotalMinutes,
    completedTasksCount: currentStats?.completedTasksCount || 0,
    updatedAt: new Date().toISOString(),
  };

  const statPath = `userStats/${session.userId}`;
  try {
    await setDoc(doc(db, 'userStats', session.userId), updatedStats);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, statPath);
  }

  return updatedStats;
}

export function subscribeUserStats(
  userId: string,
  onData: (stats: UserStats | null) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, 'userStats', userId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserStats);
      } else {
        onData({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
          totalStudyMinutes: 0,
          completedTasksCount: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `userStats/${userId}`);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

// ----------------- CHAT MESSAGES -----------------
export function subscribeChatMessages(
  userId: string,
  onData: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'chatMessages');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Chronological order for chat thread
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'chatMessages');
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  const path = `chatMessages/${msg.id}`;
  try {
    await setDoc(doc(db, 'chatMessages', msg.id), msg);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------- SYLLABI & CURRICULUM -----------------
export function subscribeSyllabi(
  userId: string,
  onData: (syllabi: SyllabusDocument[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'syllabi');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SyllabusDocument[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      items.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'syllabi');
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function saveSyllabus(syllabus: SyllabusDocument): Promise<void> {
  const path = `syllabi/${syllabus.id}`;
  try {
    await setDoc(doc(db, 'syllabi', syllabus.id), syllabus);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSyllabus(syllabusId: string): Promise<void> {
  const path = `syllabi/${syllabusId}`;
  try {
    await deleteDoc(doc(db, 'syllabi', syllabusId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- CURRICULUM PROGRESS -----------------
export function subscribeCurriculumProgress(
  userId: string,
  syllabusId: string,
  onData: (progress: StudentCurriculumProgress | null) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, 'curriculumProgress', `prog_${syllabusId}`);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData({ id: docSnap.id, ...(docSnap.data() as any) });
      } else {
        onData(null);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `curriculumProgress/prog_${syllabusId}`);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

export async function saveCurriculumProgress(progress: StudentCurriculumProgress): Promise<void> {
  const path = `curriculumProgress/${progress.id}`;
  try {
    await setDoc(doc(db, 'curriculumProgress', progress.id), progress);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

