// OmniStudy - Vanilla JS Client communicating with Spring Boot REST API

let chatHistory = [];
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerInterval = null;

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupTimer();
  setupChat();
  setupAudioDictate();
  loadNotes();
  loadTasks();
});

// Navigation tab switcher
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.view-panel').forEach((p) => p.classList.remove('active'));

  const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  const targetView = document.getElementById(`view-${tabId}`);
  if (targetBtn) targetBtn.classList.add('active');
  if (targetView) targetView.classList.add('active');
}

// ----------------- NOTES API -----------------
async function loadNotes() {
  try {
    const res = await fetch('/api/materials');
    if (!res.ok) return;
    const notes = await res.json();
    renderNotes(notes);
    document.getElementById('kpi-notes').innerText = `${notes.length} Notes`;
  } catch (err) {
    console.error('Failed to load notes from Spring Boot:', err);
  }
}

function renderNotes(notes) {
  const container = document.getElementById('notes-list');
  if (!container) return;
  if (notes.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1;">No study notes yet. Click "+ New Note" to create one.</p>';
    return;
  }

  container.innerHTML = notes
    .map(
      (n) => `
    <div class="note-card">
      <div>
        <h4>${escapeHtml(n.title)}</h4>
        <div class="note-sub">${escapeHtml(n.subject)} • ${escapeHtml(n.topic || '')}</div>
        <p class="note-content">${escapeHtml(n.content)}</p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="deleteNote(${n.id})">Delete</button>
      </div>
    </div>
  `
    )
    .join('');
}

async function deleteNote(id) {
  await fetch(`/api/materials/${id}`, { method: 'DELETE' });
  loadNotes();
}

document.getElementById('open-note-modal')?.addEventListener('click', () => {
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = 'Create Study Note';
  modalBody.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.75rem;">
      <input id="note-title-in" placeholder="Note Title" style="padding:0.5rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:4px;" />
      <input id="note-subj-in" placeholder="Subject (e.g. Computer Science)" style="padding:0.5rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:4px;" />
      <textarea id="note-content-in" rows="5" placeholder="Content & formulas..." style="padding:0.5rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:4px;"></textarea>
      <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitNote()">Save</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
});

async function submitNote() {
  const title = document.getElementById('note-title-in').value;
  const subject = document.getElementById('note-subj-in').value;
  const content = document.getElementById('note-content-in').value;
  if (!title || !subject) return;

  await fetch('/api/materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, subject, topic: subject, content, tags: 'Study' }),
  });

  closeModal();
  loadNotes();
}

// ----------------- TASKS API -----------------
async function loadTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) return;
    const tasks = await res.json();
    renderTasks(tasks);

    const completed = tasks.filter((t) => t.status === 'completed').length;
    document.getElementById('kpi-tasks').innerText = `${completed} / ${tasks.length}`;
  } catch (err) {
    console.error('Failed to load tasks from Spring Boot:', err);
  }
}

function renderTasks(tasks) {
  const container = document.getElementById('tasks-list');
  if (!container) return;
  if (tasks.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;">No tasks yet. Click "+ Add Task" to schedule one.</p>';
    return;
  }

  container.innerHTML = tasks
    .map(
      (t) => `
    <div class="task-item ${t.status === 'completed' ? 'completed' : ''}">
      <div>
        <strong>${escapeHtml(t.title)}</strong>
        <div style="font-size:0.75rem;color:#94a3b8;">${escapeHtml(t.subject)} • Due: ${t.dueDate || 'Today'}</div>
      </div>
      <div style="display:flex;gap:0.5rem;">
        <button class="btn btn-secondary" onclick="toggleTask(${t.id}, '${t.status}')">
          ${t.status === 'completed' ? 'Undo' : 'Complete'}
        </button>
        <button class="btn btn-secondary" onclick="deleteTaskItem(${t.id})">Delete</button>
      </div>
    </div>
  `
    )
    .join('');
}

async function toggleTask(id, currentStatus) {
  const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: nextStatus }),
  });
  loadTasks();
}

