import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProfile, useProfilePicture } from '../lib/api/auth';
import { useStudent } from '../lib/api/students';
import { useSystemConfig } from '../lib/api/system';
import QRCodeModal from './QRCodeModal';
import InstallApp from './InstallApp';
import apiClient from '../lib/axios';
import Image from 'next/image';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInstallApp, setShowInstallApp] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  
  // Use React Query to get user profile data
  const { data: user, isLoading, error } = useProfile();
  const { data: profilePictureUrl } = useProfilePicture();
  const { data: systemConfig } = useSystemConfig();
  const isScoringEnabled = systemConfig?.scoring_system === true || systemConfig?.scoring_system === 'true';

  // Fallback user object if data is not available yet
  const userData = user || { name: '', id: '', phone: '', role: '' };
  
  // If user is a student, fetch student data from students collection
  const studentId = userData.role === 'student' && userData.id ? userData.id.toString() : null;
  const { data: studentData } = useStudent(studentId, { enabled: !!studentId });


  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/');
    }
  };

  const handleManageAssistants = () => {
    router.push('/manage_assistants');
  };

  const handleEditProfile = () => {
    router.push('/edit_my_profile');
  };

  const handleContactDeveloper = () => {
    router.push('/contact_developer');
  };

  const handleSubscriptionDashboard = () => {
    router.push('/subscription_dashboard');
  };

  const handleChangePassword = () => {
    router.push('/student_dashboard/change_password');
  };

  const handleMyQRCode = () => {
    setOpen(false); // Close the menu
    setShowQRModal(true);
  };

  const handleInstallApp = () => {
    setOpen(false); // Close the menu
    setShowInstallApp(true);
  };


  return (
    <div style={{ position: 'relative', marginRight: 32 }} ref={menuRef}>
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: profilePictureUrl ? 'transparent' : '#e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: open ? '0 2px 8px rgba(31,168,220,0.15)' : 'none',
          border: open ? '2px solid #1FA8DC' : '2px solid #e9ecef',
          transition: 'box-shadow 0.2s, border 0.2s',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={() => setOpen((v) => !v)}
        title={userData.name || userData.id}
      >
        {/* Use profile picture if available, else fallback to initial */}
        {profilePictureUrl ? (
          <Image
            src={profilePictureUrl}
            alt="Profile"
            fill
            style={{
              objectFit: 'cover',
              borderRadius: '50%'
            }}
            unoptimized
          />
        ) : (
        <span style={{ 
          fontWeight: 700, 
          fontSize: 22, 
          color: '#1FA8DC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          lineHeight: 1,
          textAlign: 'center'
        }}>
          {(() => {
            const displayName = userData.role === 'student' && studentData?.name 
              ? studentData.name 
              : userData.name;
            const displayId = userData.role === 'student' && studentData?.id 
              ? studentData.id.toString() 
              : userData.id?.toString();
            
            if (displayName && displayName.length > 0) {
              return displayName[0].toUpperCase();
            } else if (displayId && displayId.length > 0) {
              return displayId[0].toUpperCase();
            }
            return 'U';
          })()}
        </span>
        )}
      </div>
      {open && (
        <div style={{
          position: 'absolute',
          top: 54,
          right: 25,
          minWidth: 270,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(31,168,220,0.18)',
          border: '1.5px solid #e9ecef',
          zIndex: 10000,
          padding: '0 0 8px 0',
        }}>
          <div style={{
            padding: '18px 20px 12px 20px',
            borderBottom: '1px solid #e9ecef',
            textAlign: 'left',
            marginBottom: 8
          }}>
            {userData.role === 'student' && studentData ? (
              <>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#1FA8DC', marginBottom: 8 }}>
                  {studentData.name || 'Student'}
                </div>
                <div style={{ color: '#495057', fontSize: 15, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Image src="/user-circle3.svg" alt="User" width={18} height={18} />
                  ID: {studentData.id}
                </div>
                {studentData.grade && (
                  <div style={{ color: '#495057', fontSize: 15, fontWeight: 600 }}>
                    Grade: {studentData.grade}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#1FA8DC', marginBottom: 2 }}>{userData.name || userData.id}</div>
                <div style={{ color: '#495057', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Image src="/user-circle3.svg" alt="User" width={18} height={18} />
                  {userData.id ? `Username: ${userData.id}` : 'No Username'}
                </div>
              </>
            )}
          </div>
          <button style={menuBtnStyle} onClick={handleLogout}>
            <Image src="/logout.svg" alt="Logout" width={20} height={20} style={{ marginRight: '8px', filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(6871%) hue-rotate(349deg) brightness(93%) contrast(86%)' }} />
            Logout
          </button>
          {userData.role === 'student' && (
            <>
              <button style={menuBtnStyle} onClick={handleChangePassword}>
                <Image src="/key2.svg" alt="Password" width={20} height={20} style={{ marginRight: '8px' }} />
                Change My Password
              </button>
              <button style={menuBtnStyle} onClick={handleMyQRCode}>
                <Image src="/qrcode3.svg" alt="QR Code" width={20} height={20} style={{ marginRight: '8px' }} />
                My Qr Code
              </button>
            </>
          )}
          {userData.role !== 'student' && (
            <>
              <button style={menuBtnStyle} onClick={handleEditProfile}>
                <Image src="/user-edit2.svg" alt="Edit Profile" width={20} height={20} style={{ marginRight: '8px' }} />
                Edit My Profile
              </button>
              <button style={menuBtnStyle} onClick={() => {
                setOpen(false);
                router.push('/dashboard/public_link_generator');
              }}>
                <Image src="/link.svg" alt="Link" width={20} height={20} style={{ marginRight: '8px' }} />
                Public Link Generator
              </button>
              {(userData.role === 'admin' || userData.role === 'developer') && (
                <button style={menuBtnStyle} onClick={handleManageAssistants}>
                  <Image src="/settings.svg" alt="Settings" width={18} height={18} style={{ marginRight: '8px' }} />
                  Manage Assistants
                </button>
              )}
              {(userData.role === 'admin' || userData.role === 'developer' || userData.role === 'assistant') && (
                <>
                  <button style={menuBtnStyle} onClick={() => {
                    setOpen(false);
                    router.push('/dashboard/manage_online_system');
                  }}>
                    <Image src="/settings2.svg" alt="Settings" width={20} height={20} style={{ marginRight: '8px' }} />
                    Manage Online System
                  </button>
                  {isScoringEnabled && (
                    <button style={menuBtnStyle} onClick={() => {
                      setOpen(false);
                      router.push('/dashboard/manage_scoring_system');
                    }}>
                      <Image src="/star4.svg" alt="Scoring System" width={20} height={20} style={{ marginRight: '8px' }} />
                      Manage Scoring System
                    </button>
                  )}
                </>
              )}
            </>
          )}
          <button style={menuBtnStyle} onClick={handleContactDeveloper}>
            <Image src="/message2.svg" alt="Message" width={20} height={20} style={{ marginRight: '8px' }} />
            Contact Developer
          </button>
          <button style={menuBtnStyle} onClick={handleInstallApp}>
            <Image src="/download.svg" alt="Download" width={20} height={20} style={{ marginRight: '8px' }} />
            Install App
          </button>
        </div>
      )}
      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      <InstallApp isOpen={showInstallApp} onClose={() => setShowInstallApp(false)} />
    </div>
  );
}

const menuBtnStyle = {
  width: '100%',
  background: 'none',
  border: 'none',
  color: '#1FA8DC',
  fontWeight: 700,
  fontSize: 16,
  padding: '10px 20px',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: 8,
  transition: 'background 0.15s',
  marginBottom: 2,
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
}; 