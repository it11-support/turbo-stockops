import prisma from "@/libs/prisma/index.js";
import { areaListService } from "../area/index.js";
import { pick_listsWhereInput, pick_listsOrderByWithRelationInput, pick_listsGetPayload } from "@/generated/prisma/models/pick_lists.js";
import { pick_list_detailsGetPayload } from "@/generated/prisma/models/pick_list_details.js";
import { pick_lists_status } from "@/generated/prisma/enums.js";
import dayjs from "dayjs";

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
    const start = dayjs().subtract(7, "day").startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();
    const pickList = await prisma.pick_lists.findMany({
      where: {
        status: "open",
        created_at: {
          gte: start,
          lte: end,
        }
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
  const { selectedIds, pickList: pickListId, picker, notes, area, TrnspCode } = params;

  if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
    throw new Error("No items selected for the pick list.");
  }

  // Resolve area name
  let selectedArea = "";
  if (TrnspCode) {
    const areas = await areaListService();
    selectedArea = areas.find(
      (a: { TrnspCode: number; TrnspName: string }) => a.TrnspCode === TrnspCode
    )?.TrnspName ?? "";
  } else if (area) {
    selectedArea = area;
  }

  // Ambil semua order rows untuk DocNum yang dipilih
  // (satu DocNum bisa punya banyak LineNum)
  const orders = await prisma.orders.findMany({
    where: {
      DocNum: { in: selectedIds.map(Number) },
      OR: [
        { pick_list_details: { none: {} } },
        { pick_list_details: { some: { open_qty: { gt: 0 } } } },
      ],
    },
  });

  if (!orders.length) {
    return { status: "error", message: "No orders found for the selected items.", data: [] };
  }

  // -------------------------------------------------------------------------
  // Kunci utama: cari pick_list yang sudah ada untuk DocNum-DocNum ini
  //
  // Aturan: satu DocNum = satu pick_list (selama masih open/picking)
  // Jika sudah ada pick_list open/picking yang mengandung salah satu DocNum
  // yang dipilih → gunakan pick_list itu, jangan buat baru.
  // -------------------------------------------------------------------------
  const docNums = [...new Set(orders.map((o) => o.DocNum).filter(Boolean))] as number[];

  const existingPickList = pickListId
    ? await prisma.pick_lists.findUnique({ where: { id: pickListId } })
    : await prisma.pick_lists.findFirst({
      where: {
        status: { in: ["open", "picking"] },
        pick_list_details: {
          some: {
            order: { DocNum: { in: docNums } },
          },
        },
      },
      orderBy: { id: "desc" },
    });

  let pickList: Awaited<ReturnType<typeof prisma.pick_lists.create>> | Awaited<ReturnType<typeof prisma.pick_lists.findFirst>> | null = null;

  await prisma.$transaction(async (tx) => {
    // Gunakan pick_list yang ditemukan, atau buat baru
    if (existingPickList) {
      pickList = existingPickList;
      console.log(`[storePickList] Reusing pick_list ${pickList.id} (${pickList.code})`);
    } else {
      pickList = await tx.pick_lists.create({
        data: {
          user_id: Number(picker),
          code: await generateCode(),
          notes: notes || null,
          area: selectedArea,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`[storePickList] Created new pick_list ${pickList.id} (${pickList.code})`);
    }

    // Proses tiap order row
    for (const order of orders) {
      const existingDetail = await tx.pick_list_details.findFirst({
        where: { order_id: order.id },
        include: { pick_lists: true },
        orderBy: { id: "desc" },
      });

      if (existingDetail) {
        const plStatus = existingDetail.pick_lists?.status;

        if (plStatus === "open" || plStatus === "picking") {
          // Detail sudah ada di pick_list aktif → update demand saja
          // (demand bisa berubah kalau SAP update qty)
          await tx.pick_list_details.update({
            where: { id: existingDetail.id },
            data: {
              demand: order.Quantity || 0,
              updated_at: new Date(),
            },
          });
          console.log(
            `[storePickList] Updated demand for order ${order.id} ` +
            `(DocNum ${order.DocNum} Line ${order.LineNum})`
          );
          continue;
        }

        if (plStatus === "picked") {
          // Sudah selesai di-pick → skip, jangan sentuh
          continue;
        }
      }

      // Belum ada detail → buat baru di pick_list yang aktif/baru
      await tx.pick_list_details.create({
        data: {
          pick_list_id: pickList.id,
          order_id: order.id,
          item_code: String(order.ItemCode),
          item_name: String(order.Dscription ?? order.ItemCode),
          buy_unit_msr: order.BuyUnitMsr ?? null,
          num_in_buy: Number(order.NumInBuy) || 0,
          sal_unit_msr: order.SalUnitMsr ?? null,
          num_in_sale: Number(order.NumInSale) || 0,
          demand: order.Quantity || 0,
          picked: 0,
          unit: order.unitMsr ?? null,
          rack_no: order.SuppCatNum ?? null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(
        `[storePickList] Added order ${order.id} ` +
        `(DocNum ${order.DocNum} Line ${order.LineNum}) to pick_list ${pickList.id}`
      );
    }
  });

  return { status: "ok", data: pickList };
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
  const sortFieldMap: Record<string, (dir: "asc" | "desc") => pick_listsOrderByWithRelationInput> = {
    Assignee: (dir) => ({ users: { name: dir } }),
    Status: (dir) => ({ status: dir }),
    Started: (dir) => ({ start_at: dir }),
    Completed: (dir) => ({ complete_at: dir }),
  };
  const sortDirection: "asc" | "desc" = sortDesc ? "desc" : "asc";

  const orderBy: pick_listsOrderByWithRelationInput | pick_listsOrderByWithRelationInput[] =
    sortBy && Object.hasOwn(sortFieldMap, sortBy)
      ? sortFieldMap[sortBy](sortDirection)
      : { created_at: 'desc' };

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

type PickListDetailsWithRelations = pick_listsGetPayload<{
  include: {
    users: true;
    pick_list_details: {
      include: {
        order: { include: { item: true } };
      };
    };
  };
}>;

type PickListDetailItem = pick_list_detailsGetPayload<{
  include: {
    order: { include: { item: true } };
  };
}>;

type ItemSummary = {
  item_code: string;
  item_name: string;
  demand: number;
  picked: number;
  open_qty: number;
  unit: string | null;
  rack_no: string | null;
  picker_name: string;
};

export const getPickListDetailsService = async (
  pickListId: number,
): Promise<{
  pickList: PickListDetailsWithRelations & { assignedTo: PickListDetailsWithRelations["users"] };
  summary: {
    area: unknown[];
    picker: string;
    code: string;
    due_date: Date | string | null;
    summary: ItemSummary[];
  };
}> => {
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
    pickList.pick_list_details.reduce<Record<string, ItemSummary>>((acc, detail) => {
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
  ).sort((a, b) => {
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
    return getRank(a.rack_no ?? undefined).localeCompare(getRank(b.rack_no ?? undefined));
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
  const getRack = (d: PickListDetailItem): string | null =>
    d.order?.item?.RackNo ?? d.rack_no ?? null;

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

export const updatePrintStatusService = async (id: number) => {
  try {
    await prisma.pick_lists.update({
      where: { id },
      data: { printed_at: new Date() },
    })
  } catch (error) {
    console.error('Failed to update picking status:', error)
    throw error
  }
}

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
