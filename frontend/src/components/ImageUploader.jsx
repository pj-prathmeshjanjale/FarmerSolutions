import { useState, useRef } from "react";

export default function ImageUploader({ onImagesSelected }) {
    const [previews, setPreviews] = useState([]);
    const galleryInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Create preview URLs
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);

        // Pass files to parent
        onImagesSelected(files);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {/* Gallery Button */}
                <button
                    type="button"
                    onClick={() => galleryInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                >
                    📂 Select Photos
                </button>

                {/* Camera Button */}
                <button
                    type="button"
                    onClick={() => cameraInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                    📸 Take Photo
                </button>

                {/* Hidden Input: Gallery (Multiple) */}
                <input
                    type="file"
                    ref={galleryInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Hidden Input: Camera (Single capture - usually) */}
                {/* Note: 'capture' attribute forces camera on mobile */}
                <input
                    type="file"
                    ref={cameraInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {previews.map((src, idx) => (
                        <div key={idx} className="relative w-24 h-24 shrink-0 group">
                            <img
                                src={src}
                                alt={`preview-${idx}`}
                                className="w-full h-full object-cover rounded-lg border shadow-sm"
                            />
                            <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md opacity-90 hover:opacity-100"
                                onClick={() => {
                                    // Visual removal only for MVP 
                                    const newPreviews = previews.filter((_, i) => i !== idx);
                                    setPreviews(newPreviews);
                                    // Note: Actual file removal from state requires uplifted state management
                                    // Ideally parent clears/manages state completely.
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
