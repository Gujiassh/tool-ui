"use client";

import { DataTable } from "@/components/tool-ui/data-table";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import { ToolUI } from "@/components/tool-ui/shared";
import { createDecisionResult } from "@/components/tool-ui/shared/schema";

export function ActionsExamples() {
  return (
    <>
      <h2>Local Action Example</h2>

      <ToolUI id="local-actions-table">
        <div className="not-prose flex max-w-2xl flex-col gap-3">
          <ToolUI.Surface>
            <DataTable
              id="local-actions-table"
              rowIdKey="id"
              columns={[
                { key: "merchant", label: "Merchant" },
                { key: "amount", label: "Amount", align: "right" },
              ]}
              data={[
                { id: "1", merchant: "Delta Airlines", amount: 847 },
                { id: "2", merchant: "Acme Hotel", amount: 312 },
              ]}
            />
          </ToolUI.Surface>
          <ToolUI.Actions>
            <ToolUI.LocalActions
              actions={[
                { id: "export-csv", label: "Export CSV", variant: "secondary" },
                { id: "open-report", label: "Open Full Report", variant: "outline" },
              ]}
              onAction={(actionId) => {
                console.log("Local action:", actionId);
              }}
            />
          </ToolUI.Actions>
        </div>
      </ToolUI>

      <h2>Decision Action Example</h2>

      <ToolUI id="decision-actions-order">
        <div className="not-prose flex max-w-md flex-col gap-3">
          <ToolUI.Surface>
            <OrderSummary
              id="decision-actions-order"
              title="Order Summary"
              items={[
                { id: "sku-1", name: "Wireless Keyboard", unitPrice: 89, quantity: 1 },
                { id: "sku-2", name: "Mouse", unitPrice: 49, quantity: 1 },
              ]}
              pricing={{
                subtotal: 138,
                shipping: 0,
                tax: 12.42,
                total: 150.42,
                currency: "USD",
              }}
            />
          </ToolUI.Surface>
          <ToolUI.Actions>
            <ToolUI.DecisionActions
              actions={[
                { id: "cancel", label: "Cancel", variant: "outline" },
                { id: "confirm", label: "Purchase", variant: "default" },
              ]}
              onAction={(action) =>
                createDecisionResult({
                  decisionId: "decision-actions-order-decision",
                  action,
                })
              }
              onCommit={(result) => {
                console.log("Commit decision envelope:", result);
                // In tool renderers this is typically: addResult(result)
              }}
            />
          </ToolUI.Actions>
        </div>
      </ToolUI>
    </>
  );
}
