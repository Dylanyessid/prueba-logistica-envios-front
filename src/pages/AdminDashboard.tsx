import { Link } from 'react-router-dom';
import { Package, Anchor, Warehouse, Users, Truck, Ship, LogOut } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  requiredRole?: string;
}

const menuItems: MenuItem[] = [
  { path: '/admin/products', label: 'Productos', icon: Package, description: 'Gestión de productos' },
  { path: '/admin/ports', label: 'Puertos', icon: Anchor, description: 'Gestión de puertos marítimos', requiredRole: 'admin' },
  { path: '/admin/warehouses', label: 'Bodegas', icon: Warehouse, description: 'Gestión de almacenes', requiredRole: 'admin' },
  { path: '/admin/clients', label: 'Clientes', icon: Users, description: 'Gestión de clientes' },
  { path: '/admin/land-shipments', label: 'Envíos Terrestres', icon: Truck, description: 'Gestión de envíos por tierra' },
  { path: '/admin/sea-shipments', label: 'Envíos Marítimos', icon: Ship, description: 'Gestión de envíos por mar' },
];

export default function AdminDashboard() {
  const role = authService.getRole();
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const visibleMenuItems = menuItems.filter(item => {
    if (!item.requiredRole) return true;
    return role === item.requiredRole;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary p-2 rounded-lg">
            <Truck className="h-5 w-5 text-primary-foreground" />
            <span className="font-semibold text-primary-foreground">Logística</span>
          </div>
          <span className="text-xl font-semibold text-slate-800">Panel de Administración</span>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </header>

      <main className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Selecciona una opción</h2>
        {visibleMenuItems.length === 0 ? (
          <p className="text-muted-foreground">No tienes acceso a ninguna sección.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMenuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-primary h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}