import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        // Kiểm tra số điện thoại nếu có nhập
        if (phoneNumber) {
            if (!/^0[0-9]{9}$/.test(phoneNumber)) {
                setError('Số điện thoại phải gồm 10 số, bắt đầu bằng số 0.');
                return;
            }
        }

        try {
            await axios.post('http://localhost:8081/users/register', {
                fullName,
                email,
                phoneNumber,
                password,
                roleName: role
            });

            // Reset form
            setFullName('');
            setEmail('');
            setPhoneNumber('');
            setPassword('');
            setRole('customer');
            setError('');
            setSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');

            setTimeout(() => {
                setSuccess('');
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            console.error("Chi tiết lỗi:", err);
            if (err.response) {
                const resData = err.response.data;
                if (typeof resData === 'string') {
                    setError(resData);
                } else if (resData?.message) {
                    setError(resData.message);
                } else {
                    setError("Lỗi không xác định từ server: " + JSON.stringify(resData));
                }
            } else if (err.request) {
                setError("Không thể kết nối với máy chủ. Kiểm tra mạng hoặc port.");
            } else {
                setError(`Lỗi: ${err.message}`);
            }
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-blue-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 backdrop-blur-sm"
                style={{ backgroundImage: `url('/images/istockphoto-1370358685-612x612.jpg')` }}
            ></div>
            <div className="relative flex flex-col md:flex-row p-4 rounded-xl shadow-xl max-w-4xl">
                <div className="w-full md:block relative">
                    <img
                        src="/images/istockphoto-465048216-170667a.jpg"
                        alt="Register Visual"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
                <div className="bg-white bg-opacity-95 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">Đăng ký</h2>
                    {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
                    {success && <div className="mb-4 text-green-600 text-sm text-center">{success}</div>}
                    <div className="mb-6">
                        <label className="block text-base text-gray-700">Họ và tên</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-2 w-full px-4 py-1 text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-base text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 w-full px-4 py-1 text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                            
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-base text-gray-700">Số điện thoại</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-2 w-full px-4 py-1 text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                            minLength={10}
                            maxLength={10}
                            pattern="^0[0-9]{9}$"
                            placeholder="Nhập số điện thoại (10 số, bắt đầu bằng 0, không bắt buộc)"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-base text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 w-full px-4 py-1 text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-base text-gray-700">Vai trò</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-2 w-full px-4 py-1 text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                        >
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="customer">Khách hàng</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={handleRegister}
                        className="w-full bg-blue-600 text-white text-base py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Đăng ký
                    </button>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:underline"
                        >
                            Đăng nhập
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;