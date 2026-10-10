/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle } from './firebase';
import {
  StudyMaterial,
  PdfDocument,
  StudyTask,
  StudyPlan,
  StudySession,
  UserStats,
  ChatMessage,
  ViewTab,
  SyllabusDocument,
  StudentCurriculumProgress,
} from './types';
import {
  subscribeMaterials,
  saveMaterial,
  deleteMaterial,
  subscribePdfs,
  savePdf,
  deletePdf,
  subscribeTasks,
  saveTask,
  updateTaskStatus,
  deleteTask,
  subscribeStudyPlans,
  saveStudyPlan,
  subscribeStudySessions,
  recordStudySession,
  subscribeUserStats,
  subscribeChatMessages,
  saveChatMessage,
  subscribeSyllabi,
  saveSyllabus,
  deleteSyllabus,
  subscribeCurriculumProgress,
  saveCurriculumProgress,
  generateId,
} from './services/studyService';
import {
  getSampleMaterials,
  getSamplePdfs,
  getSampleTasks,
  getSamplePlan,
  getSampleStats,
} from './utils/initialData';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SyllabusExplainerView } from './components/SyllabusExplainerView';
import { StudyMaterialsView } from './components/StudyMaterialsView';
import { PdfLibraryView } from './components/PdfLibraryView';
import { SmartPlanView } from './components/SmartPlanView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { TaskManagementView } from './components/TaskManagementView';
import { StudyTimerView } from './components/StudyTimerView';
import { GeminiChatView } from './components/GeminiChatView';
import { ProgressStreakView } from './components/ProgressStreakView';
import { AudioTranscribeModal } from './components/AudioTranscribeModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // State
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [syllabi, setSyllabi] = useState<SyllabusDocument[]>([]);
  const [curriculumProgress, setCurriculumProgress] = useState<StudentCurriculumProgress | null>(null);

  // Modals & timer pass-through
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [timerInitialConfig, setTimerInitialConfig] = useState<{
    subject: string;
    topic: string;
    durationMinutes: number;
  }>({
    subject: 'General Study',
    topic: 'Focus Block',
    durationMinutes: 25,
  });

  const activeUserId = currentUser ? currentUser.uid : 'guest_student';

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Attach Firestore Listeners or load local/starter data
  useEffect(() => {
    if (currentUser) {
      // User is logged in: listen to their private Firestore data
      const unsubMat = subscribeMaterials(currentUser.uid, (data) => {
        if (data.length === 0) {
          // If fresh account, seed starter materials into Firestore
          const sampleMats = getSampleMaterials(currentUser.uid);
          sampleMats.forEach((m) => saveMaterial(m));
        } else {
          setMaterials(data);
        }
      });

      const unsubPdf = subscribePdfs(currentUser.uid, (data) => {
        if (data.length === 0) {
          const samplePdfs = getSamplePdfs(currentUser.uid);
          samplePdfs.forEach((p) => savePdf(p));
        } else {
          setPdfs(data);
        }
      });

      const unsubTasks = subscribeTasks(currentUser.uid, (data) => {
        if (data.length === 0) {
          const sampleTasks = getSampleTasks(currentUser.uid);
          sampleTasks.forEach((t) => saveTask(t));
        } else {
          setTasks(data);
        }
      });

      const unsubPlans = subscribeStudyPlans(currentUser.uid, (data) => {
        if (data.length === 0) {
          const samplePlan = getSamplePlan(currentUser.uid);
          saveStudyPlan(samplePlan);
        } else {
          setStudyPlans(data);
        }
      });

      const unsubSessions = subscribeStudySessions(currentUser.uid, (data) => {
        setSessions(data);
      });

      const unsubStats = subscribeUserStats(currentUser.uid, (data) => {
        setStats(data || getSampleStats(currentUser.uid));
      });

      const unsubChat = subscribeChatMessages(currentUser.uid, (data) => {
        setChatMessages(data);
      });

      const unsubSyllabi = subscribeSyllabi(currentUser.uid, (data) => {
        setSyllabi(data);
      });

      return () => {
        unsubMat();
        unsubPdf();
        unsubTasks();
        unsubPlans();
        unsubSessions();
        unsubStats();
        unsubChat();
        unsubSyllabi();
      };
    } else {
      // Unauthenticated / Preview Mode: initialize rich sample state
      setMaterials(getSampleMaterials(activeUserId));
      setPdfs(getSamplePdfs(activeUserId));
      setTasks(getSampleTasks(activeUserId));
      setStudyPlans([getSamplePlan(activeUserId)]);
      setStats(getSampleStats(activeUserId));
      setSyllabi([]);
    }
  }, [currentUser]);

  // Handlers
  const handleSaveMaterial = (item: StudyMaterial) => {
    if (currentUser) {
      saveMaterial(item);
    } else {
      setMaterials((prev) => {
        const idx = prev.findIndex((m) => m.id === item.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = item;
          return copy;
        }
        return [item, ...prev];
      });
    }
  };

  const handleDeleteMaterial = (id: string) => {
    if (currentUser) {
      deleteMaterial(id);
    } else {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleSavePdf = (pdf: PdfDocument) => {
    if (currentUser) {
      savePdf(pdf);
    } else {
      setPdfs((prev) => [pdf, ...prev]);
    }
  };

  const handleDeletePdf = (id: string) => {
    if (currentUser) {
      deletePdf(id);
    } else {
      setPdfs((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSaveTask = (task: StudyTask) => {
    if (currentUser) {
      saveTask(task);
    } else {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === task.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = task;
          return copy;
        }
        return [task, ...prev];
      });
    }
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    if (currentUser) {
      updateTaskStatus(taskId, nextStatus);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
    }
  };

  const handleDeleteTask = (id: string) => {
    if (currentUser) {
      deleteTask(id);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSaveStudyPlan = (plan: StudyPlan) => {
    if (currentUser) {
      saveStudyPlan(plan);
    } else {
      setStudyPlans([plan]);
    }
  };

  const handleSaveSyllabus = (item: SyllabusDocument) => {
    if (currentUser) {
      saveSyllabus(item);
    } else {
      setSyllabi((prev) => {
        const idx = prev.findIndex((s) => s.id === item.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = item;
          return copy;
        }
        return [item, ...prev];
      });
    }
  };

  const handleDeleteSyllabus = (id: string) => {
    if (currentUser) {
      deleteSyllabus(id);
    } else {
      setSyllabi((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveCurriculumProgress = (progress: StudentCurriculumProgress) => {
    if (currentUser) {
      saveCurriculumProgress(progress);
    } else {
      setCurriculumProgress(progress);
    }
  };

  const handleSaveTasksBatch = (newTasks: StudyTask[]) => {
    if (currentUser) {
      newTasks.forEach((t) => saveTask(t));
    } else {
      setTasks((prev) => [...newTasks, ...prev]);
    }
  };

  const handleSessionCompleted = async (session: StudySession) => {
    if (currentUser) {
      const updated = await recordStudySession(session, stats);
      setStats(updated);
    } else {
      setSessions((prev) => [session, ...prev]);
      setStats((prev) => ({
        userId: activeUserId,
        currentStreak: (prev?.currentStreak || 1) + 1,
        longestStreak: Math.max((prev?.longestStreak || 1), (prev?.currentStreak || 1) + 1),
        lastStudyDate: new Date().toISOString().split('T')[0],
        totalStudyMinutes: (prev?.totalStudyMinutes || 0) + session.durationMinutes,
        completedTasksCount: prev?.completedTasksCount || 0,
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const handleSendChatMessage = (msg: ChatMessage) => {
    if (currentUser) {
      saveChatMessage(msg);
    } else {
      setChatMessages((prev) => [...prev, msg]);
    }
  };

  const handleStartSessionWithTopic = (
    subject: string,
    topic: string,
    durationMinutes = 25
  ) => {
    setTimerInitialConfig({ subject, topic, durationMinutes });
    setCurrentTab('timer');
  };

  // Convert audio transcription into note / task / chat
  const handleUseTranscriptAsNote = (text: string) => {
    const newNote: StudyMaterial = {
      id: generateId('mat_voice'),
      userId: activeUserId,
      title: 'Voice Note: ' + text.slice(0, 35) + '...',
      subject: 'Lecture Audio',
      topic: 'Voice Dictation',
      content: text,
      tags: ['Voice Note', 'Transcribed'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleSaveMaterial(newNote);
    setCurrentTab('materials');
  };

  const handleUseTranscriptAsTask = (text: string) => {
    const newTask: StudyTask = {
      id: generateId('task_voice'),
      userId: activeUserId,
      title: text.slice(0, 80),
      subject: 'Study Goals',
      topic: 'Dictated Action',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleSaveTask(newTask);
    setCurrentTab('tasks');
  };

  const handleUseTranscriptInChat = (text: string) => {
    const userMsg: ChatMessage = {
      id: generateId('chat_usr'),
      userId: activeUserId,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    handleSendChatMessage(userMsg);
    setCurrentTab('chat');
  };

  const activePlan = studyPlans.find((p) => p.status === 'active') || studyPlans[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stats={stats}
        currentUser={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMic={() => setIsMicModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            materials={materials}
            pdfs={pdfs}
            tasks={tasks}
            activePlan={activePlan}
            stats={stats}
            onNavigate={setCurrentTab}
            onToggleTask={handleToggleTaskStatus}
            onStartSessionWithTopic={handleStartSessionWithTopic}
            onOpenNewNoteModal={() => setCurrentTab('materials')}
            onOpenMic={() => setIsMicModalOpen(true)}
          />
        )}

        {currentTab === 'syllabus' && (
          <SyllabusExplainerView
            userId={activeUserId}
            syllabi={syllabi}
            onSaveSyllabus={handleSaveSyllabus}
            onDeleteSyllabus={handleDeleteSyllabus}
            curriculumProgress={curriculumProgress}
            onSaveProgress={handleSaveCurriculumProgress}
            onSavePlan={handleSaveStudyPlan}
            onSaveTasksBatch={handleSaveTasksBatch}
            onNavigateToPlanner={() => setCurrentTab('planner')}
          />
        )}

        {currentTab === 'materials' && (
          <StudyMaterialsView
            materials={materials}
            onSaveMaterial={handleSaveMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            userId={activeUserId}
          />
        )}

        {currentTab === 'pdfs' && (
          <PdfLibraryView
            pdfs={pdfs}
            onSavePdf={handleSavePdf}
            onDeletePdf={handleDeletePdf}
            userId={activeUserId}
          />
        )}

        {currentTab === 'smart-plan' && (
          <SmartPlanView
            currentPlan={activePlan}
            onSavePlan={handleSaveStudyPlan}
            userId={activeUserId}
            onStartSessionWithTopic={handleStartSessionWithTopic}
            onNavigateToSyllabus={() => setCurrentTab('syllabus')}
          />
        )}

        {currentTab === 'planner' && (
          <StudyPlannerView
            activePlan={activePlan}
            onUpdatePlan={handleSaveStudyPlan}
            onStartSessionWithTopic={handleStartSessionWithTopic}
            onNavigateToSmartPlan={() => setCurrentTab('smart-plan')}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskManagementView
            tasks={tasks}
            onSaveTask={handleSaveTask}
            onUpdateStatus={(id, status) => {
              if (currentUser) updateTaskStatus(id, status);
              else setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
            }}
            onDeleteTask={handleDeleteTask}
            userId={activeUserId}
          />
        )}

        {currentTab === 'timer' && (
          <StudyTimerView
            initialSubject={timerInitialConfig.subject}
            initialTopic={timerInitialConfig.topic}
            initialDurationMinutes={timerInitialConfig.durationMinutes}
            onSessionCompleted={handleSessionCompleted}
            stats={stats}
            userId={activeUserId}
          />
        )}

        {currentTab === 'chat' && (
          <GeminiChatView
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            userId={activeUserId}
            onOpenMicForChat={() => setIsMicModalOpen(true)}
          />
        )}
      </main>

      {/* Global Audio Transcription Modal */}
      <AudioTranscribeModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        onUseAsNote={handleUseTranscriptAsNote}
        onUseAsTask={handleUseTranscriptAsTask}
        onAskChat={handleUseTranscriptInChat}
      />

      {/* Global Quick Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        materials={materials}
        pdfs={pdfs}
        tasks={tasks}
        activePlan={activePlan}
        syllabi={syllabi}
        onNavigateToTab={setCurrentTab}
        onOpenMic={() => setIsMicModalOpen(true)}
      />
    </div>
  );
}
