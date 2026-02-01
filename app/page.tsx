'use client';

import { useEffect, useState } from 'react';

type Menu = {
  id: number;
  name: string;
  price: number;
};

export default function CustomerHome() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/customer/menus')
      .then(res => res.json())
      .then(setMenus);
  }, []);

  function addToCart(menu: Menu) {
    setCart(prev => {
      const exist = prev.find(i => i.id === menu.id);
      if (exist) {
        return prev.map(i =>
          i.id === menu.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...menu, quantity: 1 }];
    });
  }

  async function submitOrder() {
    const res = await fetch('/api/customer/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });

    if (res.ok) {
      alert('สั่งอาหารสำเร็จ');
      setCart([]);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🍽️ เมนูแนะนำ</h1>

      {menus.map(menu => (
        <div
          key={menu.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
            borderBottom: '1px solid #eee',
          }}
        >
          <span>
            {menu.name} - {menu.price} บาท
          </span>
          <button onClick={() => addToCart(menu)}>➕</button>
        </div>
      ))}

      {/* ตะกร้า */}
      {cart.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 70,
            left: 0,
            right: 0,
            background: '#fff',
            borderTop: '1px solid #ddd',
            padding: 10,
          }}
        >
          <h4>🛒 ตะกร้า</h4>
          {cart.map(item => (
            <p key={item.id}>
              {item.name} x {item.quantity}
            </p>
          ))}

          <p>
            รวม{' '}
            {cart.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            )}{' '}
            บาท
          </p>

          <button onClick={submitOrder}>ยืนยันสั่งอาหาร</button>
        </div>
      )}
    </div>
  );
}
