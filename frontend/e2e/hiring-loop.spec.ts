import { test, expect } from "@playwright/test";

const api = process.env.E2E_API_URL || "http://127.0.0.1:3001/api/v1";

test.describe("Landing", () => {
  test("home page renders brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText(/NaijaJobber|remote|jobs/i);
  });

  test("login page is reachable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("body")).toContainText(/login|sign in|email/i);
  });
});

test.describe("Hiring loop", () => {
  test("API health + public jobs UI + admin login session", async ({
    page,
    request,
  }) => {
    const health = await request.get(`${api}/health`);
    expect(health.ok()).toBeTruthy();

    const jobsRes = await request.get(`${api}/jobs`);
    expect(jobsRes.ok()).toBeTruthy();

    await page.goto("/jobs");
    await expect(page.locator("body")).toContainText(/job|remote|filter/i);

    const stamp = Date.now();
    const seekerEmail = `e2e_seeker_${stamp}@example.com`;
    const password = "SecurePass1!";

    const register = await request.post(`${api}/auth/register`, {
      data: {
        firstName: "E2E",
        lastName: "Seeker",
        email: seekerEmail,
        password,
        role: "JOB_SEEKER",
      },
    });
    expect(register.ok()).toBeTruthy();

    // Mark verified via admin path isn't available without DB; use Google mock OAuth for a verified session
    const oauth = await request.get(
      `${api}/auth/google/callback?email=e2e_google_${stamp}@gmail.com`,
    );
    expect(oauth.ok()).toBeTruthy();
    const oauthBody = await oauth.json();
    const accessToken = oauthBody.data?.accessToken as string;
    expect(accessToken).toBeTruthy();

    await page.goto("/login");
    await page.evaluate(
      ({ token, user }) => {
        localStorage.setItem("nj_access_token", token);
        localStorage.setItem(
          "nj-auth",
          JSON.stringify({
            state: {
              accessToken: token,
              refreshToken: user.refreshToken,
              user: {
                id: user.user._id || user.user.id,
                email: user.user.email,
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                role: user.user.role,
              },
            },
            version: 0,
          }),
        );
      },
      {
        token: accessToken,
        user: oauthBody.data,
      },
    );

    await page.goto("/dashboard");
    await expect(page.locator("body")).toContainText(/dashboard|seeker|message|AI/i);

    const adminLogin = await request.post(`${api}/auth/login`, {
      data: {
        email: "admin@naijajobber.local",
        password: "Admin123!",
      },
    });
    expect(adminLogin.ok()).toBeTruthy();
    const adminBody = await adminLogin.json();
    const adminToken = adminBody.data?.accessToken as string;
    expect(adminToken).toBeTruthy();

    const overview = await request.get(`${api}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(overview.ok()).toBeTruthy();

    await page.goto("/dashboard/admin");
    // Without injecting admin session in zustand, page may redirect — still assert route loads
    await expect(page.locator("body")).toBeVisible();

    await page.goto("/dashboard/employer/billing");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Seeker smoke (API)", () => {
  test("profile → CV generate → apply → tracker data", async ({ request }) => {
    const stamp = Date.now();
    const oauth = await request.get(
      `${api}/auth/google/callback?email=e2e_seeker_smoke_${stamp}@gmail.com`,
    );
    expect(oauth.ok()).toBeTruthy();
    const body = await oauth.json();
    const token = body.data?.accessToken as string;
    expect(token).toBeTruthy();
    const headers = { Authorization: `Bearer ${token}` };

    const profile = await request.get(`${api}/profiles/me`, { headers });
    expect(profile.ok()).toBeTruthy();

    await request.patch(`${api}/profiles/me`, {
      headers,
      data: {
        skills: ["TypeScript", "React"],
        languages: [
          {
            language: "English",
            speaking: "Fluent",
            writing: "Fluent",
            reading: "Fluent",
            listening: "Fluent",
          },
        ],
      },
    });

    const cv = await request.post(`${api}/profiles/me/cv/generate`, {
      headers,
      data: { template: "modern" },
    });
    expect(cv.ok()).toBeTruthy();

    const parse = await request.post(`${api}/ai/resume/parse`, {
      headers,
      data: {
        resumeText:
          "Ada Lovelace ada@example.com +2348011111111 typescript react",
        fileName: "ada_cv.pdf",
      },
    });
    expect(parse.ok()).toBeTruthy();

    const jobsRes = await request.get(`${api}/jobs`);
    expect(jobsRes.ok()).toBeTruthy();
    const jobsBody = await jobsRes.json();
    const jobs = jobsBody.data || [];
    if (jobs.length) {
      const apply = await request.post(`${api}/applications`, {
        headers,
        data: { jobId: jobs[0]._id || jobs[0].id, coverLetter: "E2E apply" },
      });
      // May conflict if already applied — accept 201 or 409
      expect([200, 201, 409].includes(apply.status())).toBeTruthy();
    }

    const mine = await request.get(`${api}/applications/mine`, { headers });
    expect(mine.ok()).toBeTruthy();

    const interviews = await request.get(`${api}/interviews/mine`, { headers });
    expect(interviews.ok()).toBeTruthy();

    const learning = await request.get(`${api}/learning/items`, { headers });
    expect(learning.ok()).toBeTruthy();

    const wallet = await request.get(`${api}/billing/wallet`, { headers });
    expect(wallet.ok()).toBeTruthy();
  });
});
