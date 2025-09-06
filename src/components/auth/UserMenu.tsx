/**
 * User Menu Dropdown Component
 * Provides authenticated user options with role-based features
 */

'use client';

import { Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { 
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const userRole = user?.role || 'CUSTOMER';
  
  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      {
        name: 'Min profil',
        href: '/profile',
        icon: UserIcon,
        description: 'Rediger dine oplysninger'
      },
      {
        name: 'Mine bookinger',
        href: '/profile/bookings',
        icon: CalendarDaysIcon,
        description: 'Se dine reservationer'
      },
      {
        name: 'Mine køretøjer',
        href: '/profile/vehicles',
        icon: TruckIcon,
        description: 'Administrer køretøjer'
      },
      {
        name: 'Betalinger',
        href: '/profile/payments',
        icon: CreditCardIcon,
        description: 'Se betalingshistorik'
      }
    ];

    const adminItems = [];
    
    // Add admin items for ADMIN and SUPER_ADMIN roles
    if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      adminItems.push(
        {
          name: 'Admin Dashboard',
          href: '/admin',
          icon: ShieldCheckIcon,
          description: 'Administrationspanel'
        },
        {
          name: 'Brugeradministration',
          href: '/admin/users',
          icon: UserIcon,
          description: 'Administrer brugere'
        }
      );
    }

    // Add super admin items
    if (userRole === 'SUPER_ADMIN') {
      adminItems.push({
        name: 'System Administration',
        href: '/super-admin',
        icon: BuildingOfficeIcon,
        description: 'Systemadministration'
      });
    }

    return [...baseItems, ...adminItems];
  };

  const handleSignOut = async () => {
    const confirmed = window.confirm('Er du sikker på, at du vil logge ud?');
    if (confirmed) {
      await signOut({ callbackUrl: '/' });
    }
  };

  const menuItems = getMenuItems();
  const initials = user.name ? 
    user.name.split(' ').map(n => n[0]).join('').toUpperCase() :
    user.email?.charAt(0).toUpperCase() || 'U';

  const roleColors = {
    SUPER_ADMIN: 'bg-purple-600',
    ADMIN: 'bg-red-600',
    AGENT: 'bg-blue-600',
    FINANCE: 'bg-green-600',
    CUSTOMER: 'bg-gray-600'
  };

  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrator',
    AGENT: 'Agent',
    FINANCE: 'Økonomi',
    CUSTOMER: 'Kunde'
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center gap-2 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-50 p-1 transition-colors">
          <div className={`h-8 w-8 rounded-full ${roleColors[userRole as keyof typeof roleColors]} flex items-center justify-center`}>
            <span className="text-xs font-medium text-white">
              {initials}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900">
              {user.name || 'Bruger'}
            </div>
            <div className="text-xs text-gray-500">
              {roleLabels[userRole as keyof typeof roleLabels]}
            </div>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Item>
          {({ active }) => (
            <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {/* User Info Header */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${roleColors[userRole as keyof typeof roleColors]} flex items-center justify-center`}>
                    <span className="text-sm font-medium text-white">
                      {initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || 'Ukendt bruger'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {roleLabels[userRole as keyof typeof roleLabels]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {menuItems.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'group flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors'
                        )}
                      >
                        <item.icon
                          className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>

              {/* Settings & Logout */}
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/profile/settings"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'group flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors'
                      )}
                    >
                      <CogIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Indstillinger
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'group flex w-full items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors'
                      )}
                    >
                      <ArrowLeftOnRectangleIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Log ud
                    </button>
                  )}
                </Menu.Item>
              </div>
            </div>
          )}
        </Menu.Item>
      </Transition>
    </Menu>
  );
}
