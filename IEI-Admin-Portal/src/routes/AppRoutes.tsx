import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MembersListPage } from '../pages/MembersListPage';
import { MemberDetailPage } from '../pages/MemberDetailPage';
import { ApplicationsListPage } from '../pages/ApplicationsListPage';
import { ApplicationDetailPage } from '../pages/ApplicationDetailPage';
import { SubscriptionsPage } from '../pages/SubscriptionsPage';
import { EventsListPage } from '../pages/EventsListPage';
import { EventCreateEditPage } from '../pages/EventCreateEditPage';
import { EventDetailPage } from '../pages/EventDetailPage';
import { CheckinPage } from '../pages/CheckinPage';
import { RegistersPage } from '../pages/RegistersPage';
import { WingsPage } from '../pages/WingsPage';
import { JobsPage } from '../pages/JobsPage';
import { ContentPage } from '../pages/ContentPage';
import { CommunicationPage } from '../pages/CommunicationPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Specialized officer workbenches
import { TreasurerPage } from '../pages/TreasurerPage';
import { SecretaryPage } from '../pages/SecretaryPage';
import { ChairmanPage } from '../pages/ChairmanPage';

import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 5.1 Authentication Route */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* 403 Forbidden Page */}
      <Route path="/admin/forbidden" element={<ForbiddenPage />} />

      {/* Protected Admin Shell with Global Layout (Sidebar, Header, Breadcrumbs) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* 5.2 Dashboard */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* 5.3 & 5.4 Members */}
        <Route path="members" element={<MembersListPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />

        {/* 5.5 & 5.6 Membership Applications */}
        <Route path="membership-applications" element={<ApplicationsListPage />} />
        <Route path="membership-applications/:id" element={<ApplicationDetailPage />} />

        {/* 5.7 Subscriptions & Receipts */}
        <Route path="subscriptions" element={<SubscriptionsPage />} />

        {/* 5.8, 5.9, 5.10 Events, Programs & Check-in Desk */}
        <Route path="events" element={<EventsListPage />} />
        <Route path="events/new" element={<EventCreateEditPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="events/:id/edit" element={<EventCreateEditPage />} />
        <Route path="events/:id/participants" element={<EventDetailPage />} />
        <Route path="events/:id/check-in" element={<CheckinPage />} />
        <Route path="checkin" element={<CheckinPage />} />

        {/* 5.11 Registers */}
        <Route path="registers" element={<RegistersPage />} />
        <Route path="registers/:category" element={<RegistersPage />} />

        {/* 5.12 Wings */}
        <Route path="wings" element={<WingsPage />} />
        <Route path="wings/:slug" element={<WingsPage />} />

        {/* 5.13 Jobs Review */}
        <Route path="jobs" element={<JobsPage />} />

        {/* 5.14 Content Management */}
        <Route path="content" element={<ContentPage />} />
        <Route path="content/:section" element={<ContentPage />} />

        {/* 5.15 Communication */}
        <Route path="communication" element={<CommunicationPage />} />
        <Route path="communication/notifications" element={<CommunicationPage />} />
        <Route path="communication/whatsapp" element={<CommunicationPage />} />

        {/* 5.16 Reports */}
        <Route path="reports" element={<ReportsPage />} />

        {/* 5.17 Settings */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/:tab" element={<SettingsPage />} />

        {/* 5.18 Profile */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Specific Executive Officer Workbenches */}
        <Route
          path="treasurer"
          element={
            <ProtectedRoute requiredPermission="ACCESS_TREASURER_WORKBENCH">
              <TreasurerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="secretary"
          element={
            <ProtectedRoute requiredPermission="ACCESS_SECRETARY_WORKBENCH">
              <SecretaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="chairman"
          element={
            <ProtectedRoute requiredPermission="ACCESS_CHAIRMAN_DESK">
              <ChairmanPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Root redirect to /admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* 404 Catch-All Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
