import NewsSection from "./components/NewsSection";
//used to make API requests
import axios from "axios";
import "./styles/App.css";
import { useEffect, useState } from "react";
import RssSources from "./components/RssSources";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rssFeeds, setRssFeeds] = useState([]);
  const [failedFeeds, setFailedFeeds] = useState([]);

  //state for related news
  const [keywordNews, setKeywordNews] = useState({
    title: "AI & Developer News",
    description:
      "Articles that are more relevant to AI, tools, models, and developer productivity.",
    posts: [], //nly after API responds, will contain RSS articles
    /*
    title:
    message:
    source:
    date:
    link:
    */
  });

  const [otherTechNews, setOtherTechNews] = useState({
    title: "Other Tech News",
    description: "General technology updates from the same RSS sources.",
    posts: [],
  });

  //run this once when app component first loads
  useEffect(() => {

    //api calls take time need to aysnc
    async function fetchNews() {
      try {
        //start showing loading screen
        setLoading(true);
        setError("");

        //wait till API response comes back
        const response = await axios.get("/api/ai-news");

        //store RSS feed list
        setRssFeeds(response.data.rssFeeds || []);
        setKeywordNews(response.data.keywordRelatedNews);
        setOtherTechNews(response.data.otherTechNews);
        setFailedFeeds(response.data.failedFeeds || []);

      } catch (error) {
        console.log("Failed to fetch news:", error);
        setError("Unable to fetch news right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    //calling the function
    fetchNews();
  }, []);

  //shows this when page is loading
  if (loading) {
    return (
      <div className="loading-screen">
        <h1>Loading latest tech news...</h1>
        <p>Fetching articles from RSS feeds...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="main-content">
        <header className="page-header">
          <h1>Tech News Library</h1>
          <p>Recent AI and technology articles from trusted RSS feeds.</p>
        </header>

        {error && <p className="error-message">{error}</p>}

        <nav className="section-nav">
          <a href="#related-tech-news">Related Tech News</a>
          <a href="#other-tech-news">Other Tech News</a>
          <a href="#rss-sources">RSS Sources</a>
        </nav>

        <div className="content-grid">
          <section id="related-tech-news" className="section-anchor">
            <NewsSection data={keywordNews} />
          </section>

          <section id="other-tech-news" className="section-anchor">
            <NewsSection data={otherTechNews} />
          </section>

          <section id="rss-sources" className="section-anchor">
            <RssSources feeds={rssFeeds} failedFeeds={failedFeeds}/>
          </section>

        </div>
      </main>
    </div>
  );
}