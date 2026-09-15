     const BASE_URL = '/api/flags';

    // Fetch all flags
    export async function getFlags() {
      const res = await fetch(BASE_URL);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      return res.json();
    }


    // Create a new flag
    export async function createFlag(flagData) {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flagData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create flag');
      }
      return res.json();
    }

    // Toggle a flag ON or OFF
    export async function toggleFlag(id) {
      const res = await fetch(`${BASE_URL}/${id}/toggle`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to toggle flag');
      return res.json();
    }

    // Update an existing flag
    export async function updateFlag(id, updateData) {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update flag');
      }
      return res.json();
    }

    // Delete a flag
    export async function deleteFlag(id) {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete flag');
      return res.json();
    }

    // Test / Evaluate a flag for a specific user
    export async function evaluateFlag(key, userId) {
      const url = `${BASE_URL}/evaluate/${encodeURIComponent(key)}?userId=${encodeURIComponent(userId)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to evaluate flag');
      }
      return res.json();
    }
