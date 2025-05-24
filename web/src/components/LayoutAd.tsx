import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const adminMenu = [
  { label: "Dashboard", to: "/admin/dashboard", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v6a2 2 0 002 2h2a2 2 0 002-2v-6m-6 0h6" />
      </svg>
    ) },
  { label: "Quản lý thuốc", to: "/admin/medicines", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth={2} fill="none"/>
        <path d="M3 12a9 4 0 0 0 18 0" stroke="currentColor" strokeWidth={2} fill="none"/>
      </svg>
    ) },
  { label: "Quản lý danh mục", to: "/admin/categories", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/>
        <path d="M4 9h16M9 4v16" stroke="currentColor" strokeWidth={2} fill="none"/>
      </svg>
    ) },
  { label: "Quản lý nhà cung cấp", to: "/admin/suppliers", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="2" y="7" width="15" height="10" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/>
        <path d="M17 13h3l2 3v1a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth={2} fill="none"/>
        <circle cx="7.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth={2} fill="none"/>
        <circle cx="19.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth={2} fill="none"/>
      </svg>
    ) },
    { label: "Quản lý đơn hàng", to: "/admin/orders", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/>
        <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" strokeWidth={2} fill="none"/>
      </svg>
    ) },
  { label: "Quản lý người dùng", to: "/admin/users", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={2} fill="none"/>
        <path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="currentColor" strokeWidth={2} fill="none"/>
      </svg>
    ) },
];

const LayoutAd = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden focus:outline-none mr-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-2xl font-bold tracking-wide">Quản trị QLThuocTay</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Đăng xuất
        </button>
      </header>
      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden md:block w-64 bg-white border-r shadow-sm py-8 px-4">
          <nav>
            <ul className="space-y-2">
              {adminMenu.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 p-2 rounded hover:bg-blue-100 transition
                      ${window.location.pathname.startsWith(item.to) ? 'bg-blue-200 text-blue-800 font-semibold' : 'text-gray-700'}`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {/* Sidebar mobile/overlay */}
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 md:hidden ${sidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sidebar trượt */}
        <aside className={`
          fixed top-0 left-0 w-64 h-full bg-white p-4 border-r border-gray-200 z-50
          transform transition-transform duration-300 md:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
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
              {adminMenu.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 p-2 rounded hover:bg-blue-100 transition
                      ${window.location.pathname.startsWith(item.to) ? 'bg-blue-200 text-blue-800 font-semibold' : 'text-gray-700'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-100 overflow-auto">
          <Outlet />
        </main>
      </div>
      <footer className="bg-blue-900 text-white py-3 text-center">
        © 2025 Quản trị thuốc tây - Phát triển bởi Võ Trần Anh Thy
      </footer>
    </div>
  );
};

export default LayoutAd;