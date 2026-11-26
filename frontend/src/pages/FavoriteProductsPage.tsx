import AccountLayout from "../components/layout/AccountLayout";
import CatalogProductCard from "../components/product/CatalogProductCard";
import { useFavorites } from "../api/FavoriteContext";

export default function FavoriteProductsPage() {
  const { products, loading, error } = useFavorites();
  return <AccountLayout breadcrumbCurrent="Sản phẩm yêu thích">
    <div className="bg-white rounded-4 p-4">
      <h1 className="h4 mb-4">Sản phẩm yêu thích</h1>
      {error && <p className="text-danger" role="alert">{error}</p>}
      {loading ? <p role="status">Đang tải...</p> : products.length
        ? <div className="row g-3">{products.map(product => <div className="col-12 col-sm-6 col-xl-4" key={product.id}><CatalogProductCard product={product} /></div>)}</div>
        : <p className="text-muted">Bạn chưa lưu sản phẩm nào. Bấm biểu tượng trái tim trên sản phẩm để lưu tại đây.</p>}
    </div>
  </AccountLayout>;
}
