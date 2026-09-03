import { ordersGetPayload, ordersWhereInput } from "@/generated/prisma/models/orders.js";
import prisma from "@/libs/prisma/index.js";
import {
  insertIntoItemTable,
  insertToOrderTable,
  MSSQL_API,
  updateBarcodeFromCSV,
  updateItemsTableFromCSV,
} from "@/utils/index.js";
import dayjs from "dayjs";
import { OrderListParams } from "@turbo-stockops/types";

interface ClosedOrder {
  DocNum: number | string
}

interface ClosedResponse {
  closed_orders: ClosedOrder[]
}

type OrderTime = Pick<
  ordersGetPayload<{}>,
  'DocDate' | 'DocTime'
>


export const activeOrderService = async () => {
  try {
    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const totalSalesOrder = await prisma.orders.groupBy({
      by: ["DocNum"],
      _count: {
        DocNum: true,
      },
      where: {
        pick_list_details: {
          none: {},
        },
      },
    });

    const processedOrders = await prisma.orders.groupBy({
      by: ["DocNum"],
      _count: {
        DocNum: true,
      },
      where: {
        pick_list_details: {
          some: {},
        },
      },
    });

    const totalItems = await prisma.orders.count({
      where: {
        pick_list_details: {
          none: {},
        },
      },
    });

    const pickLists = await prisma.pick_lists.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const processedItems = await prisma.orders.count({
      where: {
        pick_list_details: {
          some: {},
        },
      },
    });

    return {
      totalOrders: totalSalesOrder.length,
      processedOrders: processedOrders.length,
      totalItems,
      totalPickLists: pickLists,
      processedItems: processedItems,
    };
  } catch (error) {
    console.log(error);
  }
};

