import React from 'react'
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Layout from './components/layout/Layout'
import ProtectedRoute from './routes/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'

import Dashboard from './pages/dashboard/Dashboard'

import MasterHome from './pages/master/MasterHome'
import GroupCompanies from './pages/master/GroupCompanies'
import GroupCompanyDetail from './pages/master/GroupCompanyDetail'
import Banks from './pages/master/Banks'
import Clients from './pages/master/Clients'
import Vendors from './pages/master/Vendors'
import GuaranteeTypes from './pages/master/GuaranteeTypes'

import FdList from './pages/fd/FdList'
import LcList from './pages/lc/LcList'
import BgList from './pages/bg/BgList'

import BgDetails from './pages/bg/BgDetails'
import LcDetails from './pages/lc/LcDetails'

import FdLinkPage from './pages/fdlink/FdLinkPage'

import Reports from './pages/reports/Reports'
import BankLimits from './pages/banklimits/BankLimits'
import Alerts from './pages/alerts/Alerts'
import AuditLog from './pages/audit/AuditLog'
import Exposure from './pages/exposure/Exposure'


export default function App() {

  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================
          PROTECTED APPLICATION
      ========================== */}

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route
          index
          element={<Dashboard />}
        />


        {/* =========================
            MASTER DATA
        ========================== */}

        <Route
          path="master"
          element={<MasterHome />}
        >

          <Route
            index
            element={
              <Navigate
                to="group-companies"
                replace
              />
            }
          />

          <Route
            path="group-companies"
            element={<GroupCompanies />}
          />

          {/* NEW COMPANY DETAIL PAGE */}
          <Route
            path="group-companies/:id"
            element={<GroupCompanyDetail />}
          />

          <Route
            path="banks"
            element={<Banks />}
          />

          <Route
            path="clients"
            element={<Clients />}
          />

          <Route
            path="vendors"
            element={<Vendors />}
          />

          <Route
            path="guarantee-types"
            element={<GuaranteeTypes />}
          />

        </Route>


        {/* =========================
            TRANSACTION MODULES
        ========================== */}

        <Route
          path="fd"
          element={<FdList />}
        />

        <Route
          path="bg"
          element={<BgList />}
        />

        <Route
          path="bg/:id"
          element={<BgDetails />}
        />

        <Route
          path="lc"
          element={<LcList />}
        />

        <Route
          path="lc/:id"
          element={<LcDetails />}
        />

        <Route
          path="fd-linking"
          element={<FdLinkPage />}
        />


        {/* =========================
            CONTROL / REPORTING
        ========================== */}

        <Route
          path="bank-limits"
          element={<BankLimits />}
        />

        <Route
          path="alerts"
          element={<Alerts />}
        />

        <Route
          path="exposure"
          element={<Exposure />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />

        <Route
          path="audit-log"
          element={<AuditLog />}
        />

      </Route>


      {/* Unknown URL */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  )
}