import { expect, test } from "@playwright/test";
import { OtpStagingApp, type OtpMail } from "../src/fixture/otp-staging-app.js";

for (const viewport of [{ width: 360, height: 800 }, { width: 1440, height: 900 }]) {
  test(`OTP staging page completes the accessible flow at ${viewport.width}px`, async ({ page }) => {
    let sent: OtpMail | undefined;
    const app = new OtpStagingApp({ transport: { send: async (mail) => { sent = mail; } } });
    const running = await app.listen();
    try {
      await page.setViewportSize(viewport);
      await page.goto(running.origin);
      await expect(page).toHaveTitle("OTP staging registration");
      await expect(page.getByLabel("Email")).toBeVisible();
      await page.getByLabel("Email").fill("private@example.test");
      await page.getByLabel("Password").fill("not-stored-password");
      await page.getByRole("button", { name: "Send verification code" }).click();
      await expect(page.getByRole("status")).toHaveText("Code sent.");
      await page.getByLabel("Verification code").fill(sent?.otp ?? "");
      await page.getByRole("button", { name: "Verify registration" }).click();
      await expect(page.getByRole("status")).toHaveText("Registration verified.");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    } finally {
      await running.close();
    }
  });
}
