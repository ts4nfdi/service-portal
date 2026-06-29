import { expect, type Locator, type Page, test } from "@playwright/test";
import { acceptTrackingConsent } from "@/tests/libs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function openTextEditor(page: Page) {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/contact`);
  await expect(page.locator(".rdw-editor-wrapper")).toBeVisible();
}

function editor(page: Page): Locator {
  return page.locator(".DraftEditor-editorContainer [contenteditable='true']");
}

function toolbarOption(page: Page, title: string): Locator {
  return page.locator(`.rdw-option-wrapper[title="${title}"]`);
}

async function hiddenInputValue(page: Page) {
  return await page.locator("#hidden-input").inputValue();
}

async function expectHiddenInputToContain(page: Page, pattern: RegExp) {
  await expect.poll(async () => await hiddenInputValue(page)).toMatch(pattern);
}

async function clearEditor(page: Page) {
  await editor(page).click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
}

async function typeAndSelectText(page: Page, text: string) {
  await clearEditor(page);
  await page.keyboard.type(text);
  await page.keyboard.press("Control+A");
}

async function formatSelectedText(page: Page, title: string, text: string) {
  await typeAndSelectText(page, text);
  await toolbarOption(page, title).click();
}

async function chooseDropdownOption(
  page: Page,
  dropdownClass: string,
  optionText: string,
) {
  const dropdown = page.locator(dropdownClass);
  await dropdown.click();
  let option = dropdown
    .locator("li, .rdw-dropdownoption-default")
    .filter({ hasText: new RegExp(`^${optionText}$`) })
    .first();
  if ((await option.count()) === 0) {
    option = page
      .locator("li, .rdw-dropdownoption-default")
      .filter({ hasText: new RegExp(`^${optionText}$`) })
      .last();
  }
  await option.click({ force: true });
}

async function chooseUnorderedList(page: Page) {
  const dropdown = page.locator(".rdw-list-dropdown");
  const box = await dropdown.boundingBox();
  expect(box).toBeTruthy();
  await dropdown.click();
  await page.mouse.click(box!.x + 20, box!.y + box!.height + 12);
}

test("text editor toolbar actions are visible and clickable", async ({
  page,
}) => {
  await openTextEditor(page);

  for (const title of ["Bold", "Italic", "Underline", "Strikethrough"]) {
    await expect(toolbarOption(page, title)).toBeVisible();
    await toolbarOption(page, title).click();
    await expect(toolbarOption(page, title)).toHaveClass(/rdw-option-active/);
    await toolbarOption(page, title).click();
  }

  await expect(page.locator(".rdw-block-dropdown")).toBeVisible();
  await expect(page.locator(".rdw-fontsize-dropdown")).toBeVisible();
  await expect(page.locator(".rdw-list-dropdown")).toBeVisible();
  await expect(page.locator(".rdw-colorpicker-wrapper")).toBeVisible();
  await expect(toolbarOption(page, "Link")).toBeVisible();
});

test("text editor inline toolbar actions update the submitted html", async ({
  page,
}) => {
  await openTextEditor(page);

  await formatSelectedText(page, "Bold", "bold");
  await expectHiddenInputToContain(page, /<strong>bold<\/strong>/);

  await formatSelectedText(page, "Italic", "italic");
  await expectHiddenInputToContain(page, /<em>italic<\/em>/);

  await formatSelectedText(page, "Underline", "underlined");
  await expectHiddenInputToContain(
    page,
    /<ins>underlined<\/ins>|text-decoration:\s*underline/i,
  );

  await formatSelectedText(page, "Strikethrough", "struck");
  await expectHiddenInputToContain(page, /<del>struck<\/del>|line-through/i);
});

test("text editor dropdown actions update heading and font size html", async ({
  page,
}) => {
  await openTextEditor(page);

  await chooseDropdownOption(page, ".rdw-block-dropdown", "H2");
  await editor(page).click();
  await page.keyboard.type("Styled heading");
  await expectHiddenInputToContain(page, /<h2>Styled heading<\/h2>/);

  await clearEditor(page);
  await chooseDropdownOption(page, ".rdw-fontsize-dropdown", "24");
  await editor(page).click();
  await page.keyboard.type("large text");
  await expectHiddenInputToContain(page, /font-size:\s*24px/i);
});

test("text editor list dropdown updates submitted html", async ({ page }) => {
  await openTextEditor(page);

  await chooseUnorderedList(page);
  await editor(page).click();
  await page.keyboard.type("list item");
  await expectHiddenInputToContain(
    page,
    /<ul>\s*<li>list item<\/li>\s*<\/ul>/,
  );
});

test("text editor color picker and link insertion update submitted html", async ({
  page,
}) => {
  await openTextEditor(page);

  await typeAndSelectText(page, "colored");
  await page.locator(".rdw-colorpicker-wrapper").click();
  await page.locator(".rdw-colorpicker-cube").first().click();
  await expectHiddenInputToContain(page, /color:\s*rgb|color:\s*#/i);

  await page.keyboard.press("Control+A");
  await toolbarOption(page, "Link").click();
  await page.locator("#linkTitle").fill("TS4NFDI");
  await page.locator("#linkTarget").fill("https://terminology.services.base4nfdi.de/");
  await page.getByRole("button", { name: "Add" }).click();

  await expectHiddenInputToContain(
    page,
    /<a href="https:\/\/terminology\.services\.base4nfdi\.de\/"[^>]*>.*TS4NFDI.*<\/a>/,
  );
});

test("text editor sanitizes script content before submission", async ({
  page,
}) => {
  await openTextEditor(page);

  await editor(page).click();
  await page.keyboard.type("<script>window.__xssExecuted = true</script>");

  await expect.poll(async () => await hiddenInputValue(page)).not.toContain("<script>");
  await expect(
    page.evaluate(() => (window as unknown as { __xssExecuted?: boolean }).__xssExecuted),
  ).resolves.toBeFalsy();
});
