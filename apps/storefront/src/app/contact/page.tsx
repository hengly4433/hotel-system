"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.dataset.name as string]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero-badge">Get In Touch</span>
          <h1>Contact Us</h1>
          <p>Plan your stay, confirm details, or ask about special experiences.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-info-row">
            <div className="contact-info-card">
              <div className="contact-info-icon">📍</div>
              <h4>Our Address</h4>
              <p>Pier 21, Coastal Avenue<br />Harbor District</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon">📞</div>
              <h4>Phone</h4>
              <p>+1 (212) 555-0190<br />Mon–Sun, 24/7</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon">✉️</div>
              <h4>Email</h4>
              <p>stay@harborlight.com<br />We reply within 24h</p>
            </div>
          </div>

          <div className="contact-grid">
            <div className="contact-card">
              {status === "success" ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <div className="contact-success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for contacting us. We will get back to you shortly.</p>
                  <button
                    className="btn btn-dark"
                    onClick={() => setStatus("idle")}
                    style={{ marginTop: 16 }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form-modern">
                  <h3 className="contact-form-title">Send us a message</h3>
                  {status === "error" && (
                    <div className="auth-error-modern">{errorMessage}</div>
                  )}
                  <label className="grid" style={{ gap: 6 }}>
                    <span className="contact-label">Name</span>
                    <input
                      className="input"
                      placeholder="Your full name"
                      data-name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="grid" style={{ gap: 6 }}>
                    <span className="contact-label">Email</span>
                    <input
                      className="input"
                      placeholder="you@example.com"
                      type="email"
                      data-name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="grid" style={{ gap: 6 }}>
                    <span className="contact-label">Phone Number</span>
                    <input
                      className="input"
                      placeholder="+1 (555) 123-4567"
                      data-name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="grid" style={{ gap: 6 }}>
                    <span className="contact-label">Message</span>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Tell us about your plans..."
                      data-name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={status === "submitting"}
                    style={{ marginTop: 8 }}
                  >
                    {status === "submitting" ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
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