export const orderIdListService = async () => {
  try {
    const data = await prisma.orders.findMany({
      select: {
        DocNum: true,
      },
      distinct: ["DocNum"],
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const orderListService = async (params: OrderListParams) => {
  const {
    master = false,
    search = "",
    perPage = 50, // default
    page = 1,
    due_date = "",
    sortBy,
    sortDesc = false,
    Customer = "",
    DocNum = "",
    TrnspCode,
  } = params;

  let closed: ClosedResponse | null = null

  // =========================
  // 1️⃣ Sync master data jika perlu
  // =========================
  if (master) {
    const [ordersRes, itemsRes] = await Promise.all([
      fetch(`${MSSQL_API}/orders`),
      fetch(`${MSSQL_API}/items`),
    ]);

    if (!ordersRes.ok || !itemsRes.ok) {
      throw new Error("Failed to fetch master data");
    }

    const ordersData = await ordersRes.json();
    const itemsData = await itemsRes.json();

    await insertToOrderTable(ordersData.orders);
    await insertIntoItemTable(itemsData.items);
    await updateItemsTableFromCSV();

    const allOrders = await prisma.orders.findMany({
      where: { pick_list_details: { none: {} } },
      select: { DocNum: true },
    });

    const docNums = allOrders.map((o) => o.DocNum);

    const closedRes = await fetch(`${MSSQL_API}/orders/closed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: docNums }),
    });

    closed = await closedRes.json();

    const closedDocNumsInt = (
      closed?.closed_orders?.map((o) => Number(o.DocNum)) || []
    ).filter((n: number) => !isNaN(n));

    if (closedDocNumsInt.length) {
      await prisma.orders.deleteMany({
        where: { DocNum: { in: closedDocNumsInt } },
      });
    }
  }

  // =========================
  // 2️⃣ Mapping sort field
  // =========================
  const sortFieldMap: Record<string, string> = {
    "Due Date": "DocDueDate",
    Customer: "CardName",
    Area: "TrnspName",
    "Item Code": "ItemCode",
  };
  const sortColumn =
    sortBy && Object.hasOwn(sortFieldMap, sortBy)
      ? sortFieldMap[sortBy]
      : "DocNum";
  const sortDir: "asc" | "desc" = sortDesc ? "desc" : "asc";

  // =========================
  // 3️⃣ Build where condition
  // =========================
  const where: ordersWhereInput = {
    ...(search && {
      OR: [
        { CardName: { contains: search } },
        { ItemCode: { contains: search } },
        { DocNum: { equals: Number(search) } },
      ],
    }),
    ...(due_date && { DocDueDate: new Date(due_date) }),
    ...(TrnspCode && {
      TrnspCode: { in: TrnspCode.split(",").map((v) => Number(v.trim())) },
    }),
    ...(Customer && { CardCode: { in: Customer.split(",") } }),
    ...(DocNum && {
      DocNum: {
        in: DocNum.split(",")
          .map(Number)
          .filter((n) => !isNaN(n)),
      },
    }),
    AND: [
      {
        OR: [
          { pick_list_details: { none: {} } },
          {
            pick_list_details: {
              some: { open_qty: { gt: 0 }, pick_lists: { status: "picked" } },
            },
          },
        ],
      },
      {
        pick_list_details: { none: { pick_lists: { status: "open" } } },
      },
    ],
  };

  // =========================
  // 4️⃣ Raw orders
  // =========================
  const rawOrders = await prisma.orders.findMany({
    where,
    orderBy: sortBy ? { [sortColumn]: sortDir } : { DocNum: "desc" },
  });

  // =========================
  // 5️⃣ Distinct DocNum + pagination
  // =========================
  const distinctIds = await prisma.orders.groupBy({
    by: ["DocNum"],
    where,
    _min: { id: true },
    orderBy: sortBy ? { [sortColumn]: sortDir } : { DocNum: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  const ids = distinctIds.map((d) => d._min.id!).filter(Boolean);

  const ordersData = ids.length
    ? await prisma.orders.findMany({
      where: { id: { in: ids } },
      orderBy: { DocNum: "desc" },
    })
    : [];

  const totalDistinctDocNum = await prisma.orders.groupBy({
    by: ["DocNum"],
    where,
  });

  const paginatedOrders = {
    current_page: page,
    per_page: perPage,
    last_page: Math.ceil(totalDistinctDocNum.length / perPage),
    total: totalDistinctDocNum.length,
    data: ordersData,
  };

  // =========================
  // 6️⃣ All DocNum untuk checkbox
  // =========================
  const allIds = await prisma.orders.groupBy({ by: ["DocNum"], where });

  // =========================
  // 7️⃣ Total items
  // =========================
  const totalItemsFromSalesOrders = await prisma.orders.count({ where });

  return {
    rawOrders,
    orders: paginatedOrders,
    totalItems: totalItemsFromSalesOrders,
    totalSo: totalDistinctDocNum.length,
    salesOrderIds: allIds.map((x) => x.DocNum),
    closed: closed?.closed_orders ?? [],
  };
};

export const getOrderDetailsService = async (pickListId: number) => {
  const pickList = await prisma.pick_lists.findUnique({
    where: { id: pickListId },
    include: {
      pick_list_details: {
        include: {
          order: true,
        },
      },
    },
  });

  if (!pickList) throw new Error("PickList not found");

  // ✅ Group by DocNum (Sales Order)
  const grouped = pickList.pick_list_details.reduce(
    (acc: Record<number, typeof pickList.pick_list_details>, detail) => {
      const docNum = detail.order?.DocNum;
      if (!docNum) return acc;

      if (!acc[docNum]) acc[docNum] = [];
      acc[docNum].push(detail);
      return acc;
    },
    {},
  );

  const data = Object.entries(grouped).map(([docNum, details]) => {
    const order = details[0].order;

    return {
      sales_order_id: Number(docNum), // ✅ sekarang unik
      sales_order_date: formatDocTime(order),
      delivery_date: order?.DocDueDate ?? null,
      customer_id: order?.CardCode ?? null,
      customer_name: order?.CardName ?? null,
      address: order?.Address ?? null,
      sales_person: order?.SlpName ?? null,
      phone: order?.Phone1 ?? null,
      remarks: order?.Comments ?? null,
      area: order?.TrnspName ?? null,
      telemarketing: order?.U_NAME ?? null,
      details,
      total_sku: details.length,
    };
  });

  return data;
};

export const exportOrdersService = async (date: string) => {
  try {

    const orders = await prisma.orders.findMany({
      where: {
        CreateDate: new Date(date)
      },
      distinct: ["DocNum"],
    });
    return orders.map((order) => ({
      ...order,
      DocTime: formatDocTime(order),
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const formatDocTime = (
  order: OrderTime,
): string | null => {
  if (order.DocDate && order.DocTime != null) {
    const docTime = order.DocTime.padStart(4, '0')
    const hour = docTime.substring(0, 2)
    const minute = docTime.substring(2, 4)

    return `${String(order.DocDate).slice(0, 10)} ${hour}:${minute}`
  }

  if (order.DocDate) {
    return `${String(order.DocDate).slice(0, 10)} 08:00`
  }

  return null
}

export const syncOrderService = async () => {
  let closed: ClosedResponse | null = null;

  const [ordersRes, itemsRes] = await Promise.all([
    fetch(`${MSSQL_API}/orders`),
    fetch(`${MSSQL_API}/items`),
  ]);

  if (!ordersRes.ok || !itemsRes.ok) {
    throw new Error("Failed to fetch master data");
  }

  const ordersData = await ordersRes.json();
  const itemsData = await itemsRes.json();

  await insertToOrderTable(ordersData.orders);
  await insertIntoItemTable(itemsData.items);
  await updateItemsTableFromCSV();
  await updateBarcodeFromCSV();

  const allOrders = await prisma.orders.findMany({
    where: { pick_list_details: { none: {} } },
    select: { DocNum: true },
  });

  const docNums = allOrders.map((o) => o.DocNum);

  const closedRes = await fetch(`${MSSQL_API}/orders/closed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orders: docNums }),
  });

  closed = await closedRes.json();

  const closedDocNumsInt = (
    closed?.closed_orders?.map((o) => Number(o.DocNum)) || []
  ).filter((n: number) => !isNaN(n));

  if (closedDocNumsInt.length) {
    await prisma.orders.deleteMany({
      where: { DocNum: { in: closedDocNumsInt } },
    });
  }
}