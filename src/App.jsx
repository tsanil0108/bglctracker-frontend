import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './routes/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/dashboard/Dashboard'

import MasterHome from './pages/master/MasterHome'
import GroupCompanies from './pages/master/GroupCompanies'
import Banks from './pages/master/Banks'
import Clients from './pages/master/Clients'
import Vendors from './pages/master/Vendors'
import GuaranteeTypes from './pages/master/GuaranteeTypes'

import FdList from './pages/fd/FdList'
import LcList from './pages/lc/LcList'
import BgList from './pages/bg/BgList'
import FdLinkPage from './pages/fdlink/FdLinkPage'
import Reports from './pages/reports/Reports'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="master" element={<MasterHome />}>
          <Route index element={<Navigate to="group-companies" replace />} />
          <Route path="group-companies" element={<GroupCompanies />} />
          <Route path="banks" element={<Banks />} />
          <Route path="clients" element={<Clients />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="guarantee-types" element={<GuaranteeTypes />} />
        </Route>

        <Route path="fd" element={<FdList />} />
        <Route path="lc" element={<LcList />} />
        <Route path="bg" element={<BgList />} />
        <Route path="fd-linking" element={<FdLinkPage />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
