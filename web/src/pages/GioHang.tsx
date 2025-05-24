import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Medicine {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  quantity?: number;
}

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

const getCartKey = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user ? `cart_${user.email}` : "cart_guest";
};

const GioHang: React.FC = () => {
  const [cart, setCart] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const cartRaw = localStorage.getItem(getCartKey());
    if (cartRaw) {
      const cartData: { id: number; quantity: number }[] = JSON.parse(cartRaw);
      if (cartData.length > 0) {
        axios
          .get<Medicine[]>("http://localhost:8081/medicines/all")
          .then((res) => {
            const allMeds = res.data;
            const cartMeds: Medicine[] = cartData
              .map((item) => {
                const found = allMeds.find((m) => m.id === item.id);
                if (found) {
                  return {
                    ...found,
                    quantity: item.quantity,
                  };
                }
                return null;
              })
              .filter(Boolean) as Medicine[];
            setCart(cartMeds);
          })
          .catch(() => setCart([]))
.then(() => setLoading(false));      } else {
        setCart([]);
        setLoading(false);
      }
    } else {
      setCart([]);
      setLoading(false);
    }
  }, []);

  const updateCart = (newCart: Medicine[]) => {
    setCart(newCart);
    localStorage.setItem(
      getCartKey(),
      JSON.stringify(
        newCart.map((item) => ({ id: item.id, quantity: item.quantity || 1 }))
      )
    );
  };

  const handleRemove = (id: number) => {
    const newCart = cart.filter((item) => item.id !== id);
    updateCart(newCart);
  };

  const handleChangeQty = (id: number, qty: number) => {
    const newCart = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity:
              qty < 1 ? 1 : qty > item.stockQuantity ? item.stockQuantity : qty,
          }
        : item
    );
    updateCart(newCart);
  };

  const total = cart.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Đặt hàng
  const handleOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      setMessage("Bạn cần đăng nhập để đặt hàng!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!address.trim()) {
      setMessage("Vui lòng nhập địa chỉ giao hàng!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    if (cart.length === 0) {
      setMessage("Giỏ hàng rỗng!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    setPlacingOrder(true);
    try {
      const orderPayload = {
        customerId: user.customerId,
        userId: user.userId,
        shippingAddress: address,
        items: cart.map((item) => ({
          medicineId: item.id,
          quantity: item.quantity,
        })),
        totalAmount: total,
      };
      await axios.post("http://localhost:8081/orders/add", orderPayload);
      setMessage("Đặt hàng thành công! Đơn hàng của bạn đang chờ xác nhận.");
      updateCart([]);
      setTimeout(() => {
        setMessage("");
        navigate("/order");
      }, 2000);
    } catch (err: any) {
      let backendMsg = "";
      if (err.response && err.response.data) {
        backendMsg =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
      }
      setMessage(
        "Có lỗi khi đặt hàng! Vui lòng thử lại." +
          (backendMsg ? `\n${backendMsg}` : "")
      );
      setTimeout(() => setMessage(""), 4000);
    }
    setPlacingOrder(false);
  };

  if (loading)
    return (
      <div className="text-center py-10 text-blue-600 text-lg">Đang tải giỏ hàng...</div>
    );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h1>
      {message && (
        <div className={`mb-4 font-semibold ${message.startsWith("Đặt hàng thành công") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}
      {cart.length === 0 ? (
        <div className="text-gray-500 text-center py-12">Giỏ hàng đang trống.</div>
      ) : (
        <>
          <table className="w-full border mb-8 text-sm">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border px-2 py-1">Ảnh</th>
                <th className="border px-2 py-1">Tên thuốc</th>
                <th className="border px-2 py-1">Giá</th>
                <th className="border px-2 py-1">Số lượng</th>
                <th className="border px-2 py-1">Thành tiền</th>
                <th className="border px-2 py-1">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="text-center">
                  <td className="border px-2 py-1">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-16 h-12 object-contain rounded mx-auto border"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/images/no-image.png";
                      }}
                    />
                  </td>
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1">
                    {item.price.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      min={1}
                      max={item.stockQuantity}
                      value={item.quantity || 1}
                      onChange={(e) =>
                        handleChangeQty(item.id, Number(e.target.value))
                      }
                      className="border w-16 text-center"
                    />
                    <div className="text-xs text-gray-500">
                      (Tồn kho: {item.stockQuantity})
                    </div>
                  </td>
                  <td className="border px-2 py-1 font-semibold text-blue-700">
                    {((item.quantity || 1) * item.price).toLocaleString("vi-VN")}₫
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleRemove(item.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Địa chỉ giao hàng */}
          <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
            <label className="font-semibold min-w-[120px]" htmlFor="address">
              Địa chỉ giao hàng:
            </label>
            <input
              id="address"
              type="text"
              className="border px-3 py-2 rounded flex-1"
              placeholder="Nhập địa chỉ nhận hàng..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>
          {/* Tổng tiền */}
          <div className="flex justify-end items-center gap-6 mb-8">
            <div className="text-lg font-semibold">Tổng cộng:</div>
            <div className="text-2xl font-bold text-blue-800">
              {total.toLocaleString("vi-VN")}₫
            </div>
          </div>
          {/* Đặt hàng */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleOrder}
              disabled={placingOrder}
              className={`bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 font-semibold ${
                placingOrder ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {placingOrder ? "Đang đặt hàng..." : "Đặt hàng"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GioHang;