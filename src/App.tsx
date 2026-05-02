import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import ProductsPage from './pages/ProductsPage'
import PortsPage from './pages/PortsPage'
import WarehousesPage from './pages/WarehousesPage'
import ClientsPage from './pages/ClientsPage'
import LandShipmentsPage from './pages/LandShipmentsPage'
import SeaShipmentsPage from './pages/SeaShipmentsPage'
import { AuthGuard } from './components/AuthGuard'
import { RoleGuard } from './components/RoleGuard'

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <AuthGuard>
          <LoginPage />
        </AuthGuard>
      } />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      
      <Route path="/admin" element={
        <RoleGuard allowedRoles={['admin', 'client']}>
          <AdminDashboard />
        </RoleGuard>
      } />
      <Route path="/admin/products" element={
        <RoleGuard allowedRoles={['admin', 'client']}>
          <ProductsPage />
        </RoleGuard>
      } />
      <Route path="/admin/ports" element={
        <RoleGuard allowedRoles={['admin']}>
          <PortsPage />
        </RoleGuard>
      } />
      <Route path="/admin/warehouses" element={
        <RoleGuard allowedRoles={['admin']}>
          <WarehousesPage />
        </RoleGuard>
      } />
      <Route path="/admin/clients" element={
        <RoleGuard allowedRoles={['admin', 'client']}>
          <ClientsPage />
        </RoleGuard>
      } />
      <Route path="/admin/land-shipments" element={
        <RoleGuard allowedRoles={['admin', 'client']}>
          <LandShipmentsPage />
        </RoleGuard>
      } />
      <Route path="/admin/sea-shipments" element={
        <RoleGuard allowedRoles={['admin', 'client']}>
          <SeaShipmentsPage />
        </RoleGuard>
      } />
    </Routes>
  )
}

export default App