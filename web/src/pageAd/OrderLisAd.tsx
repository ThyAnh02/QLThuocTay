import { useEffect, useState } from "react";
import axios from "axios";

interface OrderDetail {
  orderId: number | null;
  medicineId: number;
  medicineName: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: number;
  userId: number;
  userName: string;
  totalAmount: number;
  createAt: string;
  statusId: number;
  statusName: "Pending" | "Processing" | "Completed" | string;
  shippingAddress: string | null;
  orderDetails: OrderDetail[];
}

// Map status name to label
const statusLabels: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Processing: "Đang vận chuyển",
  Completed: "Thành công",
};

const OrderListAd = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get<Order[]>("http://localhost:8081/orders/all")
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Không thể tải danh sách đơn hàng!");
        setLoading(false);
      });
  };

  // Xác nhận đơn hàng (Pending -> Processing)
  const handleConfirm = (orderId: number) => {
    if (!window.confirm("Xác nhận đơn hàng này?")) return;
    axios
      .put(`http://localhost:8081/orders/confirm/${orderId}`)
      .then(() => {
        setMessage("Đã xác nhận đơn hàng.");
        fetchOrders();
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(() => setMessage("Có lỗi khi xác nhận đơn hàng!"));
  };

  // Chuyển trạng thái sang Completed
  const handleComplete = (orderId: number) => {
    if (!window.confirm("Chuyển đơn hàng này sang trạng thái Thành công?")) return;
    axios
      .put(`http://localhost:8081/orders/complete/${orderId}`)
      .then(() => {
        setMessage("Đơn hàng đã được chuyển sang Thành công.");
        fetchOrders();
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(() => setMessage("Có lỗi khi chuyển trạng thái!"));
  };

  // Huỷ đơn
  const handleCancel = (orderId: number) => {
    if (!window.confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
    axios
      .put(`http://localhost:8081/orders/cancel/${orderId}`)
      .then(() => {
        setMessage("Đơn hàng đã bị huỷ.");
        fetchOrders();
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(() => setMessage("Có lỗi khi huỷ đơn hàng!"));
  };

  // Lọc đơn hàng theo trạng thái
  const pendingOrders = orders.filter((o) => o.statusName === "Pending");
  const processingOrders = orders.filter((o) => o.statusName === "Processing");
  const completedOrders = orders.filter((o) => o.statusName === "Completed");

  // Hiển thị một bảng đơn hàng
  const renderOrderTable = (
    title: string,
    list: Order[],
    actions: (order: Order) => React.ReactNode
  ) => (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {list.length === 0 ? (
        <div className="text-gray-500">Không có đơn nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border px-2 py-1">Mã ĐH</th>
                <th className="border px-2 py-1">Khách hàng</th>
                <th className="border px-2 py-1">SĐT</th>
                <th className="border px-2 py-1">Địa chỉ</th>
                <th className="border px-2 py-1">Ngày đặt</th>
                <th className="border px-2 py-1">Tổng tiền</th>
                <th className="border px-2 py-1">Trạng thái</th>
                <th className="border px-2 py-1">Chi tiết</th>
                <th className="border px-2 py-1">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr key={order.orderId} className="text-center">
                  <td className="border px-2 py-1">{order.orderId}</td>
                  <td className="border px-2 py-1">{order.userName}</td>
                  <td className="border px-2 py-1">{order.userId}</td>
                  <td className="border px-2 py-1">
                    {order.shippingAddress || "(Chưa cập nhật)"}
                  </td>
                  <td className="border px-2 py-1">
                    {order.createAt.slice(0, 10)}
                  </td>
                  <td className="border px-2 py-1">
                    {order.totalAmount.toLocaleString()}₫
                  </td>
                  <td className="border px-2 py-1">
                    {statusLabels[order.statusName] || order.statusName}
                  </td>
                  <td className="border px-2 py-1">
                    <details>
                      <summary className="cursor-pointer text-blue-700">Xem</summary>
                      <ul className="text-left mt-1">
                        {order.orderDetails.map((item) => (
                          <li key={item.medicineId}>
                            {item.medicineName} x {item.quantity} (
                            {item.price.toLocaleString()}₫)
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td className="border px-2 py-1 flex flex-col gap-1 items-center">
                    {actions(order)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
      {message && <div className="mb-4 text-green-700">{message}</div>}

      {renderOrderTable(
        "Đơn chờ xác nhận",
        pendingOrders,
        (order) => (
          <>
            <button
              onClick={() => handleConfirm(order.orderId)}
              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
            >
              Xác nhận
            </button>
            <button
              onClick={() => handleCancel(order.orderId)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Huỷ
            </button>
          </>
        )
      )}

      {renderOrderTable(
        "Đơn đang vận chuyển",
        processingOrders,
        (order) => (
          <>
            <button
              onClick={() => handleComplete(order.orderId)}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Đánh dấu thành công
            </button>
            <button
              onClick={() => handleCancel(order.orderId)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Huỷ
            </button>
          </>
        )
      )}

      {renderOrderTable(
        "Đơn thành công",
        completedOrders,
        () => <span className="text-green-700 font-semibold">✔</span>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white px-8 py-4 rounded shadow">Đang tải...</div>
        </div>
      )}
    </div>
  );
};

export default OrderListAd;