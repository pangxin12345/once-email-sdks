import { test as base, expect } from "@playwright/test";
import { extendWithEmailOtp } from "@once-email/test/playwright";

export const test = extendWithEmailOtp(base);
export { expect };

test.use({ trace: "off", video: "off", screenshot: "off" });

test("authorized staging login accepts its email OTP", async ({ page, onceEmailOtp }, testInfo) => {
  const outcome = await onceEmailOtp.run({
    configPath: "once-email.test.yaml",
    reportPath: testInfo.outputPath("email-flow.json"),
    journalRoot: testInfo.outputDir,
    requestOtp: async (address) => {
      await page.goto("https://staging.example.test/login");
      await page.getByLabel("Email").fill(address);
      await page.getByRole("button", { name: "Send code" }).click();
    },
    assertOtp: async (otp) => {
      await page.getByLabel("Verification code").fill(otp);
      await page.getByRole("button", { name: "Verify" }).click();
      await expect(page.getByText("Signed in")).toBeVisible();
    },
  });
  expect(outcome.exitCode).toBe(0);
  expect(outcome.report.cleanup.result).toBe("cleaned");
});
