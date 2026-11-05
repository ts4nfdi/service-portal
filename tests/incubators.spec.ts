import { expect, type Page, test } from "@playwright/test";
import ProjectsJson from "@/app/ui/incubators/projects.json";
import { acceptTrackingConsent } from "@/tests/libs";

const BASE_URL = `http://localhost:${process.env.PLAYWRIGHT_TEST_PORT ?? "3000"}`;
const VISIBLE_STATUSES = ["In preparation", "Running", "Finished"];
const PROJECTS = ProjectsJson.projects.filter((project) =>
  VISIBLE_STATUSES.includes(project.status),
);

async function openIncubatorsPage(page: Page, query = "") {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/incubators${query}`);
  await expect(page.getByLabel("Search incubators")).toBeVisible();
}

function incubatorCards(page: Page) {
  return page.locator(".incubator-project-card");
}

function cardTitles(page: Page) {
  return incubatorCards(page).getByRole("heading", { level: 2 });
}

async function openRequestForm(page: Page) {
  await openIncubatorsPage(page);
  await page.getByRole("link", { name: "Apply now!", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sample incubator project" })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toBeVisible();
}

test("incubators list shows status summaries, filters and project previews", async ({ page }) => {
  await openIncubatorsPage(page);

  for (const status of VISIBLE_STATUSES) {
    await expect(page.locator(`[data-value="${status}"]`)).toContainText(
      `${status}: ${ProjectsJson.stats[status as keyof typeof ProjectsJson.stats]}`,
    );
  }
  for (const label of ["Status", "Consortium", "Cycle"]) {
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  }
  await expect(cardTitles(page)).toHaveText(PROJECTS.map((project) => project.title));
  await expect(page.getByRole("link", { name: "Apply now!", exact: true })).toBeVisible();

  for (const project of PROJECTS) {
    const card = incubatorCards(page).filter({ has: page.getByRole("heading", { name: project.title, exact: true }) });
    await expect(card).toHaveAttribute("href", `/incubators/${project.url}`);
    await expect(card.getByText("Read more", { exact: true })).toBeVisible();
    const logo = card.getByRole("img", { name: project.title, exact: true });
    await logo.scrollIntoViewIfNeeded();
    await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { message: `Logo loads for ${project.title}` }).toBe(true);
  }
});

test("selected status overview toggles off while preserving other filters", async ({ page }) => {
  await openIncubatorsPage(page);
  await page.getByLabel("Consortium", { exact: true }).selectOption("NFDI4Chem");
  await page.getByLabel("Search incubators").fill("data");
  const running = page.locator('[data-value="Running"]');
  await running.click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Running");
  await expect(running).toHaveClass(/clicked-status-card/);
  await expect(cardTitles(page)).toHaveText(["nmrXiv", "Coconut"]);

  await running.click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("");
  await expect(running).not.toHaveClass(/clicked-status-card/);
  await expect(cardTitles(page)).toHaveText(["RADAR", "nmrXiv", "Coconut"]);
  await expect(page).toHaveURL((url) => !url.searchParams.has("status") && url.searchParams.get("consortium") === "NFDI4Chem" && url.searchParams.get("search") === "data");
});

test("dropdown filters combine status, consortium and cycle", async ({ page }) => {
  await openIncubatorsPage(page);
  await page.getByLabel("Status", { exact: true }).selectOption("Finished");
  await page.getByLabel("Consortium", { exact: true }).selectOption("NFDI4Chem");
  await page.getByLabel("Cycle", { exact: true }).selectOption("1");
  await expect(cardTitles(page)).toHaveText(["RADAR"]);
  await page.getByLabel("Consortium", { exact: true }).selectOption("");
  await expect(cardTitles(page)).toHaveText(PROJECTS.filter((project) => project.status === "Finished" && project.cycle === 1).map((project) => project.title));
});

test("search ranks title matches before description matches and ignores case and surrounding spaces", async ({ page }) => {
  await openIncubatorsPage(page);
  await page.getByLabel("Search incubators").fill("  DATA  ");
  const titleMatches = PROJECTS.filter((project) => /data/i.test(project.title)).map((project) => project.title);
  const descriptionMatches = PROJECTS.filter((project) => !/data/i.test(project.title) && /data/i.test(project.description)).map((project) => project.title);
  expect(titleMatches.length).toBeGreaterThan(0);
  expect(descriptionMatches.length).toBeGreaterThan(0);
  await expect(cardTitles(page)).toHaveText([...titleMatches, ...descriptionMatches]);
  await page.getByLabel("Search incubators").fill("");
  await expect(cardTitles(page)).toHaveText(PROJECTS.map((project) => project.title));
  await expect(page).toHaveURL((url) => !url.searchParams.has("search"));
});

test("filter and search selections survive sharing the URL and reloading", async ({ page, context }) => {
  await openIncubatorsPage(page);
  await page.getByLabel("Status", { exact: true }).selectOption("Finished");
  await page.getByLabel("Consortium", { exact: true }).selectOption("Text+");
  await page.getByLabel("Cycle", { exact: true }).selectOption("1");
  await page.getByLabel("Search incubators").fill("Discuss Data");
  await expect(page).toHaveURL((url) => url.searchParams.get("status") === "Finished" && url.searchParams.get("consortium") === "Text+" && url.searchParams.get("cycle") === "1" && url.searchParams.get("search") === "Discuss Data");

  const sharedPage = await context.newPage();
  await acceptTrackingConsent(sharedPage);
  await sharedPage.goto(page.url());
  await sharedPage.reload();
  await expect(sharedPage.getByLabel("Status", { exact: true })).toHaveValue("Finished");
  await expect(sharedPage.getByLabel("Consortium", { exact: true })).toHaveValue("Text+");
  await expect(sharedPage.getByLabel("Cycle", { exact: true })).toHaveValue("1");
  await expect(sharedPage.getByLabel("Search incubators")).toHaveValue("Discuss Data");
  await expect(cardTitles(sharedPage)).toHaveText(["Discuss Data"]);
});

test("unmatched search shows an empty state and clearing it restores filtered results", async ({ page }) => {
  await openIncubatorsPage(page, "?status=Running");
  await page.getByLabel("Search incubators").fill("no-such-incubator-xyz");
  await expect(incubatorCards(page)).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("No incubators match your search and filters.");
  await page.getByLabel("Search incubators").fill("");
  await expect(incubatorCards(page)).toHaveCount(PROJECTS.filter((project) => project.status === "Running").length);
  await expect(page.getByText("No incubators match your search and filters.")).toBeHidden();
});

test("unknown filter values in a shared URL fall back to all projects", async ({ page }) => {
  await openIncubatorsPage(page, "?status=unknown&consortium=unknown&cycle=unknown");
  for (const label of ["Status", "Consortium", "Cycle"]) {
    await expect(page.getByLabel(label, { exact: true })).toHaveValue("");
  }
  await expect(incubatorCards(page)).toHaveCount(PROJECTS.length);
});

for (const clickTarget of ["card", "Read more"]) {
  test(`${clickTarget} opens the full incubator profile at its shareable slug`, async ({ page }) => {
    const project = PROJECTS[0];
    if (!project.activityPage) throw new Error("Profile fixture needs an activity page");
    await openIncubatorsPage(page);
    const card = incubatorCards(page).filter({ has: page.getByRole("heading", { name: project.title, exact: true }) });
    await (clickTarget === "card" ? card : card.getByText("Read more", { exact: true })).click();
    await expect(page).toHaveURL(`${BASE_URL}/incubators/${project.url}`);
    await page.reload();
    const profile = page.getByRole("article");
    await expect(profile.getByRole("heading", { name: project.title, exact: true })).toBeVisible();
    await expect(profile.getByRole("img", { name: project.title, exact: true })).toBeVisible();
    await expect(profile).toContainText(project.description);
    await expect(profile).toContainText(`From ${project.start} To ${project.end}`);
    for (const goal of project.goals) await expect(profile).toContainText(goal);
    for (const consortium of project.consortium) await expect(profile).toContainText(consortium);
    for (const publication of project.publications ?? []) {
      await expect(profile.getByRole("link", { name: publication, exact: true })).toHaveAttribute("href", publication);
    }
    const activity = profile.getByRole("link", { name: "Activity Page" });
    await expect(activity).toHaveAttribute("href", project.activityPage);
    await expect(activity).toHaveAttribute("target", "_blank");
    await page.getByRole("link", { name: "Back to incubators", exact: true }).click();
    await expect(incubatorCards(page)).toHaveCount(PROJECTS.length);
  });
}

test("unknown incubator profile displays not found", async ({ page }) => {
  await acceptTrackingConsent(page);
  const response = await page.goto(`${BASE_URL}/incubators/no-such-incubator-xyz`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("Apply now opens explanation before the request form", async ({ page }) => {
  await openIncubatorsPage(page);
  await page.getByRole("link", { name: "Apply now!", exact: true }).click();
  await expect(page).toHaveURL(`${BASE_URL}/incubators/new`);
  await expect(page.getByRole("heading", { name: "Sample incubator project" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await expect(page.getByLabel("Title", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await expect(page.getByRole("heading", { name: "Sample incubator project" })).toBeHidden();
  await expect(page.getByLabel("Title", { exact: true })).toBeVisible();
  await expect(page.getByLabel("E-mail", { exact: true })).toBeVisible();
  await expect(page.locator(".rdw-editor-wrapper")).toBeVisible();
  await expect(page.locator("#logo-input")).toBeVisible();
  await expect(page.locator("#captcha")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit", exact: true })).toBeVisible();
});

test("Back preserves entered request details and Cancel returns to the list", async ({ page }) => {
  await openRequestForm(page);
  await page.getByLabel("Title", { exact: true }).fill("Example incubator");
  await page.getByLabel("E-mail", { exact: true }).fill("incubator@example.org");
  await page.locator(".public-DraftEditor-content").fill("Our terminology project.");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Example incubator");
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue("incubator@example.org");
  await expect(page.locator(".public-DraftEditor-content")).toHaveText("Our terminology project.");
  await page.getByRole("link", { name: "Cancel", exact: true }).click();
  await expect(incubatorCards(page)).toHaveCount(PROJECTS.length);
});

test("request form rejects missing required fields without submitting", async ({ page }) => {
  await openRequestForm(page);
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toBeFocused();
  expect(await page.getByLabel("Title", { exact: true }).evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
  await expect(page.getByRole("button", { name: "Submit", exact: true })).toBeVisible();
});
