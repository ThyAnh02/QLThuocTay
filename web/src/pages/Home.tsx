import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const banners = [
  '/images/Banner/banner1.jpg',
  '/images/Banner/banner2.jpg',
  '/images/Banner/banner3.jpg'
];

const IMAGE_PREFIX = "http://localhost:8081/images/medicines/";

function getImageUrl(imageUrl?: string): string {
  if (!imageUrl) return "/images/no-image.png";
  if (typeof imageUrl !== "string") return "/images/no-image.png";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("file:///")) {
    const fileName = imageUrl.split("/").pop();
    return fileName ? IMAGE_PREFIX + fileName : "/images/no-image.png";
  }
  return IMAGE_PREFIX + imageUrl;
}

const Home: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [medicines, setMedicines] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8081/medicines/all')
      .then(res => res.json())
      .then(data => {
        setMedicines(data);
      })
      .catch(() => setMedicines([]));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
        setFade(true);
      }, 1000);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full h-64 sm:h-80 lg:h-96 relative overflow-hidden">
        <img
          src={banners[current]}
          alt={`Banner ${current + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 0.5s' }}
        />
        {/* Nút chuyển banner trái */}
        <button
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 shadow-lg hover:bg-blue-600 hover:text-white transition-colors rounded-full w-12 h-12 flex items-center justify-center z-10 border-2 border-blue-200"
          onClick={() => {
            setFade(false);
            setTimeout(() => {
              setCurrent((current - 1 + banners.length) % banners.length);
              setFade(true);
            }, 400);
          }}
          aria-label="Trước"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Nút chuyển banner phải */}
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 shadow-lg hover:bg-blue-600 hover:text-white transition-colors rounded-full w-12 h-12 flex items-center justify-center z-10 border-2 border-blue-200"
          onClick={() => {
            setFade(false);
            setTimeout(() => {
              setCurrent((current + 1) % banners.length);
              setFade(true);
            }, 400);
          }}
          aria-label="Sau"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full border-2 border-white ${idx === current ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
      {/* Danh sách thuốc 1 hàng ngang, chỉ 5 thuốc */}
      <div className="w-full max-w-7xl mt-10 px-4">
        <h3 className="text-2xl font-bold mb-8 text-blue-900 text-center tracking-wide">DANH SÁCH THUỐC</h3>
        <div className="flex flex-row gap-6 justify-center">
          {medicines.slice(0, 5).map((med) => (
            <div
              key={med.id ?? med.medicineId}
              className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-start min-w-[240px] max-w-[260px] hover:shadow-xl transition border border-gray-100"
            >
              <img
                src={getImageUrl(med.imageUrl)}
                alt={med.name || med.medicineName}
                className="w-36 h-36 object-contain mb-4 mx-auto"
                onError={e => {
                  if (
                    e.currentTarget.src !== window.location.origin + "/images/no-image.png" &&
                    !e.currentTarget.dataset.fallback
                  ) {
                    e.currentTarget.src = "/images/no-image.png";
                    e.currentTarget.dataset.fallback = "1";
                  }
                }}
              />
              <div className="flex flex-col flex-1 w-full">
                <div className="font-semibold text-base mb-1 line-clamp-2">{med.name || med.medicineName}</div>
                <div className="text-blue-700 text-sm mb-1">{med.supplierName || med.categoryName || ''}</div>
                <div className="font-medium text-gray-700 text-sm mb-2">
                  Giá : <span className="text-blue-600 font-bold">{med.price?.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
              <button
                className="w-full mt-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
                onClick={() => navigate(`/medicines/${med.id ?? med.medicineId}`)}
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;