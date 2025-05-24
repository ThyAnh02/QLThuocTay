import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Supplier {
  supplierId: number;
  supplierName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  address: string;
}

interface SupplierForm {
  supplierName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  address: string;
}

const EditSupplier: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierForm>({
    supplierName: '',
    contactName: '',
    phoneNumber: '',
    email: '',
    address: '',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const resetForm = () => {
    setForm({
      supplierName: '',
      contactName: '',
      phoneNumber: '',
      email: '',
      address: '',
    });
    setEditId(null);
    setFormError(null);
  };

  useEffect(() => {
    axios
      .get<Supplier[]>('http://localhost:8081/suppliers/all')
      .then((res) => {
        setSuppliers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Không thể lấy danh sách nhà cung cấp: ${err.message}`);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (successMessage || formError) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setFormError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, formError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.supplierName || !form.phoneNumber) {
      setFormError('Tên nhà cung cấp và số điện thoại là bắt buộc.');
      return;
    }

    try {
      if (editId !== null) {
        await axios.put(`http://localhost:8081/suppliers/update/${editId}`, form);
        setSuppliers((prev) =>
          prev.map((sup) =>
            sup.supplierId === editId ? { ...sup, ...form, supplierId: editId } : sup
          )
        );
        setSuccessMessage('Cập nhật nhà cung cấp thành công!');
      } else {
        const response = await axios.post('http://localhost:8081/suppliers/add', form);
        setSuppliers((prev) => [...prev, response.data as Supplier]);
        setSuccessMessage('Thêm nhà cung cấp thành công!');
      }
      resetForm();
    } catch (err) {
      setFormError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setForm({
      supplierName: supplier.supplierName,
      contactName: supplier.contactName,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email,
      address: supplier.address,
    });
    setEditId(supplier.supplierId);
    setSuccessMessage(null);
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) return;

    try {
      await axios.delete(`http://localhost:8081/suppliers/delete/${id}`);
      setSuppliers((prev) => prev.filter((sup) => sup.supplierId !== id));
      setSuccessMessage('Xóa nhà cung cấp thành công!');
    } catch (err) {
      setFormError('Không thể xóa nhà cung cấp. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className="text-center py-10 text-blue-900">Đang tải...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Quản Lý Nhà Cung Cấp</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          {editId !== null ? 'Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Tên Nhà Cung Cấp *" name="supplierName" value={form.supplierName} onChange={handleInputChange} required />
            <InputField label="Người Liên Hệ" name="contactName" value={form.contactName} onChange={handleInputChange} />
            <InputField label="Số Điện Thoại *" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} required />
            <InputField label="Email" type="email" name="email" value={form.email} onChange={handleInputChange} />
            <InputField label="Địa Chỉ" name="address" value={form.address} onChange={handleInputChange} fullWidth />
          </div>
          {formError && <p className="mt-2 text-red-500 text-sm">{formError}</p>}
          {successMessage && <p className="mt-2 text-green-600 text-sm">{successMessage}</p>}
          <div className="mt-4 flex space-x-2">
            <button
              type="submit"
              className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {editId !== null ? 'Cập Nhật' : 'Thêm'}
            </button>
            {editId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-sm">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="py-2 px-4 border-b text-left">Tên Nhà Cung Cấp</th>
              <th className="py-2 px-4 border-b text-left">Người Liên Hệ</th>
              <th className="py-2 px-4 border-b text-left">Số Điện Thoại</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Địa Chỉ</th>
              <th className="py-2 px-4 border-b text-left">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <tr key={supplier.supplierId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{supplier.supplierName}</td>
                  <td className="py-2 px-4 border-b">{supplier.contactName || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{supplier.phoneNumber}</td>
                  <td className="py-2 px-4 border-b">{supplier.email || 'N/A'}</td>
                  <td className="py-2 px-4 border-b truncate max-w-xs" title={supplier.address}>
                    {supplier.address || 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-500 transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.supplierId)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-2 px-4 text-center">
                  Không có nhà cung cấp nào trong danh sách.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/admin/suppliers')}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  fullWidth?: boolean;
}> = ({ label, name, value, onChange, required, type = 'text', fullWidth }) => (
  <div className={fullWidth ? 'md:col-span-2' : ''}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
    />
  </div>
);

export default EditSupplier;
