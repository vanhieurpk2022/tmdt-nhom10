export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/product-detail",
  FACTORIES: "/factories",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_SUCCESS: "/order-success",
  ORDERS: "/orders",
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",
  ADDRESSES: "/addresses",
  FAVORITES: "/favorites",
  NOTIFICATIONS: "/notifications",

  LOGIN: "/login",
  REGISTER: "/register",
  REGISTER_FACTORY: "/register-factory",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_RECOVERY: "/verify-recovery",
  RESET_PASSWORD: "/reset-password",
  VERIFY_ACCOUNT: "/verify",
  VERIFY_SUCCESS: "/verify-email",

  // Admin
  ADMIN_DASHBOARD: "/admin-dashboard",
  ADMIN_WORKSHOP: "/admin-workshop",
  ADMIN_CUSTOMER: "/admin-customer",
  ADMIN_ORDER: "/admin-order",
  AdMIN_SALE: "/admin-sale",
  ADMIN_SUPPORT: "/admin-support",

  // factory
  FACTORY_DASHBOARD: "/factory-dashboard",
  FACTORY_ORDER: "/factory-order",
  FACTORY_STAFF: "/factory-staff",
  FACTORY_PROFILE: "/factory-profile",
  FACTORY_SALE: "/factory-sale",
  FACTORY_PRODUCT: "/factory-product",
  FACTORY_SUPPORT: "/factory-support"
} as const;
