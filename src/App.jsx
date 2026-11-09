import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Scan, Search, Clock, MapPin, CheckCircle2, 
  AlertTriangle, Users, Grid, Sparkles, X, Camera 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_PACKAGES = [
  {
    id: 'TRK-98214',
    recipient: 'Aishini Kathuria',
    hostel: 'Hostel H (Girls)',
    carrier: 'Amazon Prime',
    category: 'Electronics / Lab Kit',
    shelfSection: 'B',
    shelfRow: 3,
    binSlot: 8,
    intakeTime: 'Today, 11:30 AM',
    status: 'Ready for Pickup',
    priority: 'Normal'
  },
  {
    id: 'TRK-44120',
    recipient: 'Vivan Garg',
    hostel: 'Hostel B (Boys)',
    carrier: 'Blue Dart',
    category: 'Perishable / Care Package',
    shelfSection: 'A',
    shelfRow: 1,
    binSlot: 2,
    intakeTime: 'Today, 09:15 AM',
    status: 'Ready for Pickup',
    priority: 'Urgent'
  },
  {
    id: 'TRK-77193',
    recipient: 'Rohan Mehra',
    hostel: 'Hostel H (Boys Wing)',
    carrier: 'Flipkart Express',
    category: 'Textbooks & Stationery',
    shelfSection: 'C',
    shelfRow: 4,
    binSlot: 14,
    intakeTime: 'Yesterday, 04:45 PM',
    status: 'Ready for Pickup',
    priority: 'Normal'
  },
  {
    id: 'TRK-10928',
    recipient: 'Simran Kaur',
    hostel: 'Hostel G (Girls)',
    carrier: 'India Post Speed',
    category: 'Academic Credentials',
    shelfSection: 'A',
    shelfRow: 2,
    binSlot: 5,
    intakeTime: 'Today, 01:10 PM',
    status: 'Ready for Pickup',
    priority: 'Normal'
  }
];

// 4 Sections (A, B, C, D) each with 4 rows x 4 bins
const SHELF_SECTIONS = ['A', 'B', 'C', 'D'];

