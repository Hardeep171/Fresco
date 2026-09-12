import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Package, Sparkles } from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import { OrderCard } from "../../components/customer/OrderCard";
import { EmptyState } from "../../components/common/EmptyState";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";
import {
  CUSTOMER_ORDER_FILTER_TABS,
  CustomerOrderFilterTab,
} from "../../constants/order.constants";

export const OrdersPage: React.FC = () => {
  const {
    orders,
    isFetchingOrders,
    ordersError,
    loadUserOrders,
    clearErrors,
  } = useOrders();

  const [activeTab, setActiveTab] = React.useState<CustomerOrderFilterTab>("ALL");

  useEffect(() => {
    loadUserOrders();
  }, [loadUserOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "ACTIVE") {
      return orders.filter(
        (o) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED"
      );
    }
    if (activeTab === "COMPLETED") {
      return orders.filter((o) => o.orderStatus === "DELIVERED");
    }
    if (activeTab === "CANCELLED") {
      return orders.filter((o) => o.orderStatus === "CANCELLED");
    }
    return orders;
  }, [orders, activeTab]);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Order History & Tracking
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Track the live operational lifecycle of your garments
        </p>
      </div>

      {ordersError && (
        <Alert
          type="error"
          message={ordersError.message || "Failed to load orders"}
          onClose={clearErrors}
        />
      )}

      {/* Filter Tabs */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div className="tabs-container">
          {CUSTOMER_ORDER_FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              {tab === "ALL" ? ` (${orders.length})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isFetchingOrders && orders.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title={`No ${activeTab.toLowerCase()} orders found`}
          description="Place an order from our catalog to experience premium garment care."
          action={
            <Link to="/catalog" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={16} /> Explore Catalog
            </Link>
          }
        />
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
