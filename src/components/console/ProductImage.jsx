import { productVisual } from '../../data/productImages';

/** Square product thumbnail; shows the product's real image when it has one. */
export default function ProductImage({ product, size = 60 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8', background: '#f8f8f8' }}>
      {productVisual(product)}
    </div>
  );
}