export default function App() {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(INITIAL_PACKAGES[0]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [closingSeconds, setClosingSeconds] = useState(7200); // 2 hours until mailroom cutoff

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanActive, setScanActive] = useState(false);

  // Countdown timer for mailroom closing window
  useEffect(() => {
    const timer = setInterval(() => {
      setClosingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours}h ${mins}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  // Simulated in-browser camera barcode scanning via Canvas API
  const startCameraScanner = async () => {
    setScanActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      // Fallback if camera permissions or hardware are blocked
      setScanActive(false);
    }
  };

  const stopCameraScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setScanActive(false);
    setScannerOpen(false);
  };

  const handleSimulateScan = (code) => {
    const found = packages.find(p => p.id.toLowerCase() === code.toLowerCase());
    if (found) {
      setSelectedPackage(found);
      stopCameraScanner();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else {
      alert(`Tracking ID ${code} not found in current hostel delivery batch.`);
    }
  };

  const handleClaimPackage = (packageId) => {
    setPackages(prev => prev.map(p => p.id === packageId ? { ...p, status: 'Claimed & Released' } : p));
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
  };

  const filteredPackages = packages.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hostel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>LockerRadar</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Hostel Central Mailroom & Shelf Assignment Radar</p>
          </div>
        </div>

        {/* Mailroom Closing Alert */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: closingSeconds < 3600 ? '#7f1d1d' : '#1e293b',
            border: closingSeconds < 3600 ? '1px solid #ef4444' : '1px solid #334155',
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock size={14} color={closingSeconds < 3600 ? '#fca5a5' : '#60a5fa'} />
            <span>Counter Closes in: <strong>{formatCountdown(closingSeconds)}</strong></span>
          </div>

          <button
            onClick={() => { setScannerOpen(true); startCameraScanner(); }}
            style={{
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Scan size={15} /> Scan Barcode
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left Column: Shelf Coordinate Matrix & Package Directory */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Traffic Congestion Alert */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mailroom Congestion Telemetry
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '4px 0 2px 0' }}>Current Rush Level: Moderate</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Average pickup queue: <strong>~3-5 minutes</strong> · Recommended visit window: Before 6:30 PM
              </p>
            </div>
            <div style={{ background: '#0284c7', color: '#ffffff', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}>
              8 People in Line
            </div>
          </div>

          {/* 3D-Styled 2D Shelf Grid Visualizer */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Grid size={18} color="#3b82f6" /> Physical Shelf Coordinate Matrix
                </h3>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                  Showing target bin: <strong>Section {selectedPackage.shelfSection} · Row {selectedPackage.shelfRow} · Slot #{selectedPackage.binSlot}</strong>
                </p>
              </div>
              <span style={{ fontSize: '11px', background: '#1e293b', color: '#93c5fd', padding: '4px 8px', borderRadius: '6px', border: '1px solid #334155' }}>
                Section {selectedPackage.shelfSection} Active
              </span>
            </div>

            {/* Shelf Grid: 4 Rows x 4 Columns representing Section Bins */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              background: '#030712',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #1e293b'
            }}>
              {Array.from({ length: 16 }).map((_, index) => {
                const slotNum = index + 1;
                const isTarget = selectedPackage.binSlot === slotNum;
                return (
                  <div
                    key={slotNum}
                    style={{
                      height: '56px',
                      borderRadius: '8px',
                      background: isTarget ? '#3b82f6' : '#1e293b',
                      border: isTarget ? '2px solid #ffffff' : '1px solid #334155',
                      boxShadow: isTarget ? '0 0 16px rgba(59, 130, 246, 0.6)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: '800', color: isTarget ? '#ffffff' : '#94a3b8' }}>
                      Bin #{slotNum}
                    </span>
                    {isTarget && (
                      <span style={{ fontSize: '9px', fontWeight: '700', color: '#e0f2fe', background: '#1d4ed8', padding: '1px 4px', borderRadius: '3px', marginTop: '2px' }}>
                        PARCEL HERE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Searchable Package Feed */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search recipient name, tracking ID (e.g. TRK-98214), or hostel..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredPackages.map(pkg => {
                const isSelected = selectedPackage.id === pkg.id;
                const isClaimed = pkg.status.includes('Claimed');
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    style={{
                      background: isSelected ? '#1e293b' : '#030712',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid #1e293b',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>{pkg.recipient}</span>
                        <span style={{ fontSize: '11px', color: '#60a5fa', background: '#1e3a8a', padding: '1px 6px', borderRadius: '4px' }}>
                          {pkg.id}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                        {pkg.carrier} · {pkg.hostel} · Intake: {pkg.intakeTime}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: isClaimed ? '#6ee7b7' : pkg.priority === 'Urgent' ? '#fca5a5' : '#93c5fd',
                        background: isClaimed ? '#064e3b' : pkg.priority === 'Urgent' ? '#7f1d1d' : '#1e3a8a',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {pkg.shelfSection}-{pkg.shelfRow} (Bin {pkg.binSlot})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Column: Parcel Detail & Clearance Inspector */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Package Inspection Ledger
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 12px 0' }}>{selectedPackage.id}</h2>

            {/* Quick Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#030712', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Recipient:</span>
                <strong style={{ color: '#f8fafc' }}>{selectedPackage.recipient}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Designated Hostel:</span>
                <span style={{ color: '#cbd5e1' }}>{selectedPackage.hostel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Courier Service:</span>
                <span style={{ color: '#38bdf8' }}>{selectedPackage.carrier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Category:</span>
                <span style={{ color: '#cbd5e1' }}>{selectedPackage.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Shelf Coordinates:</span>
                <strong style={{ color: '#f59e0b' }}>Section {selectedPackage.shelfSection} | Row {selectedPackage.shelfRow} | Bin {selectedPackage.binSlot}</strong>
              </div>
            </div>

            {/* Release Status / Action Button */}
            {selectedPackage.status.includes('Claimed') ? (
              <div style={{ background: '#064e3b', border: '1px solid #059669', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ecfdf5' }}>
                <CheckCircle2 size={18} color="#6ee7b7" />
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Package Signed Out & Collected!</span>
              </div>
            ) : (
              <button
                onClick={() => handleClaimPackage(selectedPackage.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} /> Mark Verified & Handed to Student
              </button>
            )}
          </div>

          {/* Quick Pickup Checklist for Students */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', color: '#cbd5e1' }}>Mailroom Pickup Guidelines</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Have your Physical University ID or Digilocker ready.</li>
              <li>Present the Tracking Barcode ({selectedPackage.id}) on your phone screen.</li>
              <li>Packages uncollected after 72 hours are moved to secondary overflow storage.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Barcode & QR Scanner Modal */}
      {scannerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scan size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Parcel Intake Barcode Scanner</h3>
              </div>
              <X size={18} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={stopCameraScanner} />
            </div>

            {/* Video Viewport / Laser Scan Effect */}
            <div style={{ position: 'relative', width: '100%', height: '220px', background: '#020617', borderRadius: '12px', overflow: 'hidden', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Animated Laser line overlay */}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: '2px',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444'
              }} />

              <span style={{ position: 'absolute', bottom: '10px', fontSize: '11px', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.8)', padding: '2px 8px', borderRadius: '4px' }}>
                Center parcel shipping label barcode inside box
              </span>
            </div>

            {/* Manual Tracking Code Fallback */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8' }}>Quick Lookup by Barcode Tracking ID:</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="e.g. TRK-98214 or TRK-44120"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
                <button
                  onClick={() => handleSimulateScan(manualCode)}
                  style={{ padding: '8px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Locate Bin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}