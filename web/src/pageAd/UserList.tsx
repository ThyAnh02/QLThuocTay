import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  userRole: {
    roleId: number;
    roleName: string;
  };
}

const ROLE_OPTIONS = [
  { roleId: 1, roleName: 'ADMIN' },
  { roleId: 2, roleName: 'STAFF' },
  { roleId: 3, roleName: 'CUSTOMER' },
];

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    roleId: 0,
    roleName: '',
    password: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get<User[]>('http://localhost:8081/users/all')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fullName: newUser.fullName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      userRole: {
        roleId: Number(newUser.roleId),
        roleName: newUser.roleName,
      },
      password: editingUser ? editingUser.userRole ? '' : '' : newUser.password
    };
    if (editingUser) {
      axios.put(`http://localhost:8081/users/update/${editingUser.userId}`, payload)
        .then(() => {
          fetchUsers();
          setEditingUser(null);
          setShowForm(false);
          setMessage('Cập nhật người dùng thành công!');
        })
        .catch(() => setMessage('Có lỗi khi cập nhật người dùng!'));
    } else {
      axios.post('http://localhost:8081/users/add', payload)
        .then((res) => {
          setUsers(prev => [...prev, res.data as User]);
          setShowForm(false);
          setMessage('Thêm người dùng thành công!');
        })
        .catch(() => setMessage('Có lỗi khi thêm người dùng!'));
    }
    setNewUser({
      fullName: '',
      email: '',
      phoneNumber: '',
      roleId: 0,
      roleName: '',
      password: '',
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      axios.delete(`http://localhost:8081/users/delete/${id}`)
        .then(() => {
          setUsers(prev => prev.filter(u => u.userId !== id));
          setMessage('Xóa người dùng thành công!');
        })
        .catch(() => setMessage('Có lỗi khi xóa người dùng!'));
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleId: user.userRole?.roleId,
      roleName: user.userRole?.roleName,
      password: '',
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setNewUser({
      fullName: '',
      email: '',
      phoneNumber: '',
      roleId: 0,
      roleName: '',
      password: '',
    });
    setShowForm(true);
  };
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null') as User | null;
  console.log('currentUser:', currentUser);
  console.log('users:', users);
  users.forEach(u => {
    console.log('userId:', u.userId, 'currentUserId:', currentUser?.userId, u.userId === Number(currentUser?.userId));
  });
  const filteredUsers = users.filter(
    user => Number(user.userId) !== Number(currentUser?.userId)
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Danh sách người dùng</h1>
      {message && (
        <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-800 border border-green-300">
          {message}
        </div>
      )}
      <button
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={handleAdd}
      >
        Thêm người dùng
      </button>

      {/* Form thêm/sửa */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8">
          <div className="mb-4">
            <label className="block font-medium mb-1">Tên đăng nhập</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={newUser.fullName}
              onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              className="border rounded px-3 py-2 w-full"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Số điện thoại</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={newUser.phoneNumber}
              onChange={e => setNewUser({ ...newUser, phoneNumber: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Vai trò</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newUser.roleId}
              onChange={e => {
                const selected = ROLE_OPTIONS.find(r => r.roleId === Number(e.target.value));
                setNewUser({
                  ...newUser,
                  roleId: Number(e.target.value),
                  roleName: selected ? selected.roleName : '',
                });
              }}
              required
            >
              <option value={0}>Chọn vai trò</option>
              {ROLE_OPTIONS.map(role => (
                <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
              ))}
            </select>
          </div>
          {!editingUser && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                className="border rounded px-3 py-2 w-full"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type="button"
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Danh sách người dùng */}
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Tên đăng nhập</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Số điện thoại</th>
              <th className="py-3 px-4 text-left">Vai trò</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.userId} className="border-t">
                <td className="py-2 px-4">{user.userId}</td>
                <td className="py-2 px-4">{user.fullName}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.phoneNumber}</td>
                <td className="py-2 px-4">{user.userRole?.roleName}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleEdit(user)}
                  >
                    Sửa
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(user.userId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Không có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;