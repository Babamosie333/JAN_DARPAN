"use client";

export default function ImageLightbox({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) {
  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-zoom-out"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-2xl leading-none"
        aria-label="Close"
      >
        ×
      </button>
      <img
        src={src}
        alt="Full size issue photo"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full rounded-md shadow-lg cursor-default"
      />
    </div>
  );
}
