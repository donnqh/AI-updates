import "../styles/App.css";

export default function NewsSection({ data }) {
  return (
    <div className="card daily-card">
      <div className="card-header">
        <div>
          <p className="section-label">News Section</p>
          <h2>{data.title}</h2>
        </div>
      </div>

      {data.description && (
        <p className="card-description">{data.description}</p>
      )}

      <div className="post-list">
        {data.posts?.map((post) => (
          <div className="post-item" key={post.id}>
            <h3>{post.title}</h3>

            <p>{post.message}</p>

            <p>
              {post.source} - {post.date}
            </p>

            <button
              className="button"
              onClick={() => window.open(post.link, "_blank")}
            >
              View source
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}