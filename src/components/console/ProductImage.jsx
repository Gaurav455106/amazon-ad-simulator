import { PRODUCT_IMAGES } from '../../data/productImages';

export default function ProductImage({ imageType, size = 60 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8', background: '#f8f8f8' }}>
      {PRODUCT_IMAGES[imageType] || PRODUCT_IMAGES['over-ear-black']}
    </div>
  );
}
