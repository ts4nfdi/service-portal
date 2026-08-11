import { expect, type Page, test } from "@playwright/test";
import { MOCK_COLLECTIONS } from "@/tests/fixtures/collections";
import {
  acceptTrackingConsent,
  isImageLoaded,
  readDownloadJson,
} from "@/tests/libs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const GATEWAY_BASE_URL =
  process.env.GATEWAY_BASE_URL || "http://127.0.0.1:32123";

test.use({ acceptDownloads: true });

async function openCollectionsPage(page: Page) {
  await acceptTrackingConsent(page);
  await page.goto(BASE_URL);
  const collectionsLink = page
    .locator('nav a.navbar-links[href="/collection"]')
    .first();
  await expect(collectionsLink).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/collection\/?$/),
    collectionsLink.click(),
  ]);
  await expect(page.locator(".collection-card")).toHaveCount(5);
}

function collectionCards(page: Page) {
  return page.locator(".collection-card");
}

function collectionCard(page: Page, label: string) {
  return collectionCards(page).filter({
    has: page.getByRole("link", { name: label }),
  });
}

function paginationText(page: Page, pattern: RegExp) {
  return page.locator("span").filter({ hasText: pattern });
}

test("collections page is reachable from the navbar and shows the explanation area", async ({
  page,
}) => {
  await openCollectionsPage(page);

  const explanationBox = page
    .locator(".card-background")
    .filter({ hasText: "What is a Terminology Collection?" });

  await expect(explanationBox).toBeVisible();
  await expect(
    explanationBox.getByRole("button", {
      name: "Download all public collections as JSON",
    }),
  ).toBeVisible();
  await expect(
    explanationBox.getByRole("link", { name: "Create Collection" }),
  ).toHaveCount(0);
  await expect(explanationBox).toContainText(
    `${GATEWAY_BASE_URL}/collections/`,
  );
  await expect(explanationBox.locator("button")).toHaveCount(2);

  await expect(
    page.getByRole("heading", {
      name: "Figure of a Terminology Collection",
    }),
  ).toBeVisible();
  expect(
    await isImageLoaded(page, 'img[alt="example of a terminology collection"]'),
  ).toBe(true);
});

test("collections page downloads all public collections as JSON", async ({
  page,
}) => {
  await openCollectionsPage(page);

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download all public collections as JSON" })
    .click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("collections.json");
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const json = (await readDownloadJson(downloadPath!)) as typeof MOCK_COLLECTIONS;
  expect(json).toHaveLength(MOCK_COLLECTIONS.length);
  expect(json[0]).toMatchObject({
    id: MOCK_COLLECTIONS[0].id,
    label: MOCK_COLLECTIONS[0].label,
  });
});

test("collections list search updates visible cards and pagination", async ({
  page,
}) => {
  await openCollectionsPage(page);

  await expect(
    paginationText(page, /Showing\s*1\s*to\s*5\s*of\s*6\s*Collections/),
  ).toHaveCount(2);

  await page.getByRole("button", { name: "Next" }).first().click();
  await expect(
    paginationText(page, /Showing\s*6\s*to\s*6\s*of\s*6\s*Collections/),
  ).toHaveCount(2);
  await expect(collectionCard(page, MOCK_COLLECTIONS[5].label!)).toBeVisible();

  await page.getByLabel("Search For Collection").fill("Chemistry");
  await expect(
    paginationText(page, /Showing\s*1\s*to\s*1\s*of\s*1\s*Collections/),
  ).toHaveCount(2);
  await expect(collectionCards(page)).toHaveCount(1);
  await expect(collectionCard(page, MOCK_COLLECTIONS[1].label!)).toBeVisible();
});

test("collection cards show details, copy actions and terminology tags", async ({
  browserName,
  context,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "Clipboard assertions run in Chromium.",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: BASE_URL,
  });
  await openCollectionsPage(page);

  const collection = MOCK_COLLECTIONS[0];
  const permalink = `https://w3id.org/ts4nfdi/collection/${collection.id}`;
  const card = collectionCard(page, collection.label!);

  await expect(
    card.getByRole("link", { name: collection.label }),
  ).toHaveAttribute("href", `/collection/${collection.id}`);
  await expect(card).toContainText(`uuid:${collection.id}`);
  await expect(card).toContainText(`PermaLink:${permalink}`);
  await expect(card).toContainText(`Created by: ${collection.creator}`);
  await expect(card).toContainText(collection.description!);
  await expect(
    card.getByRole("button", {
      name: `Show ontology information for ${collection.terminologies![0].label}`,
    }),
  ).toBeVisible();

  const uuidCopyButton = card
    .getByText(collection.id!, { exact: true })
    .locator("..")
    .locator("button");
  const permalinkCopyButton = card
    .getByText(permalink, { exact: true })
    .locator("..")
    .locator("button");

  await uuidCopyButton.click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(collection.id);

  await permalinkCopyButton.click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(permalink);
});

test("collection card downloads a single collection as JSON", async ({
  page,
}) => {
  await openCollectionsPage(page);

  const collection = MOCK_COLLECTIONS[0];
  const card = collectionCard(page, collection.label!);
  const downloadPromise = page.waitForEvent("download");
  await card
    .getByRole("button", { name: "Download collection as JSON" })
    .click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`collection-${collection.id}.json`);
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const json = await readDownloadJson(downloadPath!);
  expect(json).toMatchObject({
    id: collection.id,
    label: collection.label,
    creator: collection.creator,
  });
});
