import React, { useEffect, useState } from "react";
import axios from "axios";

interface OrderItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  orderId: number;
  createAt: string;
  statusId: number;
  statusName: string;
  totalAmount: number;
  orderDetails: OrderItem[];
}

const STATUS_LABELS: Record<number, string> = {
  1: "Đang chờ xác nhận",
  2: "Đang vận chuyển",
  3: "Giao hàng thành công",
};
const STATUS_COLORS: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-700 border-yellow-400",
  2: "bg-blue-100 text-blue-700 border-blue-400",
  3: "bg-green-100 text-green-700 border-green-400",
};

const IMAGE_PREFIX = "http://localhost:8081/images/medicines/";

// Trả về đường dẫn ảnh đúng chuẩn
function getImageUrl(imageUrl?: string) {
  if (!imageUrl) return "/images/no-image.png";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return IMAGE_PREFIX + imageUrl;
}

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  // Lưu trạng thái lỗi ảnh cho từng item duy nhất bằng orderId-medicineId
  const [errorImages, setErrorImages] = useState<{ [key: string]: boolean }>({});
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setMessage("Bạn cần đăng nhập để xem đơn hàng.");
      return;
    }
    axios
      .get<Order[]>(`http://localhost:8081/orders/user/${encodeURIComponent(user.email)}`)
      .then((res) => {
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Không thể tải đơn hàng!");
        setLoading(false);
      });
  }, [user]);

  // Tạo key duy nhất cho mỗi ảnh theo orderId-medicineId để tránh lỗi khi nhiều đơn có cùng thuốc
  const getImgKey = (orderId: number, medicineId: number) => `${orderId}-${medicineId}`;

  const getImgSrc = (orderId: number, item: OrderItem) => {
    const key = getImgKey(orderId, item.medicineId);
    if (errorImages[key]) return "/images/no-image.png";
    return getImageUrl(item.imageUrl);
  };

  const handleImgError = (orderId: number, medicineId: number) => {
    const key = getImgKey(orderId, medicineId);
    setErrorImages((prev) => ({ ...prev, [key]: true }));
  };

  if (loading) {
    return <div className="text-center py-10 text-blue-600 text-lg">Đang tải đơn hàng...</div>;
  }
  if (!user) {
    return <div className="text-center py-10 text-gray-500">{message}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của bạn</h1>
      {message && <div className="mb-4 text-red-600 font-semibold">{message}</div>}
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.orderId} className="border rounded-lg shadow bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b">
                <div className="font-semibold text-lg text-blue-900">
                  Mã đơn: #{order.orderId}
                </div>
                <div
                  className={`px-3 py-1 rounded-full border font-medium text-sm mt-2 sm:mt-0 ${STATUS_COLORS[order.statusId]}`}
                >
                  {STATUS_LABELS[order.statusId] || order.statusName}
                </div>
                <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                  Ngày đặt: {new Date(order.createAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="py-2 px-2">Ảnh</th>
                      <th className="py-2 px-2">Tên thuốc</th>
                      <th className="py-2 px-2">Số lượng</th>
                      <th className="py-2 px-2">Đơn giá</th>
                      <th className="py-2 px-2">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.orderDetails || []).map((item, idx) => (
                      <tr key={item.medicineId + "-" + idx} className="border-t">
                        <td className="py-2 px-2">
                          <img
                            src={getImgSrc(order.orderId, item)}
                            alt={item.medicineName}
                            className="w-14 h-10 object-contain border rounded"
                            onError={() => handleImgError(order.orderId, item.medicineId)}
                          />
                        </td>
                        <td className="py-2 px-2">{item.medicineName}</td>
                        <td className="py-2 px-2">{item.quantity}</td>
                        <td className="py-2 px-2">
                          {item.price.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="py-2 px-2 font-semibold text-blue-700">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-4">
                  <span className="text-lg font-bold text-blue-900">Tổng cộng: </span>
                  <span className="text-xl font-bold text-orange-600 ml-4">
                    {order.totalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;