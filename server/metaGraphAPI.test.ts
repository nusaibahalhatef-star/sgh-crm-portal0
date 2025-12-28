import { describe, it, expect } from "vitest";
import { getInstagramInsights, getFacebookPageInsights } from "./metaGraphAPI";

describe("Meta Graph API Integration", () => {
  it("should validate Meta API credentials and fetch Instagram data", async () => {
    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    expect(META_ACCESS_TOKEN).toBeDefined();
    expect(INSTAGRAM_BUSINESS_ACCOUNT_ID).toBeDefined();

    if (!META_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      throw new Error("Meta API credentials not configured");
    }

    // Test Instagram API
    const instagramData = await getInstagramInsights();
    
    if (!instagramData) {
      throw new Error("Failed to fetch Instagram data. Please check META_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID.");
    }

    expect(instagramData).toBeDefined();
    expect(instagramData.followers_count).toBeGreaterThanOrEqual(0);
    
    console.log("✅ Instagram data fetched successfully:");
    console.log(`   - Followers: ${instagramData.followers_count}`);
    console.log(`   - Media: ${instagramData.media_count}`);
    console.log(`   - Reach: ${instagramData.reach}`);
  }, 30000); // 30 second timeout for API calls

  it("should validate Meta API credentials and fetch Facebook data", async () => {
    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

    expect(META_ACCESS_TOKEN).toBeDefined();
    expect(FACEBOOK_PAGE_ID).toBeDefined();

    if (!META_ACCESS_TOKEN || !FACEBOOK_PAGE_ID) {
      throw new Error("Meta API credentials not configured");
    }

    // Test Facebook API
    const facebookData = await getFacebookPageInsights();
    
    if (!facebookData) {
      throw new Error("Failed to fetch Facebook data. Please check META_ACCESS_TOKEN and FACEBOOK_PAGE_ID.");
    }

    expect(facebookData).toBeDefined();
    expect(facebookData.fan_count).toBeGreaterThanOrEqual(0);
    
    console.log("✅ Facebook data fetched successfully:");
    console.log(`   - Fans: ${facebookData.fan_count}`);
    console.log(`   - Page Views: ${facebookData.page_views_total}`);
    console.log(`   - Impressions: ${facebookData.page_impressions}`);
  }, 30000); // 30 second timeout for API calls
});
