/**
 * Breadcrumb Navigation Component
 * Provides contextual navigation with authentication awareness
 */

'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumb({ customItems, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Generate breadcrumb items from pathname if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const breadcrumbs: BreadcrumbItem[] = [];

    // Map of path segments to Danish labels
    const pathLabels: Record<string, string> = {
      'booking': 'Book Service',
      'profile': 'Min Profil',
      'vehicles': 'Mine Køretøjer',
      'bookings': 'Mine Bookinger',
      'payments': 'Betalinger',
      'services': 'Services',
      'admin': 'Administration',
      'super-admin': 'System Administration',
      'auth': 'Godkendelse',
      'signin': 'Log Ind',
      'signup': 'Opret Konto',
      'customer': 'Kunde',
    };

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (!breadcrumbItems.length) return null;

  return (
    <nav className="flex bg-white px-4 py-3 border-b border-gray-200" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-3">
        {/* Home breadcrumb */}
        {showHome && (
          <li>
            <div>
              <Link
                href="/"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <HomeIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Hjem</span>
              </Link>
            </div>
          </li>
        )}

        {/* Dynamic breadcrumbs */}
        {breadcrumbItems.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              {(showHome || index > 0) && (
                <ChevronRightIcon 
                  className="h-5 w-5 text-gray-300 mr-1 md:mr-3" 
                  aria-hidden="true" 
                />
              )}
              {item.current ? (
                <span 
                  className="text-sm font-medium text-gray-500"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Page Header with Breadcrumb
 * Combines breadcrumb with page title and optional actions
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showBreadcrumb?: boolean;
}

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbItems, 
  actions,
  showBreadcrumb = true 
}: PageHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
      {showBreadcrumb && <Breadcrumb customItems={breadcrumbItems} />}
      
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
