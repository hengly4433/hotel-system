import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-title">Contact Us</h3>
            <p style={{ marginBottom: 8 }}>Harborlight Hotel</p>
            <p style={{ marginBottom: 8 }}>Pier 21, Coastal Avenue</p>
            <p style={{ marginBottom: 8 }}>+1 (212) 555-0190</p>
            <p style={{ marginBottom: 8 }}>stay@harborlight.com</p>
          </div>
          <div>
            <h3 className="footer-title">Menu Link</h3>
            <Link className="footer-link" href="/">
              Home
            </Link>
            <Link className="footer-link" href="/about">
              About
            </Link>
            <Link className="footer-link" href="/rooms">
              Our Room
            </Link>
            <Link className="footer-link" href="/gallery">
              Gallery
            </Link>
            <Link className="footer-link" href="/blog">
              Blog
            </Link>
            <Link className="footer-link" href="/contact">
              Contact Us
            </Link>
          </div>
          <div>
            <h3 className="footer-title">Newsletter</h3>
            <p style={{ marginBottom: 12, color: "rgba(255,255,255,0.65)" }}>
              Receive curated stays, seasonal offers, and new experiences.
            </p>
            <div className="grid" style={{ gap: 12 }}>
              <input className="input" placeholder="Enter your email" />
              <button className="btn btn-primary" type="button">
                Subscribe
              </button>
            </div>
            <div className="social-row">
              <span className="social-icon">f</span>
              <span className="social-icon">t</span>
              <span className="social-icon">in</span>
              <span className="social-icon">yt</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} Harborlight Hotel. All Rights Reserved.</div>
      </div>
    </footer>
  );
}
