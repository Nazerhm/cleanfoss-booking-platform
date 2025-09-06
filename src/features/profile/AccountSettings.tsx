'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

interface DeleteAccountData {
  password: string;
  confirmation: string;
}

interface NotificationSettings {
  emailBookingConfirmations: boolean;
  emailBookingReminders: boolean;
  emailPromotionalOffers: boolean;
  smsBookingConfirmations: boolean;
  smsBookingReminders: boolean;
}

export function AccountSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState<DeleteAccountData>({
    password: '',
    confirmation: '',
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailBookingConfirmations: true,
    emailBookingReminders: true,
    emailPromotionalOffers: false,
    smsBookingConfirmations: false,
    smsBookingReminders: false,
  });

  // Load notification settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.notifications) {
            setNotifications(result.data.notifications);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleNotificationChange = async (setting: keyof NotificationSettings, value: boolean) => {
    const updatedNotifications = { ...notifications, [setting]: value };
    setNotifications(updatedNotifications);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: updatedNotifications,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Indstillinger opdateret' });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fejl ved opdatering af indstillinger' });
      // Revert the change on error
      setNotifications(notifications);
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountData.confirmation !== 'SLET MIN KONTO') {
      setMessage({ type: 'error', text: 'Du skal skrive "SLET MIN KONTO" for at bekræfte' });
      return;
    }

    if (!deleteAccountData.password) {
      setMessage({ type: 'error', text: 'Du skal indtaste dit kodeord' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deleteAccountData.password,
          confirmation: deleteAccountData.confirmation,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Din konto bliver slettet. Du bliver logget ud nu.' });
        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Fejl ved sletning af konto' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Der opstod en fejl. Prøv igen senere.' });
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `cleanfoss-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ type: 'success', text: 'Dine data er downloadet' });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fejl ved eksport af data' });
    } finally {
      setLoading(false);
    }

    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifikationsindstillinger</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Email notifikationer</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.emailBookingConfirmations}
                    onChange={(e) => handleNotificationChange('emailBookingConfirmations', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bookingbekræftelser via email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.emailBookingReminders}
                    onChange={(e) => handleNotificationChange('emailBookingReminders', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Påmindelser om bookinger via email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.emailPromotionalOffers}
                    onChange={(e) => handleNotificationChange('emailPromotionalOffers', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tilbud og nyheder via email</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">SMS notifikationer</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.smsBookingConfirmations}
                    onChange={(e) => handleNotificationChange('smsBookingConfirmations', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bookingbekræftelser via SMS</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.smsBookingReminders}
                    onChange={(e) => handleNotificationChange('smsBookingReminders', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Påmindelser om bookinger via SMS</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mine data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Du kan downloade alle dine data fra CleanFoss i JSON-format. Dette inkluderer din profil, 
            bookinger, køretøjsoplysninger og betalingshistorik.
          </p>
          
          <button
            onClick={exportUserData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Eksporterer...' : 'Download mine data'}
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kontoinformation</h3>
          
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Bruger ID</dt>
              <dd className="text-sm text-gray-900">{session?.user?.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email adresse</dt>
              <dd className="text-sm text-gray-900">{session?.user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rolle</dt>
              <dd className="text-sm text-gray-900">
                {session?.user?.role === 'CUSTOMER' ? 'Kunde' : session?.user?.role}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Konto oprettet</dt>
              <dd className="text-sm text-gray-900">
                Ikke tilgængelig
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4">Farezone</h3>
          
          {!showDeleteConfirmation ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Når du sletter din konto, vil alle dine data blive permanent fjernet. 
                Dette inkluderer din profil, bookinger, køretøjsoplysninger og betalingshistorik.
                <strong className="text-red-600"> Denne handling kan ikke fortrydes.</strong>
              </p>
              
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Slet min konto
              </button>
            </div>
          ) : (
            <div className="border border-red-200 rounded-md p-4 bg-red-50">
              <h4 className="text-sm font-medium text-red-900 mb-4">
                Bekræft kontosletning
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="confirm-text" className="block text-sm font-medium text-gray-700 mb-1">
                    Skriv "SLET MIN KONTO" for at bekræfte:
                  </label>
                  <input
                    type="text"
                    id="confirm-text"
                    value={deleteAccountData.confirmation}
                    onChange={(e) => setDeleteAccountData({ 
                      ...deleteAccountData, 
                      confirmation: e.target.value 
                    })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="SLET MIN KONTO"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Indtast dit kodeord for at bekræfte:
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={deleteAccountData.password}
                    onChange={(e) => setDeleteAccountData({ 
                      ...deleteAccountData, 
                      password: e.target.value 
                    })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sletter...' : 'Slet min konto permanent'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteAccountData({ password: '', confirmation: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Annuller
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
