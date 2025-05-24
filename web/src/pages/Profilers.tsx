import React from 'react';

const Profilers: React.FC = () => {
  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    // Nếu chưa đăng nhập thì không hiển thị gì cả
    return null;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Thông tin cá nhân</h2>
      <div className="space-y-4">
        <div>
          <span className="font-semibold">Họ tên:</span>{' '}
          <span>{user.fullName || 'Chưa cập nhật'}</span>
        </div>
        <div>
          <span className="font-semibold">Email:</span>{' '}
          <span>{user.email || 'Chưa cập nhật'}</span>
        </div>
        {/* Thêm các trường thông tin khác nếu cần */}
      </div>
    </div>
  );
};

export default Profilers;