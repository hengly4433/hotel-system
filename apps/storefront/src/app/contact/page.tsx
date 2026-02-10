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
              {status === "success" ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                  <h3 style={{ color: "var(--primary)" }}>Message Sent!</h3>
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
                <form onSubmit={handleSubmit}>
                  {status === "error" && (
                    <div style={{ color: "#b91c1c", marginBottom: 16 }}>{errorMessage}</div>
                  )}
                  <label className="grid" style={{ gap: 8 }}>
                    Name
                    <input
                      className="input"
                      placeholder="Name"
                      data-name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="grid" style={{ gap: 8 }}>
                    Email
                    <input
                      className="input"
                      placeholder="Email"
                      type="email"
                      data-name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="grid" style={{ gap: 8 }}>
                    Phone Number
                    <input
                      className="input"
                      placeholder="Phone Number"
                      data-name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="grid" style={{ gap: 8 }}>
                    Message
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Message"
                      data-name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <button
                    className="btn btn-dark"
                    type="submit"
                    disabled={status === "submitting"}
                    style={{ marginTop: 16 }}
                  >
                    {status === "submitting" ? "Sending..." : "Send"}
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
