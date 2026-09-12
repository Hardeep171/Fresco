import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { userApi } from "../../api/user.api";
import { orderApi } from "../../api/order.api";
import { AdminStats } from "../../types/user.types";
import { Order } from "../../types/order.types";
import { StatCard } from "../../components/admin/StatCard";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { PaymentStatusBadge } from "../../components/common/PaymentStatusBadge";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, ordersData] = await Promise.all([
        userApi.getAdminStats().catch(() => null),
        orderApi.getAllOrders({ limit: 8 }).catch(() => [] as Order[]),
      ]);

      if (statsData) {
        setStats(statsData);
      }
      if (ordersData) {
        setRecentOrders(Array.isArray(ordersData) ? ordersData : (ordersData as any).orders || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading && !stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Spinner size="lg" color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Operational Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Real-time overview of laundry operations, orders, and logistics.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Link to="/admin/orders" className="btn btn-primary btn-sm">
            Manage Orders
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders ?? recentOrders.length}
          subtitle="All-time placed orders"
          icon={<ShoppingBag size={20} />}
          variant="primary"
        />
        <StatCard
          title="Active Orders"
          value={stats?.activeOrders ?? 0}
          subtitle="In pickup, wash, or delivery"
          icon={<Clock size={20} />}
          variant="warning"
        />
        <StatCard
          title="Completed Orders"
          value={stats?.completedOrders ?? 0}
          subtitle="Successfully delivered"
          icon={<CheckCircle size={20} />}
          variant="success"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
          subtitle="Net verified earnings"
          icon={<TrendingUp size={20} />}
          variant="info"
        />
        <StatCard
          title="Active Partners"
          value={stats?.activePartners ?? 0}
          subtitle={`Out of ${stats?.totalPartners ?? 0} total partners`}
          icon={<Truck size={20} />}
          variant="secondary"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers ?? 0}
          subtitle={`Active: ${stats?.activeCustomers ?? 0}`}
          icon={<Users size={20} />}
          variant="secondary"
        />
      </div>

      {/* Quick Access Operational Shortcuts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <Link
          to="/admin/orders?status=PLACED"
          style={{ textDecoration: "none" }}
        >
          <Card
            className="fresco-card hover-lift"
            style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Pending Pickups
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Needs Partner Assignment
              </div>
            </div>
          </Card>
        </Link>

        <Link
          to="/admin/catalog"
          style={{ textDecoration: "none" }}
        >
          <Card
            className="fresco-card hover-lift"
            style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Catalog & Services
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Manage Items & Types
              </div>
            </div>
          </Card>
        </Link>

        <Link
          to="/admin/pricing"
          style={{ textDecoration: "none" }}
        >
          <Card
            className="fresco-card hover-lift"
            style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--warning)",
              }}
            >
              <TrendingUp size={18} />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Pricing Matrix
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Garment × Service Rates
              </div>
            </div>
          </Card>
        </Link>

        <Link
          to="/admin/users"
          style={{ textDecoration: "none" }}
        >
          <Card
            className="fresco-card hover-lift"
            style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8B5CF6",
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                User Directory
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Partners & Customers
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <Card className="fresco-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Recent Orders
            </h2>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Latest customer bookings requiring operational tracking
            </p>
          </div>
          <Link
            to="/admin/orders"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              textDecoration: "none",
            }}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <ShoppingBag size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No orders placed yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="fresco-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Order ID
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Customer
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Items
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Amount
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Order Status
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Payment
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const customerName =
                    typeof order.userId === "object" && order.userId
                      ? `${order.userId.firstName} ${order.userId.lastName}`
                      : "Customer";
                  const totalItems =
                    order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                  const displayAmount = order.pricing?.totalAmount ?? order.totalAmount ?? 0;

                  return (
                    <tr
                      key={order._id}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "0.875rem 1rem", fontWeight: 600, fontSize: "0.875rem" }}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem" }}>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{customerName}</div>
                        {typeof order.userId === "object" && order.userId?.email && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {order.userId.email}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                        {totalItems} garments
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                        ₹{displayAmount}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <OrderStatusBadge status={order.orderStatus || order.status} />
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
