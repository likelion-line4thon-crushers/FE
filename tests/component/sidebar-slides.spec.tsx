import React from "react";
import { test, expect } from "@playwright/experimental-ct-react";
import SidebarSlides from "@/widgets/slides-sidebar/ui/SidebarSlides";

test.describe("SidebarSlides", () => {
  test("hides locked audience slides beyond the revealed boundary", async ({ mount }) => {
    const component = await mount(
      <SidebarSlides
        slides={["/slide-1.png", "/slide-2.png", "/slide-3.png"]}
        currentSlide={0}
        revealAllSlides={false}
        maxRevealedPage={0}
      />
    );

    await expect(component.getByAltText("슬라이드 1")).toBeVisible();
    await expect(component.getByAltText("슬라이드 2")).toHaveCount(0);
    await expect(component.getByAltText("슬라이드 3")).toHaveCount(0);
  });

  test("renders placeholder-only thumbnails while the audience is waiting", async ({ mount }) => {
    const component = await mount(
      <SidebarSlides currentSlide={0} isWaiting placeholderCount={4} revealAllSlides />
    );

    await expect(component.getByAltText(/슬라이드/)).toHaveCount(0);
    await expect(component.locator("button, img")).toHaveCount(0);
    await expect(component.locator("text=1")).toBeVisible();
    await expect(component.locator("text=4")).toBeVisible();
  });
});
