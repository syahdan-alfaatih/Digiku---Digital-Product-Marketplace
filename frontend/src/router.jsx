import { createBrowserRouter } from 'react-router-dom';

// Import Halaman
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AddProductPage from './pages/AddProductPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import AccountSettingsPage from './pages/AccountSettingsPage.jsx';
import DashboardIndex from './pages/DashboardIndex.jsx'; 
import MyProductsPage from './pages/MyProductsPage.jsx';
import EditProductPage from './pages/EditProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';

// Import Komponen Penjaga
import ProtectedRoute from './components/ProtectedRoute.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, 
        element: <DashboardIndex />,
      },
      {
        path: 'settings', 
        element: <AccountSettingsPage />,
      },
      {
        path: 'my-products', 
        element: <MyProductsPage />,
      },
      {
        path: 'my-orders',
        element: <MyOrdersPage />
      }
    ],
  },
  {
    path: '/add-product',
    element: (
      <ProtectedRoute>
        <AddProductPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/edit-product/:productId',
    element: (
      <ProtectedRoute>
        <EditProductPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/products/:productId',
    element: <ProductDetailPage />,
  },
  {
    path: '/cart',
    element: (
      <ProtectedRoute>
        <CartPage />
      </ProtectedRoute>
    )
  }
]);