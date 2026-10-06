import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';
import type { AdminPermission } from '../types/permissions.types';
import type { OfficePosition } from '../types/auth.types';
import { formatPositionTitle } from '../permissions/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
  requiredPositions?: OfficePosition[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPositions,
}) => {
  const { user, isAuthenticated, isLoading, checkPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullHeight label="Verifying admin credentials..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Permission Check
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-8 lg:p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#FFF3E0] text-[#ED6C02] flex items-center justify-center mx-auto mb-4 border border-[#FFE0B2]">
          <ShieldAlert size={28} />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#201E1D] mb-2">
          Restricted Officer Access
        </h3>
        <p className="text-sm text-[#686055] leading-relaxed mb-6">
          This administrative workbench requires specific Chapter Executive privileges.
          Your current account (<span className="font-mono font-medium text-[#201E1D]">{user.memberCode}</span>) does not hold the required authorization.
        </p>

        {requiredPositions && requiredPositions.length > 0 && (
          <div className="p-3.5 bg-[#F5EAD8] rounded-xl text-xs text-[#201E1D] mb-6 border border-[#E2D5C0]">
            <span className="font-semibold block mb-1">Authorized Position:</span>
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {requiredPositions.map((pos) => (
                <span
                  key={pos}
                  className="px-2 py-0.5 bg-[#FFFDF9] rounded border border-[#D4C8B8] font-semibold text-[#8F7726]"
                >
                  {formatPositionTitle(pos)}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 bg-[#273318] hover:bg-[#1D2612] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
        >
          Return to Previous Screen
        </button>
      </div>
    );
  }

  // Direct Position Check
  if (
    requiredPositions &&
    requiredPositions.length > 0 &&
    !requiredPositions.some((p) => user.positions.includes(p))
  ) {
    return (
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-8 lg:p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#FFF3E0] text-[#ED6C02] flex items-center justify-center mx-auto mb-4 border border-[#FFE0B2]">
          <ShieldAlert size={28} />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#201E1D] mb-2">
          Position Clearance Required
        </h3>
        <p className="text-sm text-[#686055] leading-relaxed mb-6">
          You must be an assigned{' '}
          <strong className="text-[#201E1D]">
            {requiredPositions.map(formatPositionTitle).join(' or ')}
          </strong>{' '}
          to access this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
