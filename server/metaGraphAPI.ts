/**
 * Meta Graph API Integration
 * Fetches real data from Instagram and Facebook Business accounts
 */

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || "";
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "";

const GRAPH_API_BASE_URL = "https://graph.facebook.com/v18.0";

interface InstagramInsights {
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_views: number;
  reach: number;
  impressions: number;
  engagement: number;
}

interface FacebookPageInsights {
  fan_count: number;
  page_views_total: number;
  page_engaged_users: number;
  page_impressions: number;
  page_post_engagements: number;
  page_impressions_organic: number;
}

/**
 * Fetch Instagram Business Account Insights
 */
export async function getInstagramInsights(): Promise<InstagramInsights | null> {
  if (!META_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    console.warn("[Meta API] Instagram credentials not configured");
    return null;
  }

  try {
    // Get account info
    const accountResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}?fields=followers_count,follows_count,media_count,profile_picture_url&access_token=${META_ACCESS_TOKEN}`
    );

    if (!accountResponse.ok) {
      const error = await accountResponse.json();
      console.error("[Meta API] Instagram account error:", error);
      return null;
    }

    const accountData = await accountResponse.json();

    // Get insights (last 30 days)
    const insightsResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/insights?metric=reach,impressions,profile_views&period=days_28&access_token=${META_ACCESS_TOKEN}`
    );

    if (!insightsResponse.ok) {
      const error = await insightsResponse.json();
      console.error("[Meta API] Instagram insights error:", error);
      // Return basic data without insights
      return {
        followers_count: accountData.followers_count || 0,
        follows_count: accountData.follows_count || 0,
        media_count: accountData.media_count || 0,
        profile_views: 0,
        reach: 0,
        impressions: 0,
        engagement: 0,
      };
    }

    const insightsData = await insightsResponse.json();
    
    // Parse insights
    const insights: any = {};
    if (insightsData.data) {
      insightsData.data.forEach((metric: any) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1].value;
        }
      });
    }

    // Calculate engagement rate
    const totalEngagement = insights.reach || 0;
    const engagement = accountData.followers_count > 0 
      ? (totalEngagement / accountData.followers_count) * 100 
      : 0;

    return {
      followers_count: accountData.followers_count || 0,
      follows_count: accountData.follows_count || 0,
      media_count: accountData.media_count || 0,
      profile_views: insights.profile_views || 0,
      reach: insights.reach || 0,
      impressions: insights.impressions || 0,
      engagement: Math.round(engagement * 10) / 10,
    };
  } catch (error) {
    console.error("[Meta API] Instagram error:", error);
    return null;
  }
}

/**
 * Fetch Facebook Page Insights
 */
export async function getFacebookPageInsights(): Promise<FacebookPageInsights | null> {
  if (!META_ACCESS_TOKEN || !FACEBOOK_PAGE_ID) {
    console.warn("[Meta API] Facebook credentials not configured");
    return null;
  }

  try {
    // Get page info
    const pageResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${FACEBOOK_PAGE_ID}?fields=fan_count,name,picture&access_token=${META_ACCESS_TOKEN}`
    );

    if (!pageResponse.ok) {
      const error = await pageResponse.json();
      console.error("[Meta API] Facebook page error:", error);
      return null;
    }

    const pageData = await pageResponse.json();

    // Get insights (last 30 days)
    const insightsResponse = await fetch(
      `${GRAPH_API_BASE_URL}/${FACEBOOK_PAGE_ID}/insights?metric=page_views_total,page_engaged_users,page_impressions,page_post_engagements,page_impressions_organic&period=days_28&access_token=${META_ACCESS_TOKEN}`
    );

    if (!insightsResponse.ok) {
      const error = await insightsResponse.json();
      console.error("[Meta API] Facebook insights error:", error);
      // Return basic data without insights
      return {
        fan_count: pageData.fan_count || 0,
        page_views_total: 0,
        page_engaged_users: 0,
        page_impressions: 0,
        page_post_engagements: 0,
        page_impressions_organic: 0,
      };
    }

    const insightsData = await insightsResponse.json();
    
    // Parse insights
    const insights: any = {};
    if (insightsData.data) {
      insightsData.data.forEach((metric: any) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1].value;
        }
      });
    }

    return {
      fan_count: pageData.fan_count || 0,
      page_views_total: insights.page_views_total || 0,
      page_engaged_users: insights.page_engaged_users || 0,
      page_impressions: insights.page_impressions || 0,
      page_post_engagements: insights.page_post_engagements || 0,
      page_impressions_organic: insights.page_impressions_organic || 0,
    };
  } catch (error) {
    console.error("[Meta API] Facebook error:", error);
    return null;
  }
}

/**
 * Get combined social media stats
 */
export async function getCombinedSocialMediaStats() {
  const [instagram, facebook] = await Promise.all([
    getInstagramInsights(),
    getFacebookPageInsights(),
  ]);

  return {
    instagram,
    facebook,
    timestamp: new Date().toISOString(),
  };
}
