import { expect, type Locator, type Page, test } from "@playwright/test";
import { MOCK_COLLECTIONS } from "@/tests/fixtures/collections";
import { acceptTrackingConsent, readDownloadJson } from "@/tests/libs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const COLLECTION = MOCK_COLLECTIONS[0];
const PERMALINK = `https://w3id.org/ts4nfdi/collection/${COLLECTION.id}`;

test.use({ acceptDownloads: true });

async function openCollectionPage(page: Page) {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/collection/${COLLECTION.id}`);
  await expect(
    page.locator(".collection-card").filter({
      has: page.getByText(COLLECTION.label!, { exact: true }),
    }),
  ).toBeVisible();
}

function collectionBox(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true }).locator("..");
}

test("collection page is accessible by uuid and shows collection details", async ({
  page,
}) => {
  await openCollectionPage(page);

  await expect(
    page.getByText(COLLECTION.label!, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Collection visibility", { exact: true }),
  ).toHaveText("public");
  await expect(
    page.getByText(`Created by: ${COLLECTION.creator}`),
  ).toBeVisible();
  await expect(page.getByText("Collaborators: None")).toBeVisible();

  const descriptionBox = page.getByText(COLLECTION.description!, {
    exact: true,
  });
  await expect(descriptionBox).toBeVisible();
  await expect(descriptionBox).toHaveClass(/bg-gray-100/);

  for (const terminology of COLLECTION.terminologies!) {
    await expect(
      page.getByRole("button", {
        name: `Show ontology information for ${terminology.label}`,
      }),
    ).toBeVisible();
  }
});

test("collection page shows uuid and permalink boxes with copy actions", async ({
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
  await openCollectionPage(page);

  const uuidBox = collectionBox(page, COLLECTION.id!);
  const permalinkBox = collectionBox(page, PERMALINK);

  await expect(uuidBox).toContainText("uuid");
  await expect(uuidBox).toHaveClass(/bg-gray-100/);
  await expect(permalinkBox).toContainText("PermaLink");
  await expect(permalinkBox).toHaveClass(/bg-gray-100/);

  await uuidBox.locator("button").click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(COLLECTION.id);

  await permalinkBox.locator("button").click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(PERMALINK);
});

test("collection page downloads the collection as JSON", async ({ page }) => {
  await openCollectionPage(page);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download collection JSON" }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Climate-Metadata-Collection.json");
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const json = await readDownloadJson(downloadPath!);
  expect(json).toMatchObject({
    id: COLLECTION.id,
    label: COLLECTION.label,
    creator: COLLECTION.creator,
    description: COLLECTION.description,
  });
});
