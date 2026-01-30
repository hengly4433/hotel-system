export default function ContactPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Plan your stay, confirm details, or ask about special experiences.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-center" style={{ marginBottom: 32 }}>
            <h2 className="section-title centered">Contact Us</h2>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <label className="grid" style={{ gap: 8 }}>
                Name
                <input className="input" placeholder="Name" />
              </label>
              <label className="grid" style={{ gap: 8 }}>
                Email
                <input className="input" placeholder="Email" type="email" />
              </label>
              <label className="grid" style={{ gap: 8 }}>
                Phone Number
                <input className="input" placeholder="Phone Number" />
              </label>
              <label className="grid" style={{ gap: 8 }}>
                Message
                <textarea className="input" rows={4} placeholder="Message" />
              </label>
              <button className="btn btn-dark" type="button">
                Send
              </button>
            </div>
            <div className="contact-map">
              <iframe
                title="Harborlight map"
                src="https://maps.google.com/maps?q=eiffel%20tower&t=&z=13&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
