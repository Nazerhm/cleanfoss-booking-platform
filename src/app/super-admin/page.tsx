'use client'
import { signOut } from 'next-auth/react'

export default function SuperAdminDashboard() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>CleanFoss Super Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      <p>Welcome to your admin panel!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Quick Stats</h2>
        <p>✅ Authentication system: Working</p>
        <p>✅ Database: Connected</p>
        <p>✅ Admin access: Granted</p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Next Steps:</h3>
        <ul>
          <li>Add company management</li>
          <li>Build booking system</li>
          <li>Implement payment processing</li>
        </ul>
      </div>
    </div>
  )
}