async function deleteTaskItem(id) {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

document.getElementById('open-task-modal')?.addEventListener('click', () => {
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = 'Create Study Task';
  modalBody.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.75rem;">
      <input id="task-title-in" placeholder="Task Title" style="padding:0.5rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:4px;" />
      <input id="task-subj-in" placeholder="Subject" style="padding:0.5rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:4px;" />
      <input id="task-due-in" type="date" style="padding:0.5rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:4px;" />
      <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitTask()">Save Task</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
});

async function submitTask() {
  const title = document.getElementById('task-title-in').value;
  const subject = document.getElementById('task-subj-in').value;
  const dueDate = document.getElementById('task-due-in').value;
  if (!title) return;

  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      subject: subject || 'General',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
    }),
  });

  closeModal();
  loadTasks();
}

function closeModal() {
  document.getElementById('modal-container')?.classList.add('hidden');
}

// ----------------- FOCUS TIMER -----------------
function setupTimer() {
  const clock = document.getElementById('timer-clock');
  const startBtn = document.getElementById('timer-start-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  const presets = document.querySelectorAll('.btn-preset');

  function updateClockDisplay() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    clock.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  startBtn?.addEventListener('click', () => {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      startBtn.innerText = 'Start';
    } else {
      timerRunning = true;
      startBtn.innerText = 'Pause';
      timerInterval = setInterval(() => {
        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          timerRunning = false;
          startBtn.innerText = 'Start';
          alert('Focus Session Completed! Great job!');
          return;
        }
        timerSeconds--;
        updateClockDisplay();
      }, 1000);
    }
  });

  resetBtn?.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning = false;
    startBtn.innerText = 'Start';
    timerSeconds = 25 * 60;
    updateClockDisplay();
  });

  presets.forEach((btn) => {
    btn.addEventListener('click', () => {
      presets.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      clearInterval(timerInterval);
      timerRunning = false;
      startBtn.innerText = 'Start';
      timerSeconds = parseInt(btn.getAttribute('data-time'), 10) * 60;
      updateClockDisplay();
    });
  });
}

// ----------------- GEMINI CHAT -----------------
function setupChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const thread = document.getElementById('chat-thread');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    input.value = '';
    appendMessage('user', userText);

    chatHistory.push({ role: 'user', content: userText });

    const loadingElem = appendMessage('model', 'StudySprint is reasoning...');

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          systemInstruction: 'You are an elite academic tutor. Answer clearly with markdown and equations.',
          model: 'gemini-3.5-flash',
        }),
      });

      const data = await res.json();
      loadingElem.innerText = data.reply || 'No response generated.';
      chatHistory.push({ role: 'model', content: data.reply });
    } catch (err) {
      loadingElem.innerText = 'Error calling Spring Boot Gemini API: ' + err.message;
    }
  });

  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.innerText = text;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
    return msg;
  }
}

// ----------------- AUDIO RECORDING & TRANSCRIBE -----------------
function setupAudioDictate() {
  const btn = document.getElementById('dictate-btn');
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  btn?.addEventListener('click', async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.start();
        isRecording = true;
        btn.innerText = '⏹️ Stop Recording';
        btn.style.backgroundColor = '#ef4444';
      } catch (err) {
        alert('Microphone access denied: ' + err.message);
      }
    } else {
      mediaRecorder.stop();
      isRecording = false;
      btn.innerText = '⏳ Transcribing...';

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          try {
            const res = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            const transcript = data.transcript || '';
            btn.innerText = '🎙️ Dictate';
            btn.style.backgroundColor = '';

            // Put transcript in chat or alert
            switchTab('ai-tutor');
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.value = transcript;
          } catch (err) {
            alert('Transcription error: ' + err.message);
            btn.innerText = '🎙️ Dictate';
            btn.style.backgroundColor = '';
          }
        };
        reader.readAsDataURL(audioBlob);
      };
    }
  });
  document.getElementById('search-back-btn')?.addEventListener('click', () => {
    switchTab('dashboard');
  });

  document.getElementById('search-clear-btn')?.addEventListener('click', () => {
    const input = document.getElementById('header-search-in');
    if (input) input.value = '';
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
