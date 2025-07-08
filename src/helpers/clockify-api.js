export async function createTimeEntry({
  apiKey,
  workspaceId,
  projectId,   // optional
  description,
  startTime,   // ISO string
  endTime,      // ISO string,
  billable
}) {
  if (!apiKey) throw new Error('Clockify API key is missing.');
  if (!workspaceId) throw new Error('Clockify workspace ID is missing.');

  const url = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/time-entries`;

  const payload = {
    start: startTime,
    end: endTime,
    description: description,
    billable: billable
  };

  if (projectId) {
    payload.projectId = projectId;
  }

  console.log('[Clockify] Payload:', payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Clockify] API error:', error);
    throw new Error(`Clockify API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  console.log('[Clockify] Time entry created:', data);
  return data;
}