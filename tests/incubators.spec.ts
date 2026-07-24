import { expect, type Locator, type Page, test } from "@playwright/test";
import ProjectsJson from "@/app/ui/incubators/projects.json";
import { acceptTrackingConsent } from "@/tests/libs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const REQUEST_CARD_TITLE =
  "Would you like to collaborate with us as an Incubator?";
const VISIBLE_STATUSES = ["In preparation", "Running", "Finished"] as const;
const PROJECTS = ProjectsJson.projects;

function visibleProjects(status?: string) {
  return PROJECTS.filter((project) => !status || project.status === status);
}

async function openIncubatorsPage(page: Page) {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/incubators`);
}

function incubatorCards(page: Page) {
  return page.locator(".incubator-project-card");
}

function requestCard(page: Page) {
  return incubatorCards(page).filter({
    has: page.getByText(REQUEST_CARD_TITLE, { exact: true }),
  });
}

function firstProjectWithConsortium() {
  const project = PROJECTS.find((item) => item.consortium.length > 0);
  if (!project) {
    throw new Error("No incubator project with a consortium was found");
  }
  return project;
}

async function expectRequestCardVisible(card: Locator) {
  await expect(card).toBeVisible();
  await expect(
    card.getByRole("link", { name: "Send us your request" }),
  ).toBeVisible();
}

test("incubators page shows status summaries, filters and cards", async ({
  page,
}) => {
  await openIncubatorsPage(page);

  const cards = incubatorCards(page);
  for (const status of VISIBLE_STATUSES) {
    const statusSummary = page.locator(`[data-value="${status}"]`);
    await expect(statusSummary).toContainText(
      `${status}: ${ProjectsJson.stats[status]}`,
    );
  }

  await expect(page.getByLabel("Status")).toBeVisible();
  await expect(page.getByLabel("Consortium")).toBeVisible();
  await expect(page.getByLabel("Cycle")).toBeVisible();
  await expect(cards).toHaveCount(visibleProjects().length + 1);
  await expectRequestCardVisible(requestCard(page));
});

test("status summary filters projects and updates the status dropdown", async ({
  page,
}) => {
  await openIncubatorsPage(page);

  const cards = incubatorCards(page);
  const addProjectCard = requestCard(page);

  const runningStatus = page.locator('[data-value="Running"]');
  await runningStatus.click();
  await expect(page.locator("#status")).toHaveValue("Running");
  await expect(cards).toHaveCount(visibleProjects("Running").length + 1);
  await expectRequestCardVisible(addProjectCard);

  for (const project of visibleProjects("Running")) {
    await expect(
      cards.filter({ has: page.getByText(project.title, { exact: true }) }),
    ).toBeVisible();
  }

  await page.locator("#status").selectOption("");
  await expect(cards).toHaveCount(visibleProjects().length + 1);
  await expectRequestCardVisible(addProjectCard);
});

test("dropdown filters narrow projects by consortium and cycle", async ({
  page,
}) => {
  await openIncubatorsPage(page);

  const cards = incubatorCards(page);
  const addProjectCard = requestCard(page);

  const consortiumProject = firstProjectWithConsortium();
  const consortium = consortiumProject.consortium[0];
  await page.locator("#consortium").selectOption(consortium);
  await expect(cards).toHaveCount(
    PROJECTS.filter((project) => project.consortium.includes(consortium))
      .length + 1,
  );
  await expectRequestCardVisible(addProjectCard);

  await page.locator("#consortium").selectOption("");
  await page.locator("#cycle").selectOption(consortiumProject.cycle.toString());
  await expect(cards).toHaveCount(
    PROJECTS.filter((project) => project.cycle === consortiumProject.cycle)
      .length + 1,
  );
  await expectRequestCardVisible(addProjectCard);
});

test("incubator cards show project details and loaded logos", async ({
  page,
}) => {
  await openIncubatorsPage(page);

  const cards = incubatorCards(page);
  const firstProjectCard = cards.filter({
    has: page.getByText(PROJECTS[0].title, { exact: true }),
  });
  await expect(
    firstProjectCard.getByRole("img", { name: PROJECTS[0].title }),
  ).toBeVisible();
  await expect(
    firstProjectCard.getByText(PROJECTS[0].title, { exact: true }),
  ).toBeVisible();
  await expect(firstProjectCard.getByText("Status")).toBeVisible();
  await expect(
    firstProjectCard.getByText(PROJECTS[0].status, { exact: true }),
  ).toBeVisible();
  await expect(firstProjectCard.getByText("Duration")).toBeVisible();
  await expect(firstProjectCard).toContainText(
    `From ${PROJECTS[0].start} To ${PROJECTS[0].end}`,
  );
  await expect(firstProjectCard.getByText("Description")).toBeVisible();
  await expect(firstProjectCard).toContainText(PROJECTS[0].description);

  const projectLogos = page.locator(
    ".incubator-project-card img:not([alt='Add your project'])",
  );
  await expect(projectLogos).toHaveCount(PROJECTS.length);
  for (let index = 0; index < PROJECTS.length; index += 1) {
    const logo = projectLogos.nth(index);
    await logo.scrollIntoViewIfNeeded();
    await expect(logo).toBeVisible();
    await expect
      .poll(async () => {
        return await logo.evaluate((img: HTMLImageElement) => {
          return img.complete && img.naturalWidth > 0;
        });
      })
      .toBe(true);
  }
});

test("request card opens the new incubator request form", async ({ page }) => {
  await openIncubatorsPage(page);

  const requestLink = requestCard(page).getByRole("link", {
    name: "Send us your request",
  });
  await expect(requestLink).toBeVisible();
  await requestLink.click();

  await expect(page.locator("main")).toContainText("New incubator request", {
    timeout: 15000,
  });
  await expect(
    page.getByRole("link", { name: /incubators list/i }),
  ).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByText("Description")).toBeVisible();
  await expect(page.locator(".rdw-editor-wrapper")).toBeVisible();
  await expect(page.locator("#logo-input")).toBeVisible();
  await expect(page.locator("#captcha")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
});
