/* ========================================
   UPLOAD PAGE JAVASCRIPT
   ======================================== */

const API_BASE_URL = (window.__ENV && window.__ENV.VITE_API_URL) || 'https://ai-doc-backend-31kk.onrender.com/api';
let selectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const username = localStorage.getItem('username');
  if (!username) {
    window.location.href = '/';
    return;
  }

  // Update user display
  document.getElementById('userDisplay').textContent = `Hi, ${username}`;

  // File input listener
  const fileInput = document.getElementById('fileInput');
  const chooseBtn = document.getElementById('chooseBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileNameDisplay = document.getElementById('fileNameDisplay');

  fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];

    if (selectedFile) {
      // Update button text
      const fileName = selectedFile.name;
      chooseBtn.textContent = `Choose File: ${fileName}`;
      fileNameDisplay.textContent = `Selected: ${fileName} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`;

      // Enable upload button
      uploadBtn.disabled = false;
      uploadBtn.style.opacity = '1';
    } else {
      chooseBtn.textContent = 'Choose File: No file chosen';
      fileNameDisplay.textContent = '';
      uploadBtn.disabled = true;
      uploadBtn.style.opacity = '0.5';
    }
  });

  // Upload button listener
  uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show analyzing loader
    const analyzingOverlay = document.getElementById('analyzingOverlay');
    analyzingOverlay.style.display = 'flex';

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', localStorage.getItem('user_id'));

      // Upload file
      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const documentId = uploadData.document_id;

      // Store document ID in session
      localStorage.setItem('document_id', documentId);

      // Process document (extract text, create chunks, generate embeddings)
      const processResponse = await fetch(`${API_BASE_URL}/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ document_id: documentId }),
      });

      if (!processResponse.ok) {
        const error = await processResponse.json();
        throw new Error(error.detail || 'Processing failed');
      }

      // Processing complete, redirect to chat screen
      setTimeout(() => {
        window.location.href = '/chat.html';
      }, 2000);
    } catch (error) {
      console.error('Upload/Process error:', error);
      analyzingOverlay.style.display = 'none';
      alert('Error: ' + error.message);
    }
  });
});
