# Frontend - Sistema de Gestión de Envíos

Frontend para el sistema de logística y gestión de envíos marítimos y terrestres.

## Tecnologías y Librerías

### Core
- **React 19** - Biblioteca UI principal
- **TypeScript 6** - Tipado estático
- **Vite 8** - Build tool y servidor de desarrollo

### Estado y Datos
- **Axios** - Cliente HTTP para comunicación con API REST
- **React Hook Form** - Gestión de formularios

### UI/CSS
- **Tailwind CSS 4** - Framework de estilos utility-first
- **Lucide React** - Iconos
- **clsx + tailwind-merge** - Utilidades para combinar clases

### Routing
- **React Router DOM 7** - Enrutamiento del lado del cliente

## Estructura del Proyecto

```
src/
├── components/
│   └── ui/           # Componentes base (Button, Input, Table, etc.)
├── pages/             # Páginas de la aplicación
├── services/         # Servicios API (CRUD para cada entidad)
├── lib/             # Utilidades (apiClient, etc.)
├── config/           # Configuraciones
└── App.tsx          # Componente principal con rutas
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Uso en Local

### Desarrollo
```bash
npm run dev
```
Inicia el servidor en `http://localhost:5173`

### Build producción
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```


## Decisiones de Diseño

### Campos denormalizados
Los envíos incluyen campos redundantes (`clientName`, `clientDocument`, `productName`, `destinationPortName`, `destinationWarehouseName`) para evitar consultas adicionales y mantener datos incluso si se eliminan registros relacionados.

### Autenticación
- Token JWT almacenado en localStorage
- Interceptor en apiClient para agregar token automáticamente
- Redirección automática a login en401

### Protección de rutas
- RoleGuard para restringir acceso por rol
- AuthGuard para proteger rutas autenticadas