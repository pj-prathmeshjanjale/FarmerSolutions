import { useState } from "react";

export default function ImageCarousel({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-72 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                No Images
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt="Equipment"
                className="rounded-2xl shadow-lg object-cover w-full h-72"
            />
        );
    }

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="relative group w-full h-72">
            <div
                style={{ backgroundImage: `url(${images[currentIndex]})` }}
                className="w-full h-full rounded-2xl bg-center bg-cover duration-500 shadow-lg"
            ></div>

            {/* Left Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition">
                <button onClick={prevSlide} type="button">❮</button>
            </div>

            {/* Right Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition">
                <button onClick={nextSlide} type="button">❯</button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`
              transition-all duration-300 cursor-pointer rounded-full
              ${currentIndex === slideIndex ? "w-3 h-3 bg-white" : "w-2 h-2 bg-white/50"}
            `}
                    ></div>
                ))}
            </div>
        </div>
    );
}
