import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AppStore from './pages/AppStore';
import OrchestratorChat from './pages/OrchestratorChat';
import LPODashboard from './pages/LPODashboard';
import ProcurementDashboard from './pages/ProcurementDashboard';
import DocumentAgent from './pages/DocumentAgent';
import ComplianceDashboard from './pages/ComplianceDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import ManufacturingDashboard from './pages/ManufacturingDashboard';
import ReturnsDashboard from './pages/ReturnsDashboard';
import AgentStudio from './pages/AgentStudio';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AgentProvider } from './contexts/AgentContext';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AgentProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<AppStore />} />
                
                <Route path="/chat" element={
                  <ProtectedRoute routePath="/chat">
                    <OrchestratorChat />
                  </ProtectedRoute>
                } />
                
                <Route path="/agent-studio" element={
                  <ProtectedRoute routePath="/agent-studio">
                    <AgentStudio />
                  </ProtectedRoute>
                } />
                
                <Route path="/lpo" element={
                  <ProtectedRoute routePath="/lpo">
                    <LPODashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/procurement" element={
                  <ProtectedRoute routePath="/procurement">
                    <ProcurementDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/documents" element={
                  <ProtectedRoute routePath="/documents">
                    <DocumentAgent />
                  </ProtectedRoute>
                } />
                
                <Route path="/compliance" element={
                  <ProtectedRoute routePath="/compliance">
                    <ComplianceDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/logistics" element={
                  <ProtectedRoute routePath="/logistics">
                    <LogisticsDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/manufacturing" element={
                  <ProtectedRoute routePath="/manufacturing">
                    <ManufacturingDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/returns" element={
                  <ProtectedRoute routePath="/returns">
                    <ReturnsDashboard />
                  </ProtectedRoute>
                } />
                
              </Routes>
            </Layout>
          </Router>
        </AgentProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;