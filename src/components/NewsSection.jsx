import "../styles/App.css";

function formatDate(dateString) {
  //if no date, show message
  if (!dateString || dateString === "No date") {
    return "No date available";
  }

  const date = new Date(dateString);

  //if date is invalid format, show message
  if (Number.isNaN(date.getTime())) {
    return "No date available";
  }

  //format date 
  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

//receives data from app
export default function NewsSection({ data }) {
  return (
    //main container
    <div className="card daily-card">
      {/* header area for news section*/}
      <div className="card-header">
        <div>
          <p className="section-label">News Section</p>
          {/* from app */}
          <h2>{data.title}</h2>
        </div>
      </div>

      {/* only shown if data exists, else will not render */}
      {data.description && (
        <p className="card-description">{data.description}</p>
      )}

      {/* container to hold all news post */}
      <div className="post-list">
        {/* loop through every posts inside data.posts 
        ? -> prevents error if post is undefined */}
        {data.posts?.map((post) => (
          <div className="post-item" key={post.id}>
            <h3>{post.title}</h3>

            <p>{post.message}</p>

            <p className="post-meta">
              {post.source} · {formatDate(post.date)}
            </p>

            {/* button to open to a new broswer tab */}
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