import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

interface Medicine {
  medicineId?: number;
  id?: number;
  name?: string;
  medicineName?: string;
  dosage?: string;
  price: number;
  stockQuantity?: number;
  quantity?: number;
  expiryDate: string;
  categoryName: string;
  imageUrl?: string;
  description?: string;
  ingredient?: string;
}

const IMAGE_PREFIX = "http://localhost:8081/images/medicines/";

function getImageUrl(imageUrl?: string): string {
  // Xử lý các trường hợp trả về từ backend
  if (!imageUrl) return "/images/no-image.png";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("file:///")) {
    const fileName = imageUrl.split("/").pop();
    return fileName ? IMAGE_PREFIX + fileName : "/images/no-image.png";
  }
  return IMAGE_PREFIX + imageUrl;
}

const MedicinesList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const search = params.get('search')?.toLowerCase() || '';

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  useEffect(() => {
    axios
      .get<Medicine[]>('http://localhost:8081/medicines/all')
      .then((response) => {
        setMedicines(response.data);
        setLoading(false);
      })
      .catch((_error) => {
        setError('Không thể lấy danh sách thuốc.');
        setLoading(false);
      });
  }, []);

  const categories = Array.from(
    new Set(medicines.map((med) => med.categoryName || 'Không xác định'))
  );

  // Lọc theo category trước, sau đó mới search
  const filteredByCategory = selectedCategory === 'Tất cả'
    ? medicines
    : medicines.filter((med) => med.categoryName === selectedCategory);

  const searchedMedicines = search
    ? filteredByCategory.filter(
        (med) =>
          (med.name?.toLowerCase().includes(search) ||
           med.medicineName?.toLowerCase().includes(search) ||
           med.categoryName?.toLowerCase().includes(search))
      )
    : filteredByCategory;

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <div className="flex w-full max-w-7xl mx-auto p-6 gap-8">
      {/* Cột trái: Danh sách loại thuốc */}
      <div className="w-1/4 min-w-[180px] sticky top-0 self-start h-fit">
        <h3 className="text-lg font-bold mb-4 text-blue-800">Loại thuốc</h3>
        <ul>
          <li
            className={`cursor-pointer mb-2 px-3 py-2 rounded hover:bg-blue-100 ${selectedCategory === 'Tất cả' ? 'bg-blue-600 text-white' : ''}`}
            onClick={() => setSelectedCategory('Tất cả')}
          >
            Tất cả
          </li>
          {categories.map((cat) => (
            <li
              key={cat}
              className={`cursor-pointer mb-2 px-3 py-2 rounded hover:bg-blue-100 ${selectedCategory === cat ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>
      {/* Cột phải: Danh sách thuốc */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">
          {search
            ? `Kết quả tìm kiếm cho "${search}"`
            : selectedCategory === 'Tất cả'
              ? 'Tất cả thuốc'
              : `Thuốc thuộc loại "${selectedCategory}"`}
        </h2>
        {searchedMedicines.length === 0 ? (
          <div className="text-center text-gray-500">Không có thuốc nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchedMedicines.map((medicine) => (
              <div
                key={medicine.medicineId || medicine.id}
                className="bg-white p-5 rounded-2xl shadow-md flex flex-col items-start min-w-[240px] max-w-[270px] hover:shadow-xl transition border border-gray-100"
              >
                <img
                  src={getImageUrl(medicine.imageUrl)}
                  alt={medicine.medicineName || medicine.name}
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
                  {/* Tên thuốc */}
                  <div className="font-semibold text-base mb-1">
                    {medicine.name || medicine.medicineName}
                  </div>
                  <div className="text-sm text-blue-600 mb-1">
                    {medicine.categoryName}
                  </div>
                  <div className="font-medium text-gray-700 text-sm mb-2">
                    Giá : <span className="text-blue-600 font-bold">{medicine.price.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
                <button
                  className="w-full mt-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
                  onClick={() => navigate(`/medicines/${medicine.medicineId || medicine.id}`)}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicinesList;