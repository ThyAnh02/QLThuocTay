import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Home from './pages/Home';
import SupplierList from './pages/SupplierList';
import EditSupplier from './pages/EditSupplier';
import MedicinesList from './pages/MedicinesList';
import MedicinesDetail from './pages/MedicinesDetail';
import Profilers from './pages/Profilers';
import LayoutAd from './components/LayoutAd';
import HomeAd from './pageAd/HomeAd';
import UserList from './pageAd/UserList';
import MedListAd from './pageAd/MedListAd';
import CatListAd from './pageAd/CatListAd';
import GioHang from './pages/GioHang';
import Order from './pages/Order';
import OrderLisAd from './pageAd/OrderLisAd';

function App() {
    return (
        <Router>
            <Routes>
                {/* Routes without layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes with layout wrapper */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/medicines" element={<MedicinesList />} />
                    <Route path="/medicines/:id" element={<MedicinesDetail />} />
                    <Route path="/profile" element={<Profilers />} />
                    <Route path="/giohang"element={<GioHang/>}/>
                    <Route path="/order"element={<Order/>}/>

                </Route>
                <Route element={<LayoutAd />}>
                    <Route path="/admin" element={<HomeAd />} />
                    <Route path="/admin/dashboard" element={<div>Dashboard</div>} />
                    <Route path="/admin/medicines" element={<MedListAd />} />
                    <Route path="/admin/categories" element={<CatListAd />} />
                    <Route path="/admin/suppliers" element={<SupplierList />} />
                    <Route path="/editsuplier" element={<EditSupplier />} />
                    <Route path="/admin/users" element={<UserList />} />
                    <Route path="/admin/orders" element={<OrderLisAd />} />
                    </Route>
            </Routes>
        </Router>
    );
}

export default App;
