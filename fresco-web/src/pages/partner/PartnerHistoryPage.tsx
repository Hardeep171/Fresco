import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Truck,
  Calendar,
  DollarSign,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { usePartnerAssignments } from "../../hooks/usePartnerAssignments";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";

export const PartnerHistoryPage: React.FC = () => {
  const { assignments, isFetchingAssignments, loadAssignments } =
    usePartnerAssignments();

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const completedAssignments = assignments.filter((a) => a.status === "COMPLETED");

  return (
    <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
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
            Task History & Performance
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Review completed pickup and delivery assignments.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadAssignments()}
          isLoading={isFetchingAssignments}
          leftIcon={<RefreshCw size={14} />}
        >
          Refresh
        </Button>
      </div>

      {/* Summary Stat */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Card className="fresco-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
              }}
            >
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {completedAssignments.length}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Total Successfully Completed Deliveries & Pickups
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* History Table */}
      <Card className="fresco-card">
        {isFetchingAssignments && assignments.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Spinner size="lg" color="var(--primary)" />
          </div>
        ) : completedAssignments.length === 0 ? (
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Truck size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No completed tasks yet
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              Completed assignments will appear here once fulfilled.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="fresco-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Order
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Assignment Type
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Notes
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Completed At
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedAssignments.map((task) => {
                  const orderId =
                    typeof task.orderId === "object" ? task.orderId._id : task.orderId;
                  const dateStr = task.updatedAt
                    ? new Date(task.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr key={task._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.875rem 1rem", fontWeight: 700, fontSize: "0.875rem" }}>
                        #{orderId?.substring(orderId.length - 8).toUpperCase()}
                      </td>

                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor:
                              task.assignmentType === "PICKUP"
                                ? "rgba(59, 130, 246, 0.15)"
                                : "rgba(16, 185, 129, 0.15)",
                            color:
                              task.assignmentType === "PICKUP"
                                ? "var(--primary)"
                                : "var(--success)",
                          }}
                        >
                          {task.assignmentType}
                        </span>
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                        {task.notes || "—"}
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {dateStr}
                      </td>

                      <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            color: "var(--success)",
                          }}
                        >
                          COMPLETED
                        </span>
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
