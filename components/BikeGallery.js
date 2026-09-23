"use client";

import { useState } from "react";
import BikePlaceholder from "./BikePlaceholder";

export default function BikeGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const hasImages = images && images.length > 0;

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-bone">
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/uploads/${images[active]}`}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <BikePlaceholder className="h-full w-full p-12 text-ink/15" />
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 md:gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden rounded-xl border-2 transition ${
                i === active
                  ? "border-ink"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/uploads/${img}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
