import Link from "next/link";
import { publicApi } from "@/lib/publicApi";

type Blog = {
  id: string;
  title: string;
  tag: string;
  description: string;
  imageUrl: string;
  content: string;
  isActive: boolean;
  createdAt: string;
};

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return dateString;
  }
}

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let blogs: Blog[] = [];
  
  try {
    blogs = await publicApi<Blog[]>("/public/blogs");
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
  }

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero-badge">Stories & Updates</span>
          <h1>Blog</h1>
          <p>Stories, rituals, and seasonal notes from Harborlight.</p>
        </div>
      </section>

      <section className="section blog-section">
        <div className="container">
          {blogs.length > 0 ? (
            <div className="blog-grid">
              {blogs.map((blog) => (
                <article key={blog.id} className="blog-card">
                  <div className="blog-card-img-wrap">
                    <img src={blog.imageUrl} alt={blog.title} />
                    <span className="blog-card-tag">{blog.tag}</span>
                  </div>
                  <div className="blog-body">
                    <span className="blog-date">{formatDate(blog.createdAt)}</span>
                    <h3>{blog.title}</h3>
                    <p>{blog.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p style={{ marginBottom: 12 }}>No blog posts available yet.</p>
              <Link className="btn btn-primary" href="/">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
