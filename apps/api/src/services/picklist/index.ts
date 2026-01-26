import prisma from "@/libs/prisma";
import { areaListService } from "../area";
import { pick_listsWhereInput } from "@/generated/prisma/models";
import { pick_lists_status } from "@/generated/prisma/enums";

type PickListParams = {
  Customer: string;
  area?: string;
  notes?: string;
  picker?: number;
  pickList?: number;
  selectedIds: number[];
  TrnspCode?: number;
};

interface PickListQueryParams {
  perPage?: number;
  page?: number;
  Status?: string;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  date?: string;
  userId: number;
  isAdmin: boolean;
}

interface PickListDetailServiceParams {
  pickListId: number;
  user: {
    id: number;
    isAdmin: boolean;
  };
  perPage: number;
  page: number;
  paging: boolean;
}

export const getPickListService = async () => {
  try {
    const pickList = await prisma.pick_lists.findMany({
      where: {
        status: "open",
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return pickList;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const storePickListService = async (params: PickListParams) => {
  try {
    const {
      selectedIds,
      pickList: pickListId,
      picker,
      notes,
      area,
      TrnspCode,
    } = params;

    if (
      !selectedIds ||
      !Array.isArray(selectedIds) ||
      selectedIds.length === 0
    ) {
      throw new Error("No items selected for the pick list.");
    }

    let selectedArea = "";
    if (TrnspCode) {
      const areas = await areaListService();
      selectedArea = areas.find(
        (area: { TrnspCode: number; TrnspName: string }) =>
          area.TrnspCode === TrnspCode,
      ).TrnspName;
    } else if (area) {
      selectedArea = area;
    }

    const orders = await prisma.orders.findMany({
      where: {
        DocNum: { in: selectedIds.map(Number) },
        OR: [
          { pick_list_details: { none: {} } },
          {
            pick_list_details: {
              some: { open_qty: { gt: 0 } },
            },
          },
        ],
      },
    });

    if (!orders.length) {
      return {
        status: "error",
        message: "No orders found for the selected items.",
        data: [],
      };
    }

    let pickList: any = null;

    await prisma.$transaction(async (tx) => {
      // Ambil atau buat pick list
      if (pickListId) {
        pickList = await tx.pick_lists.findUnique({
          where: { id: pickListId },
        });
      }

      if (!pickList) {
        pickList = await tx.pick_lists.create({
          data: {
            user_id: Number(picker) ?? null,
            code: await generateCode(),
            notes: notes || null,
            area: selectedArea,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      // Loop orders
      for (const order of orders) {
        const existingDetail = await tx.pick_list_details.findFirst({
          where: { order_id: order.id },
          include: { pick_lists: true },
          orderBy: { id: "desc" },
        });

        if (existingDetail?.pick_lists?.status === "open") {
          await tx.pick_list_details.update({
            where: { id: existingDetail.id },
            data: { demand: order.Quantity || 0 },
          });
          continue;
        }

        await tx.pick_list_details.create({
          data: {
            pick_list_id: pickList.id,
            order_id: order.id,
            item_code: String(order.ItemCode),
            item_name: String(order.Dscription),
            buy_unit_msr: order.BuyUnitMsr,
            num_in_buy: Number(order.NumInBuy) || 0,
            sal_unit_msr: order.SalUnitMsr,
            num_in_sale: Number(order.NumInSale) || 0,
            demand: order.Quantity || 0,
            picked: existingDetail?.picked || 0,
            unit: order.unitMsr || order.unitMsr || null,
            rack_no: order.SuppCatNum || null,
          },
        });
      }
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPickListsService = async (params: PickListQueryParams) => {
  const {
    perPage = 20,
    page = 1,
    search,
    Status,
    sortBy,
    sortDesc = false,
    date,
    userId,
  } = params;

  // =========================
  // Build filter
  // =========================
  const where: pick_listsWhereInput = {};

  if (Status) {
    const statuses = Status.split(",")
      .map((s) => s.trim().toLowerCase())
      .map((s) => (s === "closed" ? "picked" : s)) // closed → picked, open → open
      .filter((s) => s === "open" || s === "picked") as pick_lists_status[];

    if (statuses.length) {
      where.status = { in: statuses };
    }
  }

  if (search) {
    where.OR = [
      { code: { contains: search } },
      { notes: { contains: search } },
      { area: { contains: search } },
    ];
  }

  if (date) {
    const dt = new Date(date);
    const nextDay = new Date(dt);
    nextDay.setDate(dt.getDate() + 1);

    where.created_at = {
      gte: dt,
      lt: nextDay,
    };
  }

  if (userId) {
    where.user_id = userId;
  }

  // =========================
  // Sorting
  // =========================
  const sortFieldMap: Record<string, (dir: "asc" | "desc") => any> = {
    Assignee: (dir) => ({ users: { name: dir } }),
    Status: (dir) => ({ status: dir }),
    Started: (dir) => ({ start_at: dir }),
    Completed: (dir) => ({ complete_at: dir }),
  };
  const sortDirection: "asc" | "desc" = sortDesc ? "desc" : "asc";

  const orderBy =
    sortBy && sortFieldMap[sortBy]
      ? sortFieldMap[sortBy](sortDirection)
      : { created_at: "desc" };

  // =========================
  // Pagination
  // =========================
  const total = await prisma.pick_lists.count({ where });
  const last_page = Math.ceil(total / perPage);

  const pickLists = await prisma.pick_lists.findMany({
    where,
    include: {
      users: true, // relasi ke user
      pick_list_details: true, // relasi ke pick list detail
    },
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage,
  });

  // =========================
  // Build paginated response
  // =========================
  return {
    current_page: page,
    data: pickLists.map((pl) => ({
      ...pl,
      assigned_to: pl.users,
    })),
    per_page: perPage,
    total,
    last_page,
  };
};

export const getPickListDetailsService = async (
  pickListId: number,
): Promise<{ pickList: any; summary: any }> => {
  const pickList = await prisma.pick_lists.findUnique({
    where: { id: pickListId },
    include: {
      users: true, // relasi assignedTo
      pick_list_details: {
        include: {
          order: { include: { item: true } },
        },
      },
    },
  });

  if (!pickList) throw new Error("PickList not found");

  // Ambil area unik
  const areas = Array.from(
    new Set(
      pickList.pick_list_details.map((d) => d.order.TrnspName).filter(Boolean),
    ),
  );

  // Buat summary per item_code
  const itemSummary = Object.values(
    pickList.pick_list_details.reduce((acc: any, detail: any) => {
      const code = detail.item_code;
      if (!acc[code]) {
        acc[code] = {
          item_code: code,
          item_name: detail.item_name,
          demand: 0,
          picked: 0,
          open_qty: 0,
          unit: detail.unit,
          rack_no: detail.order?.item?.RackNo ?? detail.rack_no,
          picker_name: pickList.users?.name ?? "",
        };
      }
      acc[code].demand += Number(detail.demand ?? 0);
      acc[code].picked += Number(detail.picked ?? 0);
      acc[code].open_qty += Number(detail.open_qty ?? 0);
      return acc;
    }, {}),
  ).sort((a: any, b: any) => {
    const getRank = (rack?: string) => {
      const r = (rack ?? "").trim();
      if (/^R[0-9]/i.test(r)) return "1" + r;
      if (/^F[0-9]/i.test(r)) return "2" + r;
      if (/^S[0-9]/i.test(r)) return "3" + r;
      if (r === "FLOOR") return "4" + r;
      if (r !== "") return "5" + r;
      if (rack == null) return "6";
      return "7" + r;
    };
    return getRank(a.rack_no).localeCompare(getRank(b.rack_no));
  });

  // summary terpisah
  const summary = {
    area: areas,
    picker: pickList.users?.name ?? "",
    code: pickList.code,
    due_date: pickList.pick_list_details[0]?.order?.DocDueDate ?? null,
    summary: itemSummary,
  };

  return {
    pickList: {
      ...pickList,
      assignedTo: pickList.users,
    },
    summary,
  };
};

export const getPickListDetailService = async ({
  pickListId,
  user,
  perPage,
  page,
  paging,
}: PickListDetailServiceParams) => {
  const data = await prisma.pick_list_details.findMany({
    where: {
      pick_list_id: pickListId,
      ...(user.isAdmin
        ? {}
        : {
            pickList: {
              user_id: user.id,
            },
          }),
    },
    include: {
      pick_lists: true,
      order: {
        include: {
          item: true,
        },
      },
    },
  });

  // 🔁 Pengganti: COALESCE(items.RackNo, pick_list_details.rack_no)
  const getRack = (d: any) => d.order?.item?.RackNo ?? d.rack_no ?? null;

  // 🔁 Pengganti ORDER BY CASE REGEXP
  const getRank = (rack?: string | null) => {
    if (!rack) return 7;
    const r = rack.trim();

    if (/^R[0-9]-/.test(r)) return 1;
    if (/^F[0-9]-/.test(r)) return 2;
    if (/^S[0-9]-/.test(r)) return 3;
    if (r === "FLOOR") return 4;
    if (r === "") return 6;
    return 5;
  };

  const sorted = data.sort((a, b) => {
    const rackA = getRack(a);
    const rackB = getRack(b);

    const rankDiff = getRank(rackA) - getRank(rackB);
    if (rankDiff !== 0) return rankDiff;

    return (rackA ?? "").localeCompare(rackB ?? "");
  });

  // 📄 Paging (pengganti paginate Laravel)
  const result = paging
    ? sorted.slice((page - 1) * perPage, page * perPage)
    : sorted;

  return {
    data: {
      data: result,
      total: sorted.length,
      page: paging ? page : null,
      perPage: paging ? perPage : null,
    },
  };
};

export const splitPickListService = async (
  pickListId: number,
  selectedDocNums: number[],
) => {
  return prisma.$transaction(async (tx) => {
    // Ambil pick list lama
    const oldPickList = await tx.pick_lists.findUnique({
      where: { id: pickListId },
    });

    if (!oldPickList) throw new Error("PickList not found");

    // Buat pick list baru (replicate)
    const newPickList = await tx.pick_lists.create({
      data: {
        ...oldPickList,
        id: undefined, // jangan copy id
        code: await generateCode(),
        notes: `Split from Pick List [${oldPickList.code}]`,
        printed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Cari order lama yang TIDAK ikut split → untuk area lama
    const oldOrder = await tx.orders.findFirst({
      where: {
        pick_list_details: {
          some: { pick_list_id: oldPickList.id },
        },
        DocNum: { notIn: selectedDocNums },
      },
    });

    const oldArea = oldOrder?.TrnspName ?? null;

    // Loop DocNum yang dipilih untuk dipindah
    for (const docNum of selectedDocNums) {
      const orders = await tx.orders.findMany({
        where: { DocNum: docNum },
      });

      if (!orders.length) continue;

      const orderIds = orders.map((o) => o.id);

      // Update pick_list_details → pindah ke pick list baru
      await tx.pick_list_details.updateMany({
        where: {
          order_id: { in: orderIds },
          pick_list_id: oldPickList.id,
        },
        data: {
          pick_list_id: newPickList.id,
        },
      });

      // Update area pick list baru
      const area = orders[0].TrnspName;
      await tx.pick_lists.update({
        where: { id: newPickList.id },
        data: { area },
      });
    }

    // Update area pick list lama
    await tx.pick_lists.update({
      where: { id: oldPickList.id },
      data: { area: oldArea },
    });

    return newPickList;
  });
};

const generateCode = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const date = now.getDate();
  const today = `${year}${month}${date}`;

  const lastCode = await prisma.pick_lists.findFirst({
    where: {
      code: {
        startsWith: `PL-${today}`,
      },
    },
    orderBy: {
      code: "desc",
    },
    select: {
      code: true,
    },
  });

  let lastNumber = 0;
  let nextNumber = 0;

  if (lastCode?.code) {
    lastNumber = parseInt(lastCode.code.slice(-4), 10);
    nextNumber = lastNumber + 1;
  } else {
    nextNumber = 1;
  }

  const numStr = String(nextNumber).padStart(4, "0");

  return `PL-${today}-${numStr}`;
};
