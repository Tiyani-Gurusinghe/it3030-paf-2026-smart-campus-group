import useAuth from "../../features/auth/hooks/useAuth";

function ProfilePage() {
  const { user, roles, primaryRole } = useAuth();

  return (
    <div className="page" style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '40px 20px'
    }}>
      <div style={{
          background: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a40 100%)',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '800px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
      }}>
          {/* Decorative background element */}
          <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '50%',
              opacity: '0.2',
              filter: 'blur(40px)'
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
              <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: '0 10px 20px rgba(99, 102, 241, 0.4)',
                  border: '4px solid rgba(255,255,255,0.1)'
              }}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                  <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800', letterSpacing: '-1px' }}>
                      {user?.fullName ?? "—"}
                  </h1>
                  <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '18px' }}>
                      {user?.email ?? "—"}
                  </p>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <span style={{ 
                          background: 'rgba(99, 102, 241, 0.2)', 
                          color: '#818cf8', 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '14px', 
                          fontWeight: '600',
                          border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}>
                          {primaryRole}
                      </span>
                  </div>
              </div>
          </div>

          <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(10px)', 
              borderRadius: '16px', 
              padding: '30px',
              border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#e2e8f0', fontWeight: '600' }}>Account Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>User ID</div>
                <div style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '500' }}>{user?.id ?? "—"}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>All Roles</div>
                <div style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '500' }}>{roles.join(", ") || "USER"}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Authentication Status</div>
                <div style={{ color: '#4ade80', fontSize: '16px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
                    Verified
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default ProfilePage;
