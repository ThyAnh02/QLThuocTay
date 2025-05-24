import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8081/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const user = await response.json();
                console.log("Đăng nhập thành công:", user);

                localStorage.setItem('user', JSON.stringify(user));
                alert("Đăng nhập thành công! Vui lòng đợi trong giây lát.");

                setTimeout(() => {
                    // Kiểm tra role name không phân biệt hoa thường
                    const roleName = user?.userRole?.roleName?.toLowerCase?.() || '';
                    if (roleName === 'admin') {
                        navigate('/admin');
                    } else if (roleName === 'staff') {
                        navigate('/staff');
                    } else {
                        navigate('/home');
                    }
                }, 1000);
            } else {
                const error = await response.text();
                alert("Đăng nhập thất bại: " + error);
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập:", error);
            alert("Đã xảy ra lỗi khi đăng nhập.");
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-blue-50 overflow-hidden">
            {/* Hình nền mờ */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 backdrop-blur-sm"
                style={{
                    backgroundImage: `url('/images/istockphoto-1370358685-612x612.jpg')`,
                }}
            ></div>
            <div className="relative z-10 flex flex-col md:flex-row p-10 rounded-2xl shadow-xl max-w-6xl mx-auto">
                {/* Cột hình ảnh */}
                <div className="w-full md:block relative">
                    <img
                        src="/images/istockphoto-465048216-170667a.jpg"
                        alt="Login Visual"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>

                {/* Form đăng nhập */}
                <form
                    onSubmit={handleLogin}
                    className="bg-white bg-opacity-95 backdrop-blur-md p-20 rounded-xl shadow-lg w-full max-w-md"
                >
                    <h2 className="text-3xl font-bold text-center mb-10 text-blue-700">
                        Đăng nhập
                    </h2>

                    <div className="mb-4">
                        <label className="block text-base text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 w-full px-4 py-1 text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div className="mb-10">
                        <label className="block text-base text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 w-full px-4 py-1 text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white text-base py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Đăng nhập
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-blue-600 hover:underline"
                        >
                            Đăng ký
                        </button>
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="mt-4 w-full text-blue-600 hover:underline"
                    >
                        Quay lại trang chủ
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;