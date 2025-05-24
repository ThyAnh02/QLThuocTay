import React, { useEffect, useState } from "react";
import axios from "axios";

interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryName?: string;
  imageUrl?: string | File | null;
  dosage?: string;
  stockQuantity?: number;
  expiryDate?: string;
  ingredient?: string;
  categoryId?: number;
  supplierId?: number;
  supplierName?: string;
}

interface Supplier {
  id: number;
  name: string;
}

const IMAGE_PREFIX = "http://localhost:8081/images/medicines/";

function getImageUrl(imageUrl?: string | File | null): string {
  if (!imageUrl) return "/images/no-image.png";
  // Nếu là file upload (object File)
  if (typeof imageUrl === "object") {
    return URL.createObjectURL(imageUrl as File);
  }
  // Nếu là URL tuyệt đối
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  // Nếu là tên file trả về từ backend
  return IMAGE_PREFIX + imageUrl;
}

const MedListAd = () => {
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [newMed, setNewMed] = useState<Partial<Medicine>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    dosage: "",
    stockQuantity: 0,
    expiryDate: "",
    ingredient: "",
    categoryId: undefined,
    supplierId: undefined,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    fetchMeds();
    axios
      .get<Array<{ supplierId: number; supplierName: string }>>(
        "http://localhost:8081/suppliers/all"
      )
      .then((res) => {
        setSuppliers(
          res.data.map((sup) => ({
            id: sup.supplierId,
            name: sup.supplierName,
          }))
        );
      })
      .catch(() => setSuppliers([]));
    axios
      .get<Array<{ categoryId: number; categoryName: string }>>(
        "http://localhost:8081/categories/all"
      )
      .then((res) => {
        setCategories(
          res.data.map((cat) => ({
            id: cat.categoryId,
            name: cat.categoryName,
          }))
        );
      })
      .catch(() => setCategories([]));
  }, []);

  const fetchMeds = () => {
    axios
      .get<Medicine[]>("http://localhost:8081/medicines/all")
      .then((res) => {
        setMeds(res.data);
      })
      .catch(() => setMessage("Không thể tải danh sách thuốc!"));
  };

  // Xử lý submit thêm/sửa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newMed.name ||
      !newMed.price ||
      !newMed.stockQuantity ||
      !newMed.dosage ||
      !newMed.expiryDate ||
      !newMed.categoryId ||
      !newMed.supplierId
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const hasImage = newMed.imageUrl && typeof newMed.imageUrl !== "string";
    if (editingId) {
      if (hasImage) {
        // Nếu có file mới, PUT multipart lên endpoint update-with-image
        const formData = new FormData();
        formData.append("name", newMed.name as string);
        formData.append("description", newMed.description || "");
        formData.append("price", String(newMed.price));
        formData.append("dosage", newMed.dosage ? `${newMed.dosage}` : "");
        formData.append("quantity", String(newMed.stockQuantity));
        formData.append("expiryDate", newMed.expiryDate || "");
        formData.append("ingredient", newMed.ingredient || "");
        formData.append("categoryId", String(newMed.categoryId));
        formData.append("supplierId", String(newMed.supplierId));
        formData.append("image", newMed.imageUrl as File);

        axios.put(`http://localhost:8081/medicines/update-with-image/${editingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(() => {
            fetchMeds();
            resetForm();
            setMessage("Cập nhật thuốc thành công!");
            setTimeout(() => setMessage(""), 3000);
          })
          .catch((error) => {
            let errMsg = "Có lỗi khi cập nhật thuốc! ";
            if (error.response) {
              if (error.response.data) {
                if (typeof error.response.data === "string") {
                  errMsg += error.response.data;
                } else if (typeof error.response.data === "object") {
                  errMsg += JSON.stringify(error.response.data);
                }
              } else {
                errMsg += `Status: ${error.response.status}`;
              }
            } else if (error.message) {
              errMsg += error.message;
            } else {
              errMsg += "Lỗi không xác định!";
            }
            setMessage(errMsg);
            setTimeout(() => setMessage(""), 6000);
          });
      } else {
        // Không đổi ảnh, PUT JSON (imageUrl là tên file cũ)
        const selectedCategory = categories.find(c => c.id === newMed.categoryId);
        const selectedSupplier = suppliers.find(s => s.id === newMed.supplierId);

        const payload = {
          medicineName: newMed.name,
          description: newMed.description,
          price: newMed.price,
          dosage: newMed.dosage,
          stockQuantity: newMed.stockQuantity,
          expiryDate: newMed.expiryDate,
          imageUrl: typeof newMed.imageUrl === "string" ? newMed.imageUrl : undefined,
          ingredient: newMed.ingredient,
          category: selectedCategory
            ? { id: selectedCategory.id, categoryName: selectedCategory.name }
            : undefined,
          supplier: selectedSupplier
            ? { id: selectedSupplier.id, name: selectedSupplier.name }
            : undefined,
        };

        axios
          .put(`http://localhost:8081/medicines/update/${editingId}`, payload)
          .then(() => {
            fetchMeds();
            resetForm();
            setMessage("Cập nhật thuốc thành công!");
            setTimeout(() => setMessage(""), 3000);
          })
          .catch((error) => {
            let errMsg = "Có lỗi khi cập nhật thuốc! ";
            if (error.response) {
              if (error.response.data) {
                if (typeof error.response.data === "string") {
                  errMsg += error.response.data;
                } else if (typeof error.response.data === "object") {
                  errMsg += JSON.stringify(error.response.data);
                }
              } else {
                errMsg += `Status: ${error.response.status}`;
              }
            } else if (error.message) {
              errMsg += error.message;
            } else {
              errMsg += "Lỗi không xác định!";
            }
            setMessage(errMsg);
            setTimeout(() => setMessage(""), 6000);
          });
      }
    } else {
      // Thêm mới
      const formData = new FormData();
      formData.append("name", newMed.name as string);
      formData.append("description", newMed.description || "");
      formData.append("price", String(newMed.price));
      formData.append("dosage", newMed.dosage ? `${newMed.dosage}` : "");
      formData.append("quantity", String(newMed.stockQuantity));
      formData.append("expiryDate", newMed.expiryDate || "");
      formData.append("ingredient", newMed.ingredient || "");
      formData.append("categoryId", String(newMed.categoryId));
      formData.append("supplierId", String(newMed.supplierId));
      if (hasImage) {
        formData.append("image", newMed.imageUrl as File);
      }

      axios
        .post("http://localhost:8081/medicines/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          fetchMeds();
          resetForm();
          setMessage("Thêm thuốc thành công!");
          setTimeout(() => setMessage(""), 3000);
        })
        .catch((error) => {
          let errMsg = "Có lỗi khi thêm thuốc! ";
          if (error.response) {
            if (error.response.data) {
              if (typeof error.response.data === "string") {
                errMsg += error.response.data;
              } else if (typeof error.response.data === "object") {
                errMsg += JSON.stringify(error.response.data);
              }
            } else {
              errMsg += `Status: ${error.response.status}`;
            }
          } else if (error.message) {
            errMsg += error.message;
          } else {
            errMsg += "Lỗi không xác định!";
          }
          setMessage(errMsg);
          setTimeout(() => setMessage(""), 6000);
        });
    }
  };

  // Xử lý xóa thuốc
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa thuốc này?")) {
      axios
        .delete(`http://localhost:8081/medicines/delete/${id}`)
        .then(() => {
          fetchMeds();
          setMessage("Xóa thuốc thành công!");
          setTimeout(() => setMessage(""), 3000);
        })
        .catch((error) => {
          let errMsg = "Có lỗi khi xóa thuốc! ";
          if (error.response) {
            if (error.response.data) {
              if (typeof error.response.data === "string") {
                errMsg += error.response.data;
              } else if (typeof error.response.data === "object") {
                errMsg += JSON.stringify(error.response.data);
              }
            } else {
              errMsg += `Status: ${error.response.status}`;
            }
          } else if (error.message) {
            errMsg += error.message;
          } else {
            errMsg += "Lỗi không xác định!";
          }
          setMessage(errMsg);
          setTimeout(() => setMessage(""), 6000);
        });
    }
  };

  // Xử lý khi bấm Sửa
  const handleEdit = (med: Medicine) => {
    setEditingId(med.id);
    setNewMed({
      name: med.name,
      description: med.description,
      price: med.price,
      imageUrl: typeof med.imageUrl === "string" ? med.imageUrl : "", // giữ tên file cũ
      dosage: med.dosage,
      stockQuantity: med.stockQuantity,
      expiryDate: med.expiryDate,
      ingredient: med.ingredient,
      categoryId: categories.find((c) => c.name === med.categoryName)?.id,
      supplierId: suppliers.find((s) => s.name === med.supplierName)?.id,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewMed({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      dosage: "",
      stockQuantity: 0,
      expiryDate: "",
      ingredient: "",
      categoryId: undefined,
      supplierId: undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách thuốc</h1>
      {message && <div className="mb-4 text-green-700">{message}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex gap-2 flex-wrap flex-col md:flex-row"
      >
        <div className="flex gap-2 flex-wrap">
          <input
            className="border px-2 py-1 rounded flex-1"
            placeholder="Tên thuốc"
            value={newMed.name || ""}
            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
          />
          <input
            className="border px-2 py-1 rounded flex-1"
            placeholder="Giá"
            type="number"
            step={1000}
            value={newMed.price || ""}
            onChange={(e) =>
              setNewMed({ ...newMed, price: Number(e.target.value) })
            }
          />
          <input
            className="border px-2 py-1 rounded flex-1"
            placeholder="Số lượng"
            type="number"
            value={newMed.stockQuantity || ""}
            onChange={(e) =>
              setNewMed({
                ...newMed,
                stockQuantity: Number(e.target.value),
              })
            }
          />
          <input
            className="border px-2 py-1 rounded"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setNewMed({ ...newMed, imageUrl: file });
            }}
          />
          {editingId && typeof newMed.imageUrl === "string" && newMed.imageUrl && (
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Ảnh hiện tại:</span>
              <img
                src={getImageUrl(newMed.imageUrl)}
                alt="Ảnh cũ"
                className="w-16 h-12 object-contain border rounded" />
            </div>
          )}
          <select
            className="border px-2 py-1 rounded w-40"
            value={newMed.categoryId || ""}
            onChange={(e) => setNewMed({ ...newMed, categoryId: Number(e.target.value) })}
            required
          >
            <option value="">Chọn loại thuốc</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            className="border px-2 py-1 rounded w-40"
            value={newMed.supplierId || ""}
            onChange={(e) => setNewMed({ ...newMed, supplierId: Number(e.target.value) })}
            required
          >
            <option value="">Chọn nhà cung cấp</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
          <div className="flex-1 flex items-center gap-2">
            <button
              type="button"
              className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setNewMed((prev) => ({
                ...prev,
                dosage: Math.max(Number(prev.dosage) - 100, 100).toString(),
              }))}
              tabIndex={-1}
              aria-label="Giảm hàm lượng"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                className="inline"
              >
                <path
                  d="M12 10L8 6 4 10"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="none" />
              </svg>
            </button>
            <input
              className="border px-2 py-1 rounded w-20 text-center"
              placeholder="Hàm lượng"
              type="number"
              min={100}
              step={100}
              value={newMed.dosage || 100}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), 100);
                setNewMed({ ...newMed, dosage: val.toString() });
              }}
            />
            <button
              type="button"
              className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setNewMed((prev) => ({
                ...prev,
                dosage: (Number(prev.dosage) + 100).toString(),
              }))}
              tabIndex={-1}
              aria-label="Tăng hàm lượng"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                className="inline"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="none" />
              </svg>
            </button>
            <span className="ml-1 text-gray-500">mg</span>
          </div>
          <input
            className="border px-2 py-1 rounded flex-1"
            type="date"
            placeholder="Ngày hết hạn"
            value={newMed.expiryDate || ""}
            onChange={(e) => setNewMed({ ...newMed, expiryDate: e.target.value })}
          />
        </div>
        <textarea
          className="border px-2 py-2 rounded mt-2 w-full"
          placeholder="Mô tả"
          rows={3}
          value={newMed.description || ""}
          onChange={(e) =>
            setNewMed({ ...newMed, description: e.target.value })
          }
        />
        <textarea
          className="border px-2 py-2 rounded mt-2 w-full"
          placeholder="Thành phần"
          rows={3}
          value={newMed.ingredient || ""}
          onChange={(e) =>
            setNewMed({ ...newMed, ingredient: e.target.value })
          }
        />
        <div className="flex gap-2 mt-2">
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded"
            type="submit"
          >
            {editingId ? "Cập nhật" : "Thêm"}
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-1 rounded"
              onClick={resetForm}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
      <table className="w-full border mt-6 overflow-x-auto text-sm">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Ảnh</th>
            <th className="border px-2 py-1">Tên thuốc</th>
            <th className="border px-2 py-1">Loại thuốc</th>
            <th className="border px-2 py-1">Nhà cung cấp</th>
            <th className="border px-2 py-1">Hàm lượng</th>
            <th className="border px-2 py-1">Số lượng</th>
            <th className="border px-2 py-1">Ngày hết hạn</th>
            <th className="border px-2 py-1">Giá</th>
            <th className="border px-2 py-1">Mô tả</th>
            <th className="border px-2 py-1">Thành phần</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {meds.map((med) => (
            <tr key={med.id} className="text-center">
              <td className="border px-2 py-1">{med.id}</td>
              <td className="border px-2 py-1">
                <img
                  src={getImageUrl(med.imageUrl)}
                  alt={med.name}
                  className="w-16 h-12 object-contain rounded mx-auto border"
                  onError={(e) => {
                    if (
                      e.currentTarget.src !==
                        window.location.origin + "/images/no-image.png" &&
                      !e.currentTarget.dataset.fallback
                    ) {
                      e.currentTarget.src = "/images/no-image.png";
                      e.currentTarget.dataset.fallback = "1";
                    }
                  }}
                />
              </td>
              <td className="border px-2 py-1">{med.name}</td>
              <td className="border px-2 py-1">{med.categoryName || ""}</td>
              <td
                className="border px-2 py-1 max-w-[100px] truncate"
                title={med.supplierName}
              >
                {med.supplierName || ""}
              </td>
              <td className="border px-2 py-1">
                {med.dosage ? `${med.dosage}` : ""}
              </td>
              <td className="border px-2 py-1">{med.stockQuantity}</td>
              <td className="border px-2 py-1">{med.expiryDate}</td>
              <td className="border px-2 py-1">
                {med.price?.toLocaleString()}₫
              </td>
              <td
                className="border px-2 py-1 max-w-[120px] truncate"
                title={med.description}
              >
                {med.description}
              </td>
              <td
                className="border px-2 py-1 max-w-[120px] truncate"
                title={med.ingredient}
              >
                {med.ingredient}
              </td>
              <td className="border px-2 py-1">
                <button
                  className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                  onClick={() => handleEdit(med)}
                >
                  Sửa
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(med.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {meds.length === 0 && (
            <tr>
              <td colSpan={12} className="text-center py-4 text-gray-500">
                Không có thuốc nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MedListAd;