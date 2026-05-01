// Handle messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'IMPROVE_PROMPT') {
    handleImprove(message)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true; // keep channel open for async response
  }
});

async function handleImprove({ prompt, apiUrl, apiKey, rounds }) {
  if (!apiUrl) {
    throw new Error('API URL not set. Click the Prompt Labs icon to configure it.');
  }
  if (!apiKey) {
    throw new Error('API key not set. Click the Prompt Labs icon to configure it.');
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
      body: JSON.stringify({ prompt, rounds: rounds || 2 }),
    });
  } catch (e) {
    throw new Error('Cannot reach the Prompt Labs API. Check your API URL in settings.');
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
