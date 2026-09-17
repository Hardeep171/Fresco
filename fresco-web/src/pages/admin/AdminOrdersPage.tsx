import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Filter,
  Eye,
  Calendar,
  User,
  ArrowUpDown,
} from "lucide-react";
import { orderApi } from "../../api/order.api";
import { Order, OrderStatus } from "../../types/order.types";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { PaymentStatusBadge } from "../../components/common/PaymentStatusBadge";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Placed", value: "PLACED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Pickup Assigned", value: "PICKUP_ASSIGNED" },
  { label: "Picked Up", value: "PICKED_UP" },
  { label: "In Process", value: "IN_PROCESS" },
  { label: "Ready for Delivery", value: "READY_FOR_DELIVERY" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderApi.getAllOrders({
        status: activeTab !== "ALL" ? activeTab : undefined,
        limit: 100,
      });
      setOrders(Array.isArray(response) ? response : (response as any).orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    if (status === "ALL") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      const orderId = order._id.toLowerCase();
      const customerName =
        typeof order.userId === "object" && order.userId
          ? `${order.userId.firstName || ""} ${order.userId.lastName || ""}`.toLowerCase()
          : "";
      const customerEmail =
        typeof order.userId === "object" && order.userId?.email
          ? order.userId.email.toLowerCase()
          : "";
      const customerPhone =
        typeof order.userId === "object" && order.userId?.phone
          ? order.userId.phone.toLowerCase()
          : "";

      return (
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        customerPhone.includes(query)
      );
    });
  }, [orders, searchQuery]);

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
            Orders Management
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Monitor and control laundry processing, partner dispatches, and payments.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchOrders}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.15s ease",
              backgroundColor:
                activeTab === tab.value ? "var(--primary)" : "var(--card-bg)",
              color: activeTab === tab.value ? "#ffffff" : "var(--text-secondary)",
              boxShadow: activeTab === tab.value ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Stats Bar */}
      <Card className="fresco-card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ flex: "1 1 300px", maxWidth: "450px", width: "100%" }}>
            <Input
              type="text"
              placeholder="Search by Order ID, Customer Name, Email, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Showing <strong>{filteredOrders.length}</strong> {filteredOrders.length === 1 ? "order" : "orders"}
          </div>
        </div>
      </Card>

      {/* Orders Cards Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="fresco-card">
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <ShoppingBag size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No orders found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              {searchQuery
                ? "Try adjusting your search criteria."
                : `No orders currently in "${activeTab}" status.`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="admin-card-grid-3">
          {filteredOrders.map((order) => {
            const customerName =
              typeof order.userId === "object" && order.userId
                ? `${order.userId.firstName || ""} ${order.userId.lastName || ""}`.trim() || "Customer"
                : "Customer";
            const customerEmail =
              typeof order.userId === "object" ? order.userId?.email : "";
            const customerPhone =
              typeof order.userId === "object" ? order.userId?.phone : "";

            const totalGarments =
              order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
            const displayAmount = order.pricing?.totalAmount ?? order.totalAmount ?? 0;
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card
                key={order._id}
                className="fresco-card-hover"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  padding: "1.25rem",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div>
                  {/* Card Header: Order ID + Badges */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                        Order ID
                      </span>
                      <div style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--text-primary)" }}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                      <OrderStatusBadge status={order.orderStatus || order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  {/* Customer Box */}
                  <div style={{ padding: "0.75rem", backgroundColor: "var(--surface-muted)", borderRadius: "var(--radius-sm)", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                      <User size={14} color="var(--primary)" />
                      <span style={{ wordBreak: "break-word" }}>{customerName}</span>
                    </div>
                    {customerPhone && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.125rem" }}>
                        📞 {customerPhone}
                      </div>
                    )}
                    {customerEmail && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-word" }}>
                        ✉ {customerEmail}
                      </div>
                    )}
                  </div>

                  {/* Order Details Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem", fontSize: "0.8125rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Garments & Care</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{totalGarments} items</span>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{order.items?.length || 0} unique services</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Total ({order.paymentMethod || "CASH"})</span>
                      <span style={{ fontWeight: 800, fontSize: "1.1875rem", color: "var(--primary)" }}>₹{displayAmount}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem" }}>
                    <Calendar size={13} />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* Card Action */}
                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.375rem",
                      padding: "0.625rem 1rem",
                      minHeight: "40px",
                      fontWeight: 600,
                      textDecoration: "none",
                      fontSize: "0.875rem",
                    }}
                  >
                    <Eye size={15} /> Manage Order & Lifecycle
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
