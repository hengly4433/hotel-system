import { BLOGS } from "@/app/content/marketing";

export default function BlogPage() {
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
            <p>Lorem Ipsum available, but the majority have suffered.</p>
          </div>
          <div className="blog-grid">
            {BLOGS.map((blog, index) => (
              <article key={`${blog.title}-${index}`} className="blog-card">
                <img src={blog.image} alt={blog.title} />
                <div className="blog-body">
                  <h3>{blog.title}</h3>
                  <span className="tag">{blog.tag}</span>
                  <p>{blog.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
