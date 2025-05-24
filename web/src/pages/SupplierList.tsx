import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Supplier {
  supplierId: number;
  supplierName: string;
  contactName: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
}

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<Supplier[]>('http://localhost:8081/suppliers/all')
      .then((response) => {
        setSuppliers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(`Không thể lấy danh sách nhà cung cấp: ${error.message}`);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600">Đang tải danh sách nhà cung cấp...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Lỗi: {error}</div>;
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center text-gray-600">
        Không có nhà cung cấp nào trong danh sách. Vui lòng kiểm tra dữ liệu hoặc thêm nhà cung cấp mới.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Danh Sách Nhà Cung Cấp</h1>

      {/* Nút Thêm / Chỉnh sửa luôn hiển thị */}
      <div className="text-center mb-6">
        <button
          onClick={() => navigate('/editsuplier')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Thêm / Chỉnh sửa Nhà Cung Cấp
        </button>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <div
            key={supplier.supplierId}
            className="border rounded-lg p-4 shadow-md hover:shadow-lg transition bg-white"
          >
            <h2 className="text-xl font-semibold text-blue-800">{supplier.supplierName}</h2>
            <p className="text-gray-600">Người liên hệ: {supplier.contactName || 'N/A'}</p>
            <p className="text-gray-600">Số điện thoại: {supplier.phoneNumber || 'N/A'}</p>
            <p className="text-gray-600">Email: {supplier.email || 'N/A'}</p>
            <p className="text-gray-600">Địa chỉ: {supplier.address || 'N/A'}</p>
            {/* Nút chỉnh sửa từng nhà cung cấp luôn hiển thị */}
            <button
              onClick={() => navigate(`/editsuplier/${supplier.supplierId}`)}
              className="mt-3 bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
            >
              Chỉnh sửa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierList;