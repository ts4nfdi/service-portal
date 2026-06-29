import { expect, test } from "@playwright/test";
import ProvidersJson from "@/app/provider/provider.json";
import { acceptTrackingConsent } from "@/tests/libs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const PROVIDERS = Object.values(ProvidersJson);
const FILTER_TYPE = "ontoportal";

test("terminology providers page lists providers with links, logos and copy buttons", async ({
  page,
}) => {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/provider`);

  await expect(
    page.getByRole("link", { name: "API Gateway documentation" }),
  ).toHaveAttribute("href", "https://ts4nfdi.github.io/api-gateway/");

  const providerCount = page.locator(".provider-count");
  const typeSelect = page.getByRole("combobox");
  const cards = page.locator(".provider-card");
  const filteredProviders = PROVIDERS.filter(
    (provider) => provider.type === FILTER_TYPE,
  );

  await expect(providerCount).toHaveText(
    `${PROVIDERS.length} terminology providers available`,
  );
  await expect(typeSelect).toBeVisible();
  await expect(
    typeSelect.locator("option", { hasText: "All types" }),
  ).toHaveCount(1);
  await expect(
    typeSelect.locator(`option[value="${FILTER_TYPE}"]`),
  ).toHaveCount(1);
  await expect(cards).toHaveCount(PROVIDERS.length);

  await typeSelect.selectOption(FILTER_TYPE);
  await expect(providerCount).toHaveText(
    `${filteredProviders.length} terminology providers available (${PROVIDERS.length} total)`,
  );
  await expect(cards).toHaveCount(filteredProviders.length);

  for (const provider of filteredProviders) {
    await expect(
      cards.filter({ has: page.getByText(provider.title, { exact: true }) }),
    ).toBeVisible();
  }

  await typeSelect.selectOption("all");
  await expect(providerCount).toHaveText(
    `${PROVIDERS.length} terminology providers available`,
  );
  await expect(cards).toHaveCount(PROVIDERS.length);

  for (const provider of PROVIDERS) {
    const card = cards.filter({
      has: page.getByText(provider.title, { exact: true }),
    });
    const logo = card.getByRole("img", { name: provider.title });

    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    await expect(logo).toBeVisible();
    await expect(card.getByText("Home Page:")).toBeVisible();
    await expect(
      card.getByRole("link", { name: provider.homepage, exact: true }),
    ).toHaveAttribute("href", provider.homepage);
    await expect(card.getByText("Contact:")).toBeVisible();
    await expect(
      card.getByRole("link", { name: provider.contactUrl, exact: true }),
    ).toHaveAttribute("href", provider.contactUrl);
    await expect(card.getByText("API:")).toBeVisible();
    await expect(card.getByRole("link").nth(2)).toHaveAttribute(
      "href",
      /^https?:\/\//,
    );
    await expect(card).toContainText(provider.description);
    await expect(card.locator("button")).toHaveCount(3);
    await expect
      .poll(async () => {
        return await logo.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        );
      })
      .toBe(true);
  }
});
