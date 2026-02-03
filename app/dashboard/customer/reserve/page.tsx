'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---
type Table = {
  id: number;
  name: string;
  capacity: number;
};

type Reservation = {
  id: number;
  table_id: number;
  reservation_time: string;
  status: string;
};

export default function CustomerReservePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State
  const [tables, setTables] = useState<Table[]>([]);
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pax: 2,
    date: '',
    time: '',
    table_id: null as number | null
  });

  // ✅ 1. Separate data loading function (to reuse after booking)
  const loadData = async () => {
    try {
      // A. Load tables and reservations
      const [tableRes, resRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/reservations')
      ]);
      
      if (tableRes.ok) setTables(await tableRes.json());
      if (resRes.ok) setExistingReservations(await resRes.json());

    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  // ✅ 2. Load data on initial page load
  useEffect(() => {
    loadData();

    // Fetch Profile separately (If guest, ignore error)
    fetch('/api/customer/profile')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Guest'); // Throw error if 400/401
      })
      .then(profile => {
        setFormData(prev => ({
          ...prev,
          name: profile.username || prev.name,
          phone: profile.phone || prev.phone
        }));
      })
      .catch(() => { 
        // Silent catch: User is likely a Guest, do nothing
        console.log("User is guest or not logged in. Using manual input.");
      });

  }, []);

  // Function to check if a table is occupied
  const isTableOccupied = (tableId: number) => {
    if (!formData.date || !formData.time) return false;
    const selectedDateTime = new Date(`${formData.date} ${formData.time}`).getTime();

    return existingReservations.some(res => {
      if (res.table_id !== tableId) return false;
      if (['cancelled', 'completed'].includes(res.status)) return false;

      const resTime = new Date(res.reservation_time).getTime();
      const diff = Math.abs(selectedDateTime - resTime);
      return diff < (2 * 60 * 60 * 1000); // Conflict if less than 2 hours
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.date || !formData.time) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (!formData.table_id) {
      alert('กรุณาเลือกโต๊ะที่ต้องการนั่ง');
      return;
    }

    setIsSubmitting(true);

    try {
      const datetime = `${formData.date} ${formData.time}:00`;

      // 1. Send Booking Data
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          pax: formData.pax,
          datetime: datetime,
          table_id: formData.table_id
        }),
      });

      if (res.ok) {
        // ✅ 2. Try to update profile (Wrapped in try-catch to ignore Guest errors)
        try {
            const profileRes = await fetch('/api/customer/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone, address: '' }), 
            });
            // We don't need to check profileRes.ok here, 
            // if it fails (400/401), we just move on.
        } catch (ignoredError) {
            console.log("Guest booking: Profile update skipped");
        }

        alert('🎉 จองโต๊ะสำเร็จ! ทางร้านจะเตรียมโต๊ะไว้ให้ครับ');
        
        // ✅ 3. Clear selected table and reload data (Stay on same page)
        setFormData(prev => ({
            ...prev,
            table_id: null, // Clear selected table
            // date: '',    // Uncomment to clear date
            // time: ''     // Uncomment to clear time
        }));
        
        loadData(); // 🔄 Reload data immediately (New booking becomes red/occupied)

      } else {
        alert('เกิดข้อผิดพลาด หรือโต๊ะอาจถูกแย่งจองไปแล้ว');
        loadData(); // Reload in case of conflict
      }
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>📅 จองโต๊ะล่วงหน้า</h1>
        <p style={{ color: '#666' }}>เลือกเวลาและโต๊ะที่ต้องการ</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Part 1: Date & Time */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 15, fontWeight: 'bold', color: '#2563eb' }}>
            ⏰ เลือกเวลาที่ต้องการ
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#555' }}>วันที่</label>
              <input 
                required type="date" 
                value={formData.date} 
                onChange={e => {
                   setFormData({...formData, date: e.target.value, table_id: null});
                }} 
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#555' }}>เวลา</label>
              <input 
                required type="time" 
                value={formData.time} 
                onChange={e => {
                    setFormData({...formData, time: e.target.value, table_id: null});
                }} 
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd' }} 
              />
            </div>
          </div>
        </div>

        {/* Part 2: Contact Info */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 15, fontWeight: 'bold', color: '#2563eb' }}>
            👤 ข้อมูลติดต่อ & จำนวนคน
          </h3>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>ชื่อผู้จอง</label>
            <input 
                required type="text" placeholder="ชื่อลูกค้า" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd' }} 
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>เบอร์โทรศัพท์</label>
            <input 
                required type="tel" placeholder="08x-xxx-xxxx" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 5 }}>จำนวนคน (ท่าน)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <button type="button" onClick={() => setFormData(prev => ({...prev, pax: Math.max(1, prev.pax - 1), table_id: null}))} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer' }}>-</button>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', width: 40, textAlign: 'center' }}>{formData.pax}</span>
              <button type="button" onClick={() => setFormData(prev => ({...prev, pax: prev.pax + 1, table_id: null}))} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        </div>

        {/* Part 3: Select Table */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 15, fontWeight: 'bold', color: '#2563eb' }}>
            🪑 เลือกโต๊ะที่ต้องการ
          </h3>

          {(!formData.date || !formData.time) && (
              <p style={{color: '#f59e0b', marginBottom: 10}}>⚠️ กรุณาเลือกวันและเวลาด้านบนก่อน เพื่อเช็คโต๊ะว่าง</p>
          )}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', 
            gap: 10 
          }}>
            {tables
              .filter(table => table.capacity >= formData.pax)
              .map(table => {
                const isOccupied = isTableOccupied(table.id);
                const isSelected = formData.table_id === table.id;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isOccupied || !formData.date || !formData.time}
                    onClick={() => setFormData({...formData, table_id: table.id})}
                    style={{
                      height: 90,
                      border: isSelected ? '2px solid #2563eb' : '1px solid #ddd',
                      background: isOccupied ? '#fee2e2' : (isSelected ? '#eff6ff' : '#fff'),
                      borderRadius: 8,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: isOccupied ? 'not-allowed' : 'pointer',
                      opacity: isOccupied ? 0.7 : 1,
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontWeight: 'bold', color: isOccupied ? '#b91c1c' : '#333' }}>{table.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>👤 {table.capacity}</span>
                    {isOccupied ? <span style={{fontSize: '0.7rem', color: '#b91c1c', fontWeight:'bold'}}>⛔ ถูกจอง</span> : (isSelected && <span style={{fontSize: '0.8rem', color: '#2563eb'}}>✓ เลือก</span>)}
                  </button>
                );
            })}
          </div>
          
          {tables.filter(t => t.capacity >= formData.pax).length === 0 && (
             <p style={{color: 'red', marginTop: 10}}>ไม่มีโต๊ะที่รองรับ {formData.pax} ท่านได้</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            marginTop: 10, padding: '15px', background: isSubmitting ? '#9ca3af' : '#2563eb', 
            color: 'white', border: 'none', borderRadius: 12, fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการจอง ✅'}
        </button>

      </form>
    </div>
  );
}