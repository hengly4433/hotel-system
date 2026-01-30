"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type GalleryImage = {
  url: string;
  label: string;
};

const PAGE_SIZE = 12;

export default function GalleryClient({ images }: { images: GalleryImage[] }) {
  const [page, setPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  const totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageImages = useMemo(
    () => images.slice(startIndex, startIndex + PAGE_SIZE),
    [images, startIndex]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (activeIndex === null) return;
    const container = thumbsRef.current;
    if (container) {
      const target = container.querySelector<HTMLButtonElement>(`[data-index="${activeIndex}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return (current + 1) % images.length;
        });
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return (current - 1 + images.length) % images.length;
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, images.length]);

  const activeImage = activeIndex === null ? null : images[activeIndex];

  return (
    <div>
      <div className="gallery-grid">
        {pageImages.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            className="gallery-item gallery-button"
            onClick={() => setActiveIndex(startIndex + index)}
          >
            <img src={image.url} alt={`${image.label} ${startIndex + index + 1}`} />
            <span className="gallery-label">{image.label}</span>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <div className="page-indicator">
            Page {page} of {totalPages}
          </div>
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {activeImage && (
        <div className="lightbox">
          <button type="button" className="lightbox-backdrop" onClick={() => setActiveIndex(null)} />
          <div className="lightbox-content" role="dialog" aria-modal="true">
            <img src={activeImage.url} alt={activeImage.label} className="lightbox-image" />
            <div className="lightbox-caption">{activeImage.label}</div>
            {images.length > 1 && (
              <div className="lightbox-thumbs" aria-label="Gallery thumbnails" ref={thumbsRef}>
                {images.map((image, index) => (
                  <button
                    key={`thumb-${image.url}-${index}`}
                    type="button"
                    className={`lightbox-thumb${index === activeIndex ? " active" : ""}`}
                    data-index={index}
                    onClick={() => setActiveIndex(index)}
                  >
                    <img src={image.url} alt={image.label} />
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="lightbox-close" onClick={() => setActiveIndex(null)}>
              Close
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav prev"
                  onClick={() =>
                    setActiveIndex((current) => {
                      if (current === null) return current;
                      return (current - 1 + images.length) % images.length;
                    })
                  }
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="lightbox-nav next"
                  onClick={() =>
                    setActiveIndex((current) => {
                      if (current === null) return current;
                      return (current + 1) % images.length;
                    })
                  }
                >
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
