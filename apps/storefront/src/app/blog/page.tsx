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
          <h1>Blog</h1>
          <p>Stories, rituals, and seasonal notes from Harborlight.</p>
        </div>
      </section>

      <section className="section blog-section">
        <div className="container">
          <div className="section-center" style={{ marginBottom: 32 }}>
            <h2 className="section-title centered">Blog</h2>
            <p>Latest stories and updates from our coastal retreat.</p>
          </div>
          {blogs.length > 0 ? (
            <div className="blog-grid">
              {blogs.map((blog) => (
                <article key={blog.id} className="blog-card">
                  <img src={blog.imageUrl} alt={blog.title} />
                  <div className="blog-body">
                    <h3>{blog.title}</h3>
                    <span className="tag">{blog.tag}</span>
                    <p>{blog.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">No blog posts available yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
