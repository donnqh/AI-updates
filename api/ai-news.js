import Parser from "rss-parser";

const parser = new Parser();

//used to decide if the article is relevant
const relatedKeywords = [
  "artificial intelligence",
  "open ai",
  "openai",
  "chatgpt",
  "claude",
  "copilot",
  "machine learning",
  "prompt",
  "model",
  "github",
];

//rss sources
const feeds = [
  {
    name: "MIT News - Artificial Intelligence",
    url: "https://news.mit.edu/rss/topic/artificial-intelligence2",
  },
  {
    name: "VentureBeat",
    url: "https://venturebeat.com/feed/",
  },
  {
    name: "OpenAI Engineering",
    url: "https://openai.com/news/engineering/rss.xml",
  },
  {
    name: "Amazon Science",
    url: "https://www.amazon.science/index.rss",
  },
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "Fast Company",
    url: "http://feeds.feedburner.com/fastcompany/headlines",
  },
  {
    name: "The Guardian",
    url: "https://www.theguardian.com/us/technology/rss",
  },
  {
    name: "The Verge",
    url: "http://www.theverge.com/rss/full.xml",
  },
  {
    name: "ByteByteGo",
    url: "https://blog.bytebytego.com/feed",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
  },
  {
    name: "The Pragmatic Engineer",
    url: "https://newsletter.pragmaticengineer.com/feed",
  },
  {
    name: "TLDR",
    url: "https://tldr.tech/api/rss/ai",
  },
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com/feed",
  },
  {
    name: "The Rundown AI",
    url: "https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml",
  },
];

//takes in text and shorten to 180 char
function shortenText(text, maxLength = 180) {
    //error checking
  if (!text) return "No summary available.";

  //removes html tags
  const cleanText = text.replace(/<[^>]*>/g, "").trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  //if more than specified characters, add ...
  return cleanText.substring(0, maxLength) + "...";
}

//function. to check if contains any keywords
function hasKeyword(text, keywords) {
  const lowerText = text.toLowerCase();

  return keywords.some((word) => lowerText.includes(word.toLowerCase()));
}

//fetch articles from one rss feed; async cause fetching feeds take time
async function fetchFeed(feedSource) {
    const feed = await parser.parseURL(feedSource.url);

    //feed.items contain all articles from rss feed
    //only take first 5 articles from source
    return feed.items.slice(0, 5).map((item, index) => { 
    const title = item.title || "No title";
    const rawMessage = item.contentSnippet || item.content || item.summary;
    const message = shortenText(rawMessage, 180);
    const text = `${title} ${message} ${feedSource.name}`;

    return {
      id: `${feedSource.name}-${index}`,
      title,
      message,
      source: feedSource.name,
      date: item.pubDate || item.isoDate || "No date",
      link: item.link || "#",
      isKeywordRelated: hasKeyword(text, relatedKeywords),
    };
  });
}

//main api handler
export default async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "s-maxage=900, stale-while-revalidate=3600"
  );

  //store fetched articles
  const allPosts = [];
  const failedFeeds = [];

  //lopps through every feed
  //.allSettled -> if one feed fails, whole API does not crash
  const results = await Promise.allSettled(
    feeds.map((feedSource) => fetchFeed(feedSource))
  );

  results.forEach((result, index) => {
    const feedSource = feeds[index];

    if (result.status === "fulfilled") {
      allPosts.push(...result.value);
    } else {
      failedFeeds.push({
        source: feedSource.name,
        error: result.reason?.message || "Unknown error",
      });
    }
  });

  const sortedPosts = allPosts.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const keywordRelatedPosts = sortedPosts.filter((post) => {
    return post.isKeywordRelated;
  });

  const otherTechPosts = sortedPosts.filter((post) => {
    return !post.isKeywordRelated;
  });

  //send back to frontend
  res.status(200).json({
    //send rss feed list to the frontend
    rssFeeds: feeds,

    keywordRelatedNews: {
      title: "AI & Developer News",
      description: "Articles that are more relevant to AI, tools, models, and developer productivity.",
      posts: keywordRelatedPosts,
    },

    otherTechNews: {
      title: "Other Tech News",
      description: "General technology updates from the same RSS sources.",
      posts: otherTechPosts,
    },

    failedFeeds,
  });
}