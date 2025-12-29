/* ========================================
   CHAT PAGE JAVASCRIPT
   ======================================== */

const API_BASE_URL = 'http://localhost:8000/api';
let documentId = null;
let chunks = [];
let chatHistory = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const username = localStorage.getItem('username');
  if (!username) {
    window.location.href = '/';
    return;
  }

  // Update user display
  document.getElementById('userDisplay').textContent = `Hi, ${username}`;

  // Get document ID from storage
  documentId = localStorage.getItem('document_id');
  if (!documentId) {
    // No document uploaded, redirect to home
    window.location.href = '/home.html';
    return;
  }

  // Load chunks on page load
  await loadChunks();

  // Chat input listeners
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');

  chatInput.addEventListener('input', () => {
    // Enable send button if there's text
    chatSendBtn.disabled = chatInput.value.trim().length === 0;
  });

  chatInput.addEventListener('keydown', (e) => {
    // Send on Enter (not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatSendBtn.addEventListener('click', sendMessage);

  // Update document badge
  updateDocumentBadge();
});

async function loadChunks() {
  try {
    const token = localStorage.getItem('token');
    console.log(`Loading chunks for document: ${documentId}`);
    
    const response = await fetch(`${API_BASE_URL}/chunks/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log(`Chunks response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Failed to load chunks: ${response.statusText}`);
      throw new Error(`Failed to load chunks: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Received chunks data:`, data);
    
    chunks = data.chunks || [];
    console.log(`Loaded ${chunks.length} chunks`);

    // Render chunks
    renderChunks();
  } catch (error) {
    console.error('Error loading chunks:', error);
    // Show error in UI
    const chunksList = document.getElementById('chunksList');
    chunksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p>Error loading chunks: ${error.message}</p>
      </div>
    `;
  }
}

function renderChunks() {
  const chunksList = document.getElementById('chunksList');

  if (!chunks || chunks.length === 0) {
    chunksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📑</div>
        <p>No chunks available</p>
      </div>
    `;
    return;
  }

  chunksList.innerHTML = chunks
    .map((chunk, index) => {
      const preview = chunk.text.substring(0, 100) + '...';
      return `
        <div class="chunk-card" onclick="selectChunk(${index})">
          <div class="chunk-number">Chunk ${index + 1}</div>
          <div>${preview}</div>
        </div>
      `;
    })
    .join('');
}

function selectChunk(index) {
  // Remove previous selection
  document.querySelectorAll('.chunk-card').forEach(card => {
    card.classList.remove('active');
  });

  // Add active class to selected chunk
  document.querySelectorAll('.chunk-card')[index].classList.add('active');
}

async function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessageToChat(message, 'user');
  chatInput.value = '';
  chatInput.focus();

  // Disable send button
  const chatSendBtn = document.getElementById('chatSendBtn');
  chatSendBtn.disabled = true;

  try {
    // Send message to backend for processing
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        document_id: documentId,
        question: message,
        user_id: localStorage.getItem('user_id'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get response');
    }

    const data = await response.json();
    const aiResponse = data.answer;

    // Add AI response to chat
    addMessageToChat(aiResponse, 'ai');

    // Save to chat history
    chatHistory.push({
      user: message,
      ai: aiResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
  } finally {
    // Re-enable send button
    chatSendBtn.disabled = false;
  }
}

function addMessageToChat(text, sender) {
  const chatHistory = document.getElementById('chatHistory');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message-bubble';
  bubbleDiv.textContent = text;

  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  messageDiv.appendChild(bubbleDiv);
  messageDiv.appendChild(timeDiv);
  chatHistory.appendChild(messageDiv);

  // Scroll to bottom
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function updateDocumentBadge() {
  const badge = document.getElementById('documentBadge');
  if (documentId) {
    badge.textContent = `📄 Document Loaded (${chunks.length} chunks)`;
    badge.style.background = '#d4edda';
    badge.style.color = '#155724';
  }
}

function showReuploadModal() {
  document.getElementById('reuploadModal').style.display = 'flex';
}

function closeReuploadModal() {
  document.getElementById('reuploadModal').style.display = 'none';
}

function goToUpload() {
  // Clear document from storage
  localStorage.removeItem('document_id');
  window.location.href = '/home.html';
}
