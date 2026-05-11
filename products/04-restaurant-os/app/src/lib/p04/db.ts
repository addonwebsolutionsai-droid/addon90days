/**
 * TableFlow (P04) — service-role database access helpers.
 *
 * All functions use the service-role Supabase client (bypasses RLS).
 * Authorization is enforced in this file by always scoping reads/writes via
 * owner_clerk_user_id through the restaurants ownership chain — callers never
 * get data for restaurants they don't own.
 *
 * Tax math is delegated to lib/p03/gst-calc.ts (shared engine). Restaurants
 * are always intra-state for dine-in (supply is within the restaurant's own
 * state), so we pass supplyType="intra_state" for Phase 1.
 *
 * Note: Supabase client is typed for the P01 schema (Database type). P04
 * tables are accessed via the same untyped wrapper as P02/P03. When we
 * generate a unified Database type, remove the cast.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { computeLine, computeInvoiceTotals } from "@/lib/p04/gst-calc";
import type {
  P04Restaurant,
  P04RestaurantInsert,
  P04Table,
  P04TableInsert,
  P04TableStatus,
  P04MenuCategory,
  P04MenuCategoryInsert,
  P04MenuItem,
  P04MenuItemInsert,
  P04Order,
  P04OrderItem,
  P04OrderDraft,
  P04OrderWithItems,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p04Table(tableName: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(tableName);
}

// ---------------------------------------------------------------------------
// Restaurants
// ---------------------------------------------------------------------------

export async function listRestaurants(userId: string): Promise<P04Restaurant[]> {
  const { data, error } = await p04Table("p04_restaurants")
    .select("*")
    .eq("owner_clerk_user_id", userId)
    .order("created_at", { ascending: false });
  if (error !== null) throw new Error(`listRestaurants: ${error.message}`);
  return (data ?? []) as P04Restaurant[];
}

export async function getRestaurant(
  id: string,
  userId: string,
): Promise<P04Restaurant | null> {
  const { data, error } = await p04Table("p04_restaurants")
    .select("*")
    .eq("id", id)
    .eq("owner_clerk_user_id", userId)
    .maybeSingle();
  if (error !== null) throw new Error(`getRestaurant: ${error.message}`);
  return (data ?? null) as P04Restaurant | null;
}

export async function createRestaurant(input: P04RestaurantInsert): Promise<P04Restaurant> {
  const { data, error } = await p04Table("p04_restaurants")
    .insert(input)
    .select()
    .single();
  if (error !== null) throw new Error(`createRestaurant: ${error.message}`);
  return data as P04Restaurant;
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/** Verify restaurant ownership before querying tables. */
async function requireRestaurant(
  restaurantId: string,
  userId: string,
): Promise<P04Restaurant> {
  const restaurant = await getRestaurant(restaurantId, userId);
  if (restaurant === null) {
    throw new Error(`requireRestaurant: restaurant ${restaurantId} not found or not owned by user`);
  }
  return restaurant;
}

export async function listTables(
  restaurantId: string,
  userId: string,
): Promise<P04Table[]> {
  await requireRestaurant(restaurantId, userId);
  const { data, error } = await p04Table("p04_tables")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("table_number");
  if (error !== null) throw new Error(`listTables: ${error.message}`);
  return (data ?? []) as P04Table[];
}

export async function createTable(
  input: P04TableInsert,
  userId: string,
): Promise<P04Table> {
  await requireRestaurant(input.restaurant_id, userId);
  const { data, error } = await p04Table("p04_tables")
    .insert({ ...input, current_order_id: null })
    .select()
    .single();
  if (error !== null) throw new Error(`createTable: ${error.message}`);
  return data as P04Table;
}

export async function updateTableStatus(
  id: string,
  status: P04TableStatus,
  userId: string,
  currentOrderId?: string | null,
): Promise<P04Table> {
  // Fetch the table first to get restaurant_id for ownership check.
  const { data: existing, error: fetchErr } = await p04Table("p04_tables")
    .select("restaurant_id")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr !== null || existing === null) {
    throw new Error(`updateTableStatus: table ${id} not found`);
  }
  await requireRestaurant((existing as { restaurant_id: string }).restaurant_id, userId);

  const patch: Record<string, unknown> = { status };
  // Allow explicit null to clear current_order_id when an order closes.
  if (currentOrderId !== undefined) patch["current_order_id"] = currentOrderId;

  const { data, error } = await p04Table("p04_tables")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error !== null) throw new Error(`updateTableStatus: ${error.message}`);
  return data as P04Table;
}

// ---------------------------------------------------------------------------
// Menu categories
// ---------------------------------------------------------------------------

