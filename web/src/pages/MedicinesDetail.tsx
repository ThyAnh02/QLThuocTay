import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Medicine {
  id?: number;
  medicineId?: number;
  name?: string;
  medicineName?: string;
  categoryName?: string;
  price: number;
  imageUrl?: string;
  description?: string;
  ingredient?: string;
  dosage?: string;
  expiryDate?: string;
  stockQuantity?: number;
}

const tabList = [
  { key: 'description', label: 'Giới thiệu chung' },
  { key: 'ingredient', label: 'Thành phần' },
];

const IMAGE_PREFIX = "http://localhost:8081/images/medicines/";

function getImageUrl(imageUrl?: string) {
  if (!imageUrl) return "/images/no-image.png";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("file:///")) {
    const fileName = imageUrl.split("/").pop();
    return fileName ? IMAGE_PREFIX + fileName : "/images/no-image.png";
  }
  return IMAGE_PREFIX + imageUrl;
}

function getCartKey() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user ? `cart_${user.email}` : "cart_guest";
}

// Thêm vào giỏ hàng (localStorage)
function addToCart(med: Medicine, quantity: number = 1) {
  const id = med.id !== undefined ? med.id : med.medicineId;
  if (typeof id !== "number") {
    return; // hoặc alert("Không thể thêm thuốc này vào giỏ hàng!");
  }
  const cartRaw = localStorage.getItem(getCartKey());
  let cart: { id: number; quantity: number }[] = [];
  if (cartRaw) cart = JSON.parse(cartRaw);
  const idx = cart.findIndex((item) => item.id === id);
  if (idx !== -1) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({ id, quantity });
  }
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

const MedicinesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [related, setRelated] = useState<Medicine[]>([]);
  const [addMsg, setAddMsg] = useState<string>("");

  useEffect(() => {
    axios.get<Medicine>(`http://localhost:8081/medicines/${id}`)
      .then(res => setMedicine(res.data))
      .catch(() => setMedicine(null));
  }, [id]);

  // Lấy sản phẩm cùng nhóm công dụng (ví dụ cùng category)
  useEffect(() => {
    if (medicine?.categoryName) {
      axios.get<Medicine[]>(`http://localhost:8081/medicines/all`)
        .then(res => {
          const filtered = res.data.filter(
            (item: Medicine) =>
              item.categoryName === medicine.categoryName &&
              (item.id || item.medicineId) !== (medicine.id || medicine.medicineId)
          );
          setRelated(filtered);
        });
    }
  }, [medicine]);

  // Thêm vào giỏ hàng (check đăng nhập)
  const handleAddToCart = (med: Medicine) => {
    const user = localStorage.getItem("user");
    if (!user) {
      setAddMsg("Bạn cần đăng nhập để mua hàng!");
      setTimeout(() => {
        setAddMsg("");
        navigate("/login");
      }, 1200);
      return;
    }
    addToCart(med, 1);
    setAddMsg("Đã thêm vào giỏ hàng!");
    setTimeout(() => setAddMsg(""), 1200);
  };

  if (!medicine) {
    return <div className="text-center py-10 text-gray-500">Không tìm thấy thông tin thuốc.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Thông tin cơ bản */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 bg-white rounded-2xl shadow-lg p-8">
        <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center items-center">
          <img
            src={getImageUrl(medicine.imageUrl)}
            alt={medicine.name || medicine.medicineName}
            className="w-80 h-80 object-contain rounded-xl border shadow"
            onError={e => { (e.currentTarget as HTMLImageElement).src = "/images/no-image.png"; }}
          />
        </div>
        <div className="flex-1 w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-3 text-blue-900">
            {medicine.name || medicine.medicineName}
          </h1>
          <div className="mb-2 text-base text-gray-600">
            <span className="font-semibold text-gray-700">Danh mục:</span> {medicine.categoryName}
          </div>
          {medicine.dosage && (
            <div className="mb-2 text-base text-gray-600">
              <span className="font-semibold text-gray-700">Hàm lượng:</span> {medicine.dosage}
            </div>
          )}
          {medicine.expiryDate && (
            <div className="mb-2 text-base text-gray-600">
              <span className="font-semibold text-gray-700">Hạn sử dụng:</span> {medicine.expiryDate}
            </div>
          )}
          <div className="my-4">
            <span className="text-lg font-semibold text-gray-700">Giá niêm yết:</span>
            <span className="text-2xl font-bold text-blue-700 ml-2">{medicine.price.toLocaleString('vi-VN')}₫</span>
          </div>
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-lg transition mb-2"
            onClick={() => handleAddToCart(medicine)}
          >
            Thêm vào giỏ hàng
          </button>
          {addMsg && <span className="ml-4 text-green-600 font-semibold">{addMsg}</span>}
        </div>
      </div>

      {/* Tabs Giới thiệu & Thành phần */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row max-w-7xl mx-auto">
        {/* Sidebar tab */}
        <div className="md:w-1/4 border-b md:border-b-0 md:border-r">
          <ul>
            {tabList.map(tab => (
              <li
                key={tab.key}
                className={`cursor-pointer px-6 py-4 text-lg font-medium border-l-4 ${
                  activeTab === tab.key
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </div>
        {/* Nội dung tab */}
        <div className="flex-1 p-8">
          {activeTab === 'description' && (
            <div>
              <h2 className="text-2xl font-bold text-blue-700 mb-4">GIỚI THIỆU CHUNG</h2>
              <div className="text-gray-800 whitespace-pre-line" style={{ lineHeight: '1.7' }}>
                {medicine.description || 'Chưa có thông tin.'}
              </div>
            </div>
          )}
          {activeTab === 'ingredient' && (
            <div>
              <h2 className="text-2xl font-bold text-blue-700 mb-4">THÀNH PHẦN</h2>
              <div className="text-gray-800 whitespace-pre-line" style={{ lineHeight: '1.7' }}>
                {medicine.ingredient || 'Chưa có thông tin.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sản phẩm cùng nhóm công dụng */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Sản phẩm cùng nhóm công dụng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {related.length === 0 && (
            <div className="col-span-full text-gray-500">Không có sản phẩm cùng nhóm.</div>
          )}
          {related.map(item => (
            <div
              key={item.id || item.medicineId}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center border hover:shadow-lg transition"
            >
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.name || item.medicineName}
                className="w-32 h-32 object-contain mb-2"
                onError={e => { (e.currentTarget as HTMLImageElement).src = "/images/no-image.png"; }}
              />
              <div className="font-semibold text-base text-center mb-1 line-clamp-2">{item.name || item.medicineName}</div>
              <div className="text-sm text-blue-600 mb-1">{item.categoryName}</div>
              <div className="font-medium text-gray-700 text-sm mb-2">
                Giá: <span className="text-blue-600 font-bold">{item.price.toLocaleString('vi-VN')}₫</span>
              </div>
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition mb-2"
                onClick={() => handleAddToCart(item)}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                onClick={() => navigate(`/medicines/${item.id || item.medicineId}`)}
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

export default MedicinesDetail;