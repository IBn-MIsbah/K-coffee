import "dotenv/config";

const email = process.env.LOGIN_TEST_EMAIL;
const password = process.env.LOGIN_TEST_PASSWORD;
const baseUrl =
  process.env.LOGIN_TEST_BASE_URL ??
  process.env.BETTER_AUTH_URL ??
  "http://localhost:3000";

if (!email || !password) {
  throw new Error(
    "Set LOGIN_TEST_EMAIL and LOGIN_TEST_PASSWORD before running this login smoke test."
  );
}

async function run() {
  const endpoint = new URL("/api/auth/sign-in/email", baseUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: new URL(baseUrl).origin,
    },
    body: JSON.stringify({
      email,
      password,
      callbackURL: "/dashboard",
    }),
    redirect: "manual",
  });

  const responseText = await response.text();
  let payload: unknown = null;

  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    // A non-JSON response is included in the actionable failure below.
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : responseText || response.statusText;
    throw new Error(`Login failed (${response.status}): ${message}`);
  }

  if (!response.headers.get("set-cookie")) {
    throw new Error("Login succeeded but did not issue a session cookie.");
  }

  console.log(`Login smoke test passed for ${email}. Session cookie issued.`);
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
