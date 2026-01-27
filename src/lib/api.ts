const API_BASE = "http://localhost:8000/api";

/* -------------------- helper -------------------- */
async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

/* -------------------- API calls -------------------- */

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse(res);
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse(res);
}

export async function startLive() {
  const res = await fetch(`${API_BASE}/live/start`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse(res);
}
