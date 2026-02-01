'use client';

import { useEffect, useState } from 'react';

type Menu = {
  id: number;
  name: string;
  price: number;
};

type CartItem = Menu & { quantity: number };

export default function AllMenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    fetch('/api/customer/menus')
      .then(res => res.json())
      .then(setMenus);
  }, []);

  function addToCart(menu: Menu) {
    setCart(prev => {
      const found = prev.find(i => i.id === menu.id);
      if (found) {
        return prev.map(i =>
          i.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...menu, quantity: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart(prev =>
      prev
        .map(i =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter(i => i.quantity > 0)
    );
  }

  async function submitOrder() {
    if (cart.length === 0) return;

    const res = await fetch('/api/customer/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });

    if (res.ok) {
      alert('สั่งอาหารเรียบร้อย 🍽️');
      setCart([]);
    } else {
      alert('เกิดข้อผิดพลาด');
    }
  }

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <div style={{ padding: 16, paddingBottom: 140 }}>
      <h1>📖 เมนูทั้งหมด</h1>

      {/* รายการเมนู */}
      {menus.map(menu => (
        <div
          key={menu.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #eee',
          }}
        >
          <div>
            <div>{menu.name}</div>
            <small>{menu.price} บาท</small>
          </div>

          <button onClick={() => addToCart(menu)}>➕ เพิ่ม</button>
        </div>
      ))}

      {/* ตะกร้า */}
      {cart.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 60,
            left: 0,
            right: 0,
            background: '#fff',
            borderTop: '1px solid #ddd',
            padding: 12,
          }}
        >
          <h4>🛒 ตะกร้า</h4>

          {cart.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span>
                {item.name} x {item.quantity}
              </span>
              <div>
                <button onClick={() => removeFromCart(item.id)}>
                  ➖
                </button>
                <button onClick={() => addToCart(item)}>
                  ➕
                </button>
              </div>
            </div>
          ))}

          <p>
            <b>รวม {total} บาท</b>
          </p>

          <button
            onClick={submitOrder}
            style={{
              width: '100%',
              padding: 10,
              background: '#2563eb',
              color: '#fff',
              borderRadius: 6,
            }}
          >
            ยืนยันสั่งอาหาร
          </button>
        </div>
      )}
    </div>
  );
}
