export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

export async function requestOrMock<T>(path: string, mockFactory: () => T | Promise<T>, delayMs = 350): Promise<T> {
  if (USE_MOCKS || !API_BASE_URL) {
    await wait(delayMs);
    return mockFactory();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "bypass-tunnel-reminder": "true",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function postOrMock<T>(
  path: string,
  body: unknown,
  mockFactory: () => T | Promise<T>,
  delayMs = 350,
): Promise<T> {
  if (USE_MOCKS || !API_BASE_URL) {
    await wait(delayMs);
    return mockFactory();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
