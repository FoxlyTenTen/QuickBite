// AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './App'; // assume App.jsx is your homepage layout
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import MerchantSignIn from './auth/MerchantSignIn';
import DriverSignIn from './auth/DriverSignIn';
import Popular from './Popular'
import HomeMer from './Merchant/HomeMer';
import { Home } from 'lucide-react';
import AddMenuItem from './Merchant/AddMenuItem';
import AddRestaurant from './Merchant/AddRestaurant';
import CartOrder from './Cart/CartOrder';
import ConfirmOrder from './Cart/ConfirmOrder';
import HomeDriver from './Driver/HomeDrive';
import LocTrack from './locationTracking/locTrack'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Popular" element={<Popular />} />
      <Route path="/auth/SignUp" element={<SignUp />} />
      <Route path="/auth/SignIn" element={<SignIn />} />
      <Route path="/auth/MerchantSignIn" element={<MerchantSignIn />} />
      <Route path="/auth/DriverSignIn" element={<DriverSignIn />} />

      <Route path="/Merchant/HomeMer" element={<HomeMer />} />
      <Route path="/Merchant/AddMenuItem" element={<AddMenuItem />} />
      <Route path="/Merchant/AddRestaurant" element={<AddRestaurant />} />

      <Route path="/Cart/CartOrder" element={<CartOrder />} />
      <Route path="/Cart/ConfirmOrder" element={<ConfirmOrder />}></Route>
      <Route path="/Driver/HomeDrive" element={<HomeDriver />}></Route>
      <Route path="/locationTracking/locTrack" element={<LocTrack />}></Route>

    </Routes>
  );
}
