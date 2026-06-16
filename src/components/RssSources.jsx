import "../styles/App.css";

export default function RssSources({ feeds = [], failedFeeds = [] }) {

    const failedFeedsNames = new Set(failedFeeds.map((feed) => feed.source));

    return (
        <div className="card rss-card"> 
            <div className="card-header">
                <div>
                    <p className="section-label">RSS Directory</p>
                    <h2>RSS Sources</h2>
                </div>
            </div>

            <p className="card-description">
                RSS feeds currently used 
            </p>

            {/* show warnings if feed fails */}
            {failedFeeds.length > 0 && (
                <div>
                    <strong>Some feeds could not be loaded:</strong> {" "}
                    {failedFeeds.map((feed) => feed.source).join(", ")}
                </div>
            )}

            <div className="rss-list">
                {feeds.length > 0 ? (
                    feeds.map((feed) => {
                        const hasFailed = failedFeedsNames.has(feed.name);

                        return (
                            <div className="rss-item" key={feed.url}>
                                <div className="rss-item-header">
                                    <h3>{feed.name}</h3>

                                    <span className={hasFailed ? "status-badge failed" : "status-badge active"}>
                                        {hasFailed ? "Failed" : "Active"}
                                    </span>
                                </div>
                                <a href={feed.url} target="_blank" rel="noopener noreferrer">
                                    {feed.url}
                                </a>
                                {hasFailed && (
                                    <p className="feed-error">
                                        {failedFeeds.find((failedFeed) => failedFeed.source === feed.name)?.error}
                                    </p>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p>No RSS sources available.</p>
                )}
            </div>
        </div>
    );
}