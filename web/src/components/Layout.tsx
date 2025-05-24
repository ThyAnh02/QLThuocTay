import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [medicinesList, setMedicinesList] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  useEffect(() => {
    axios.get('http://localhost:8081/medicines/all')
      .then(res => {
        const data = res.data as { name: string }[];
        setMedicinesList(data.map(item => item.name));
        console.log('Medicines:', data.map(item => item.name));
      })
      .catch(() => setMedicinesList([]));
    axios.get('http://localhost:8081/categories/all')
      .then(res => {
        const data = res.data as { categoryName: string }[];
        setCategoriesList(data.map(item => item.categoryName));
        console.log('Categories:', data.map(item => item.categoryName));
      })
      .catch(() => setCategoriesList([]));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/medicines');
    }
    setSuggestions([]);
    setSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (medicinesList.length === 0 && categoriesList.length === 0) {
      setSuggestions([]);
      return;
    }

    if (value.trim().length > 0) {
      const medicineFiltered = medicinesList.filter(med =>
        med.toLowerCase().includes(value.toLowerCase())
      );
      const categoryFiltered = categoriesList.filter(cat =>
        cat.toLowerCase().includes(value.toLowerCase())
      );
      const allSuggestions = Array.from(new Set([...medicineFiltered, ...categoryFiltered]));
      setSuggestions(allSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setSuggestions([]);
    navigate(`/medicines?search=${encodeURIComponent(suggestion)}`);
    setSearch('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            className="mr-2 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Quản lý thuốc tây</h1>
        </div>
        {/* Thanh tìm kiếm với gợi ý */}
        <form onSubmit={handleSearch} className="flex-1 flex justify-center mx-4 relative">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={search}
              onChange={handleChange}
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-10 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 shadow"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                onClick={() => { setSearch(''); setSuggestions([]); }}
                tabIndex={-1}
                aria-label="Xóa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Nút tìm kiếm bên phải */}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-700 hover:text-blue-900"
              aria-label="Tìm kiếm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={2} fill="none"/>
                <path d="M21 21l-3.5-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
              </svg>
            </button>
            {/* Gợi ý */}
            {suggestions.length > 0 && (
  <ul
    className="absolute left-0 right-0 mt-1 bg-white text-black rounded shadow z-[9999] max-h-56 overflow-auto border border-blue-200"
    onMouseDown={e => e.preventDefault()} // Thêm dòng này
  >
    {suggestions.map((item, idx) => {
      const keyword = search.trim();
      const regex = new RegExp(`(${keyword})`, 'ig');
      const parts = item.split(regex);
      return (
        <li
          key={idx}
          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
          onClick={() => handleSuggestionClick(item)} // Đổi lại thành onClick
        >
          {parts.map((part, i) =>
            regex.test(part) && keyword !== '' ? (
              <span key={i} className="font-bold text-blue-700">{part}</span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </li>
      );
    })}
  </ul>
)}
          </div>
        </form>
        <div className="flex items-center gap-4">
          {/* Cart button: chỉ hiện khi đã đăng nhập */}
          {user && (
            <button
              onClick={() => navigate('/giohang')}
              className="relative bg-white text-blue-700 px-3 py-2 rounded hover:bg-blue-100 flex items-center gap-2 transition"
              title="Giỏ hàng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.53 19h8.94a2 2 0 0 0 1.88-2.3L17 13m-5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                />
              </svg>
              <span className="hidden sm:inline">Giỏ hàng</span>
            </button>
          )}
          {!user ? (
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Đăng nhập
            </button>
          ) : (
            <>
              <span className="hidden sm:block text-sm">
                Xin chào, <b>{user.fullName || user.email}</b>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <aside className="fixed top-0 left-0 w-64 h-full bg-blue-50 p-4 border-r border-gray-200 z-50 animate-slide-in">
              <button
                className="mb-6 text-blue-800 hover:text-red-600"
                onClick={() => setSidebarOpen(false)}
                aria-label="Đóng menu"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <NavLink
                      to="/home"
                      className={({ isActive }) =>
                        `flex items-center gap-3 p-2 rounded hover:bg-blue-200 transition ${
                          isActive ? 'bg-blue-200 text-blue-800 font-semibold' : 'text-gray-700'
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v6a2 2 0 002 2h2a2 2 0 002-2v-6m-6 0h6" />
                      </svg>
                      Trang chủ
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/medicines"
                      className={({ isActive }) =>
                        `flex items-center gap-3 p-2 rounded hover:bg-blue-200 transition ${
                          isActive ? 'bg-blue-200 text-blue-800 font-semibold' : 'text-gray-700'
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth={2} fill="none"/>
                        <path d="M3 12a9 4 0 0 0 18 0" stroke="currentColor" strokeWidth={2} fill="none"/>
                      </svg>
                      Thuốc
                    </NavLink>
                  </li>
                  
                  {user && (
                    <>
                      <li>
                        <NavLink
                          to="/order"
                          className={({ isActive }) =>
                            `flex items-center gap-3 p-2 rounded hover:bg-blue-200 transition ${
                              isActive ? 'bg-blue-200 text-blue-800 font-semibold' : 'text-gray-700'
                            }`
                          }
                          onClick={() => setSidebarOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/>
                            <path d="M9 8h6M9 12h6M9 16h2" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
                          </svg>
                          Đơn hàng
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/profile"
                          className={({ isActive }) =>
                            `flex items-center gap-3 p-2 rounded hover:bg-blue-200 transition ${
                              isActive ? 'bg-blue-200 text-blue-800 font-semibold' : 'text-gray-700'
                            }`
                          }
                          onClick={() => setSidebarOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={2} fill="none"/>
                            <path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="currentColor" strokeWidth={2} fill="none"/>
                          </svg>
                          Hồ sơ
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-blue-800 text-white p-3 text-center">
        © 2025 Quản lý thuốc tây - Phát triển bởi Võ Trần Anh Thy
      </footer>

      {/* Sidebar slide-in animation */}
      <style>
        {`
          @keyframes slide-in {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slide-in 0.2s ease;
          }
        `}
      </style>
    </div>
  );
};

export default Layout;