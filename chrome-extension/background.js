// Draw the extension icon using OffscreenCanvas
async function drawIcon() {
  try {
    const size = 128;
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Red gradient background
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#c0392b');
    grad.addColorStop(1, '#e05252');
    ctx.fillStyle = grad;

    // Rounded rect (manual, no roundRect needed)
    const r = 28;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.arcTo(size, 0, size, r, r);
    ctx.lineTo(size, size - r);
    ctx.arcTo(size, size, size - r, size, r);
    ctx.lineTo(r, size);
    ctx.arcTo(0, size, 0, size - r, r);
    ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath();
    ctx.fill();

    // > arrow
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(30, 44);
    ctx.lineTo(60, 64);
    ctx.lineTo(30, 84);
    ctx.stroke();

    // _ bar
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(70, 84);
    ctx.lineTo(100, 84);
    ctx.stroke();

    const imageData = ctx.getImageData(0, 0, size, size);
    await chrome.action.setIcon({ imageData });
  } catch (e) {
    // OffscreenCanvas not available — use default
  }
}

drawIcon();

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'IMPROVE_PROMPT') {
    handleImprove(message)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true; // keep channel open for async response
  }
});

async function handleImprove({ prompt, apiUrl, apiKey }) {
  if (!apiUrl) {
    throw new Error('API URL not set. Click the Prompt Labs extension icon to configure it.');
  }
  if (!apiKey) {
    throw new Error('API key not set. Click the Prompt Labs extension icon to configure it.');
  }

  const base = apiUrl.replace(/\/$/, '');
  const url = `${base}/api/improve-prompt`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Key': apiKey,
      },
      body: JSON.stringify({ prompt, rounds: 2 }),
    });
  } catch (e) {
    throw new Error(`Cannot reach the Prompt Labs API. Check your API URL in the extension settings.`);
  }

  if (!response.ok) {
    let msg = `API error ${response.status}`;
    try {
      const j = await response.json();
      msg = j.error || msg;
    } catch {}
    throw new Error(msg);
  }

  // Read the full SSE stream — waits until server closes the connection
  const body = await response.text();

  // Parse SSE events — server sends { type: "complete", data: { finalPrompt, ... } }
  let finalPrompt = '';
  let errorMsg = '';
  for (const line of body.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    try {
      const evt = JSON.parse(line.slice(6));
      if (evt.type === 'complete' && evt.data?.finalPrompt) {
        finalPrompt = evt.data.finalPrompt;
      }
      if (evt.type === 'error' && evt.message) {
        errorMsg = evt.message;
      }
    } catch {}
  }

  if (!finalPrompt) {
    throw new Error(errorMsg || 'No improved prompt returned. Please try again.');
  }

  return { result: finalPrompt };
}
