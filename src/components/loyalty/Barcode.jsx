import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export function Barcode({ value, height = 60 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && value) {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        lineColor: '#0b0a09',
        width: 2,
        height,
        displayValue: true,
        fontSize: 14,
        margin: 8,
        background: 'transparent',
      });
    }
  }, [value, height]);

  return <svg ref={ref} className="ltr-barcode w-full" />;
}