export async function listMenuCategories(
  restaurantId: string,
  userId: string,
): Promise<P04MenuCategory[]> {
  await requireRestaurant(restaurantId, userId);
  const { data, error } = await p04Table("p04_menu_categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("sort_order");
  if (error !== null) throw new Error(`listMenuCategories: ${error.message}`);
  return (data ?? []) as P04MenuCategory[];
}

export async function createMenuCategory(
  input: P04MenuCategoryInsert,
  userId: string,
): Promise<P04MenuCategory> {
  await requireRestaurant(input.restaurant_id, userId);
  const { data, error } = await p04Table("p04_menu_categories")
    .insert(input)
    .select()
    .single();
  if (error !== null) throw new Error(`createMenuCategory: ${error.message}`);
  return data as P04MenuCategory;
}

// ---------------------------------------------------------------------------
// Menu items
// ---------------------------------------------------------------------------

export async function listMenuItems(
  restaurantId: string,
  userId: string,
): Promise<P04MenuItem[]> {
  await requireRestaurant(restaurantId, userId);
  const { data, error } = await p04Table("p04_menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_order");
  if (error !== null) throw new Error(`listMenuItems: ${error.message}`);
  return (data ?? []) as P04MenuItem[];
}

export async function createMenuItem(
  input: P04MenuItemInsert,
  userId: string,
): Promise<P04MenuItem> {
  await requireRestaurant(input.restaurant_id, userId);
  const { data, error } = await p04Table("p04_menu_items")
    .insert(input)
    .select()
    .single();
  if (error !== null) throw new Error(`createMenuItem: ${error.message}`);
  return data as P04MenuItem;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/**
 * createOrder — the keystone write for Phase 1.
 *
 * Steps:
 *   1. Verify restaurant ownership.
 *   2. Fetch each menu item to get price snapshot + GST rate.
 *   3. Compute per-item tax via computeLine() (intra_state, regular scheme).
 *   4. Aggregate totals via computeInvoiceTotals().
 *   5. Apply service charge.
 *   6. Reserve the next order number via the p04_next_order_number Postgres function.
 *   7. Insert order header + all order_items.
 *   8. If table_id provided, flip the table to 'occupied' + link current_order_id.
 *
 * All writes after step 6 are best-effort with a rollback on item insert
 * failure (same pattern as P03 insertInvoiceWithLines).
 */
export async function createOrder(
  draft: P04OrderDraft,
  userId: string,
): Promise<P04OrderWithItems> {
  const restaurant = await requireRestaurant(draft.restaurant_id, userId);

  // --- fetch menu items for price + GST snapshot -------------------------
  const menuItemIds = [...new Set(draft.items.map((i) => i.menu_item_id))];
  const { data: menuItemRows, error: menuErr } = await p04Table("p04_menu_items")
    .select("id, price, gst_rate_percent, is_available, restaurant_id")
    .in("id", menuItemIds)
    .eq("restaurant_id", draft.restaurant_id);

  if (menuErr !== null) throw new Error(`createOrder: menu fetch: ${menuErr.message}`);

  const menuMap = new Map<string, { price: number; gst_rate_percent: number; is_available: boolean }>();
  for (const row of (menuItemRows ?? []) as Array<{ id: string; price: number; gst_rate_percent: number; is_available: boolean; restaurant_id: string }>) {
    menuMap.set(row.id, { price: row.price, gst_rate_percent: row.gst_rate_percent, is_available: row.is_available });
  }

  // Validate all items exist + are available.
  for (const item of draft.items) {
    const m = menuMap.get(item.menu_item_id);
    if (m === undefined) {
      throw new Error(`createOrder: menu item ${item.menu_item_id} not found in restaurant`);
    }
    if (!m.is_available) {
      throw new Error(`createOrder: menu item ${item.menu_item_id} is currently unavailable`);
    }
  }

  // --- compute tax per line -----------------------------------------------
  // Phase 1: all dine-in = intra_state supply, regular GST scheme.
  // Tax-inclusive pricing: if restaurant.tax_inclusive_pricing, back-calculate
  // the taxable base from the inclusive price.
  const computedLines = draft.items.map((item, idx) => {
    const menu = menuMap.get(item.menu_item_id)!;
    let unitPrice = menu.price;
    const gstRatePercent = menu.gst_rate_percent;

    // If prices are tax-inclusive, extract the pre-tax base:
    // taxable = inclusive_price / (1 + gst_rate/100)
    if (restaurant.tax_inclusive_pricing) {
      unitPrice = menu.price / (1 + gstRatePercent / 100);
    }

    const computed = computeLine(
      {
        quantity:        item.quantity,
        unitPrice,
        discountPercent: 0,       // item-level discounts in Phase 2
        gstRatePercent,
        cessRatePercent: 0,       // cess not applicable on standard restaurant items
      },
      "intra_state",
      "regular",
    );

    return {
      idx,
      menu_item_id: item.menu_item_id,
      quantity:     item.quantity,
      unit_price:   menu.price,   // store the menu-facing price (inclusive or exclusive) as-is
      modifiers:    item.modifiers ?? {},
      notes:        item.notes ?? null,
      computed,
    };
  });

  const invoiceTotals = computeInvoiceTotals({
    lines: computedLines.map((l) => l.computed),
    roundOffToNearestRupee: true,
  });

  // Service charge on subtotal
  const serviceChargeAmount = Math.round(
    invoiceTotals.subtotalAmount * (restaurant.service_charge_percent / 100) * 100,
  ) / 100;

  const totalAmount =
    invoiceTotals.totalAmount + serviceChargeAmount;

  // --- reserve order number via Postgres function -------------------------
  const { data: seqData, error: seqErr } = await getSupabaseAdmin().rpc(
    "p04_next_order_number" as never,
    { p_restaurant_id: draft.restaurant_id } as never,
  ) as { data: string | null; error: { message: string } | null };

  if (seqErr !== null) throw new Error(`createOrder: order number: ${seqErr.message}`);
  const orderNumber = seqData as string;

  // --- insert order header ------------------------------------------------
  const orderRow = {
    restaurant_id:         draft.restaurant_id,
    table_id:              draft.table_id ?? null,
    order_number:          orderNumber,
    status:                "open" as const,
    order_kind:            draft.order_kind,
    customer_name:         draft.customer_name ?? null,
    customer_phone:        draft.customer_phone ?? null,
    subtotal:              invoiceTotals.subtotalAmount,
    gst_amount:            invoiceTotals.cgstAmount + invoiceTotals.sgstAmount + invoiceTotals.igstAmount,
    service_charge_amount: serviceChargeAmount,
    total_amount:          totalAmount,
    paid_amount:           0,
    notes:                 draft.notes ?? null,
  };

  const { data: orderData, error: orderErr } = await p04Table("p04_orders")
    .insert(orderRow)
    .select()
    .single();
  if (orderErr !== null) throw new Error(`createOrder: insert order: ${orderErr.message}`);

  const order = orderData as P04Order;

  // --- insert order items -------------------------------------------------
  const itemRows = computedLines.map(({ idx, menu_item_id, quantity, unit_price, modifiers, notes }) => ({
    order_id:     order.id,
    menu_item_id,
    line_number:  idx + 1,
    quantity,
    unit_price,
    modifiers,
    notes,
    status:       "pending" as const,
  }));

  const { data: itemsData, error: itemsErr } = await p04Table("p04_order_items")
    .insert(itemRows)
    .select();
  if (itemsErr !== null) {
    // Best-effort rollback — remove orphan order header.
    await p04Table("p04_orders").delete().eq("id", order.id);
    throw new Error(`createOrder: insert items: ${itemsErr.message}`);
  }

  // --- mark table as occupied ---------------------------------------------
  if (draft.table_id != null) {
    await p04Table("p04_tables")
      .update({ status: "occupied", current_order_id: order.id })
      .eq("id", draft.table_id)
      .eq("restaurant_id", draft.restaurant_id);
  }

  return {
    order,
    items: (itemsData ?? []) as P04OrderItem[],
  };
}

export async function getOrderWithItems(
  orderId: string,
  userId: string,
): Promise<P04OrderWithItems | null> {
  // Fetch the order; use a join to verify restaurant ownership in one round-trip.
  const { data: orderData, error: orderErr } = await p04Table("p04_orders")
    .select("*, p04_restaurants!inner(owner_clerk_user_id)")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr !== null) throw new Error(`getOrderWithItems: ${orderErr.message}`);
  if (orderData === null) return null;

  const raw = orderData as P04Order & { p04_restaurants: { owner_clerk_user_id: string } };
  if (raw.p04_restaurants.owner_clerk_user_id !== userId) return null;

  // Reconstruct a clean order object without the joined relation field.
  const order: P04Order = {
    id:                    raw.id,
    restaurant_id:         raw.restaurant_id,
    table_id:              raw.table_id,
    order_number:          raw.order_number,
    status:                raw.status,
    order_kind:            raw.order_kind,
    customer_name:         raw.customer_name,
    customer_phone:        raw.customer_phone,
    subtotal:              raw.subtotal,
    gst_amount:            raw.gst_amount,
    service_charge_amount: raw.service_charge_amount,
    total_amount:          raw.total_amount,
    paid_amount:           raw.paid_amount,
    notes:                 raw.notes,
    created_at:            raw.created_at,
    updated_at:            raw.updated_at,
    closed_at:             raw.closed_at,
  };

  const { data: itemsData, error: itemsErr } = await p04Table("p04_order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("line_number");
  if (itemsErr !== null) throw new Error(`getOrderWithItems items: ${itemsErr.message}`);

  return {
    order,
    items: (itemsData ?? []) as P04OrderItem[],
  };
}

export async function listOpenOrders(
  restaurantId: string,
  userId: string,
  statusFilter?: string,
): Promise<P04Order[]> {
  await requireRestaurant(restaurantId, userId);

  // Active statuses for the KDS / front-of-house dashboard.
  const activeStatuses = ["open", "sent_to_kitchen", "ready", "served"];

  let query = p04Table("p04_orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter !== undefined && statusFilter !== "") {
    query = query.eq("status", statusFilter);
  } else {
    query = query.in("status", activeStatuses);
  }

  const { data, error } = await query;
  if (error !== null) throw new Error(`listOpenOrders: ${error.message}`);
  return (data ?? []) as P04Order[];
}
