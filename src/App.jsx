import NewsSection from "./components/NewsSection";
import axios from "axios";
import "./styles/App.css";
import { useEffect, useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keywordNews, setKeywordNews] = useState({
    title: "AI & Developer News",
    description:
      "Articles that are more relevant to AI, tools, models, and developer productivity.",
    posts: [],
  });

  const [otherTechNews, setOtherTechNews] = useState({
    title: "Other Tech News",
    description: "General technology updates from the same RSS sources.",
    posts: [],
  });

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get("/api/ai-news");

        setKeywordNews(response.data.keywordRelatedNews);
        setOtherTechNews(response.data.otherTechNews);
      } catch (error) {
        console.log("Failed to fetch news:", error);
        setError("Unable to fetch news right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

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

        <div className="content-grid">
          <NewsSection data={keywordNews} />
          <NewsSection data={otherTechNews} />
        </div>
      </main>
    </div>
  );
}