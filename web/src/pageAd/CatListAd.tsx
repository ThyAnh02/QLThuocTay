import React, { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  id: number;
  categoryName: string;
}

const CatListAd: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get<Category[]>("http://localhost:8081/categories/all")
      .then((res) => setCategories(res.data.map(c => ({
        id: c.id ?? (c as any).categoryId, // fallback for backend naming
        categoryName: c.categoryName,
      }))))
      .catch(() => setMessage("Không thể tải danh mục loại thuốc!"));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setMessage("Tên loại thuốc không được để trống!");
      return;
    }
    axios.post("http://localhost:8081/categories/add", { categoryName: newCategoryName })
      .then(() => {
        setNewCategoryName("");
        setMessage("Thêm loại thuốc thành công!");
        fetchCategories();
        setTimeout(() => setMessage(""), 2000);
      })
      .catch(() => setMessage("Có lỗi khi thêm loại thuốc!"));
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.categoryName);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    if (!editingName.trim()) {
      setMessage("Tên loại thuốc không được để trống!");
      return;
    }
    axios.put(`http://localhost:8081/categories/update/${editingId}`, { categoryName: editingName })
      .then(() => {
        setEditingId(null);
        setEditingName("");
        setMessage("Cập nhật loại thuốc thành công!");
        fetchCategories();
        setTimeout(() => setMessage(""), 2000);
      })
      .catch(() => setMessage("Có lỗi khi cập nhật loại thuốc!"));
  };

  const handleDeleteCategory = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa loại thuốc này?")) {
      axios.delete(`http://localhost:8081/categories/delete/${id}`)
        .then(() => {
          setMessage("Xóa loại thuốc thành công!");
          fetchCategories();
          setTimeout(() => setMessage(""), 2000);
        })
        .catch(() => setMessage("Có lỗi khi xóa loại thuốc!"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý loại thuốc</h1>
      {message && <div className="mb-4 text-green-700">{message}</div>}

      {/* Thêm mới loại thuốc */}
      <form className="flex gap-2 mb-6" onSubmit={handleAddCategory}>
        <input
          type="text"
          className="border px-2 py-1 rounded flex-1"
          placeholder="Tên loại thuốc mới"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" type="submit">
          Thêm
        </button>
      </form>

      {/* Bảng danh mục */}
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border px-2 py-1 w-20">ID</th>
            <th className="border px-2 py-1">Tên loại thuốc</th>
            <th className="border px-2 py-1 w-40">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id} className="text-center">
              <td className="border px-2 py-1">{cat.id}</td>
              <td className="border px-2 py-1">
                {editingId === cat.id ? (
                  <form onSubmit={handleUpdateCategory} className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      className="border px-2 py-1 rounded"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded">
                      Lưu
                    </button>
                    <button type="button" className="bg-gray-400 text-white px-2 py-1 rounded"
                      onClick={() => { setEditingId(null); setEditingName(""); }}>
                      Hủy
                    </button>
                  </form>
                ) : (
                  cat.categoryName
                )}
              </td>
              <td className="border px-2 py-1">
                {editingId !== cat.id && (
                  <>
                    <button
                      className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleEditCategory(cat)}
                    >
                      Sửa
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr><td colSpan={3} className="py-4 text-center text-gray-500">Chưa có loại thuốc nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CatListAd;