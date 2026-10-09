import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Navbar from "./components/layout/Navbar";
import RoleRoute from "./components/common/RoleRoute";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateTicket from "./pages/customer/CreateTicket";
import MyTickets from "./pages/customer/MyTickets";
import TicketDetails from "./pages/customer/TicketDetails";
import AgentTickets from "./pages/agent/AgentTickets";
import AgentTicketDetails from "./pages/agent/AgentTicketDetails";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/customer/dashboard"
          element={
            <RoleRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/agent/dashboard"
          element={
            <RoleRoute allowedRoles={["AGENT"]}>
              <AgentDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/customer/tickets/new"
          element={
            <RoleRoute allowedRoles={["CUSTOMER"]}>
              <CreateTicket />
            </RoleRoute>
          }
        />

        <Route
          path="/customer/tickets"
          element={
            <RoleRoute allowedRoles={["CUSTOMER"]}>
              <MyTickets />
            </RoleRoute>
          }
        />

        <Route
          path="/customer/tickets/:ticketId"
          element={
            <RoleRoute allowedRoles={["CUSTOMER"]}>
              <TicketDetails />
            </RoleRoute>
          }
        />
        <Route
          path="/agent/tickets"
          element={
            <RoleRoute allowedRoles={["AGENT"]}>
              <AgentTickets />
            </RoleRoute>
          }
        />

        <Route
          path="/agent/tickets/:ticketId"
          element={
            <RoleRoute allowedRoles={["AGENT"]}>
              <AgentTicketDetails />
            </RoleRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;