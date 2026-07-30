import prisma from "@/libs/prisma/index.js";
import path from "path";
import fs from "fs";
import csv from "csv-parser";

export async function insertToOrderTable(data: any[], returnResponse = false) {
  const results: any[] = [];
  if (!Array.isArray(data) || data.length === 0) return returnResponse ? results : null;

  // -------------------------------------------------------------------------
  // STEP 1: Hapus lines yang hilang dari SAP (item berkurang/dihapus di SO)
  // Hanya hapus kalau line belum masuk pick_list manapun
  // -------------------------------------------------------------------------
  const sapByDocNum = new Map<number, Set<number>>();
  for (const item of data) {
    const docNum = Number(String(item.DocNum || "").trim());
    const lineNum = Number(item.LineNum);
    if (!sapByDocNum.has(docNum)) sapByDocNum.set(docNum, new Set());
    sapByDocNum.get(docNum)!.add(lineNum);
  }

  for (const [docNum, sapLineNums] of sapByDocNum.entries()) {
    const mysqlLines = await prisma.orders.findMany({
      where: { DocNum: docNum },
      select: { id: true, LineNum: true, pick_list_details: { select: { id: true } } },
    });

    const toDelete = mysqlLines.filter(
      (row) => !sapLineNums.has(Number(row.LineNum)) && row.pick_list_details.length === 0
    );

    if (toDelete.length > 0) {
      await prisma.orders.deleteMany({ where: { id: { in: toDelete.map((r) => r.id) } } });
      console.log(`[sync] DocNum ${docNum}: removed lines ${toDelete.map((r) => r.LineNum).join(",")}`);
    }
  }

  // -------------------------------------------------------------------------
  // STEP 2: Upsert tiap line dari SAP
  // -------------------------------------------------------------------------
  for (const item of data) {
    try {
      const docNum = Number(String(item.DocNum || "").trim());
      const lineNum = Number(item.LineNum);
      const openQty = item.OpenQty;

      const existingOrder = await prisma.orders.findUnique({
        where: { DocNum_LineNum: { DocNum: docNum, LineNum: lineNum } },
        include: { pick_list_details: { include: { pick_lists: true } } },
      });

      if (existingOrder) {
        // --- Line sudah ada ---
        const detail = existingOrder.pick_list_details[0];
        const plStatus = detail?.pick_lists?.status;

        if (plStatus === "picked") {
          // Sudah selesai di-pick: cek apakah complete
          const demand = Number(existingOrder.Quantity || 0);
          const picked = Number(detail?.picked || 0);
          const complete = demand - picked === 0;
          if (complete || openQty <= 0) continue;
        }

        // Update order row
        await prisma.orders.update({
          where: { id: existingOrder.id },
          data: buildOrderData(item, lineNum, openQty),
        });

        // Jika ada di pick_list yang masih open/picking → update demand-nya juga
        if (detail && (plStatus === "open" || plStatus === "picking")) {
          const newDemand = item.Quantity || existingOrder.Quantity || 0;
          await prisma.pick_list_details.update({
            where: { id: detail.id },
            data: { demand: newDemand, updated_at: new Date() },
          });
          console.log(`[sync] DocNum ${docNum} Line ${lineNum}: demand updated to ${newDemand}`);
        }

        if (returnResponse) results.push(existingOrder);

      } else {
        // --- Line BARU: belum pernah ada di MySQL ---
        const newOrder = await prisma.orders.create({
          data: { DocNum: docNum, ...buildOrderData(item, lineNum, openQty), created_at: new Date() },
        });

        // Cek apakah DocNum ini sudah punya pick_list open/picking
        // Jika ya → masukkan line baru ke pick_list yang sama (bukan buat baru)
        const activePL = await prisma.pick_lists.findFirst({
          where: {
            status: { in: ["open", "picking"] },
            pick_list_details: {
              some: { order: { DocNum: docNum } },
            },
          },
          orderBy: { id: "desc" },
        });

        if (activePL) {
          await prisma.pick_list_details.create({
            data: {
              pick_list_id: activePL.id,
              order_id: newOrder.id,
              item_code: String(item.ItemCode ?? ""),
              item_name: String(item.Dscription ?? item.ItemCode ?? ""),
              buy_unit_msr: item.BuyUnitMsr ?? null,
              sal_unit_msr: item.SalUnitMsr ?? null,
              num_in_sale: item.NumInSale ?? null,
              num_in_buy: item.NumInBuy ?? null,
              demand: item.OpenQty ?? item.Quantity ?? 0,
              picked: 0,
              confirmed_pick: 0,
              status: "open",
              unit: item.unitMsr ?? null,
              rack_no: item.SuppCatNum ?? null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          console.log(
            `[sync] DocNum ${docNum} Line ${lineNum}: item baru → pick_list ${activePL.id} (${activePL.code})`
          );
        }

        if (returnResponse) results.push(newOrder);
      }
    } catch (error) {
      console.error(`[sync] Error DocNum ${item.DocNum} Line ${item.LineNum}:`, error);
    }
  }

  return returnResponse ? results : null;
}

export async function insertIntoItemTable(data: any[]) {
  if (!Array.isArray(data)) return;

  for (const item of data) {
    try {
      const existingItem = await prisma.items.findUnique({
        where: { ItemCode: item.ItemCode },
      });

      if (existingItem) {
        // update existing item
        await prisma.items.update({
          where: { ItemCode: item.ItemCode },
          data: {
            ItemName: item.ItemName,
            InvntryUom: item.InvntryUom,
            CardCode: item.CardCode,
            CardName: item.CardName,
          },
        });
      } else {
        // create new item
        await prisma.items.create({
          data: {
            ItemCode: item.ItemCode,
            ItemName: item.ItemName,
            InvntryUom: item.InvntryUom,
            CardCode: item.CardCode,
            CardName: item.CardName,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export async function updateItemsTableFromCSV() {
  // Path file CSV
  const filePath = path.join(process.cwd(), "database", "files", "racking.csv");

  if (!fs.existsSync(filePath)) {
    throw new Error("CSV file not found or not readable");
  }

  console.log(`Updating items from CSV: ${filePath}`);

  return new Promise<void>((resolve, reject) => {
    const updates: Promise<any>[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const { ItemCode, ItemName, RackNo } = row;

        if (!ItemCode || !RackNo) {
          console.warn(
            `Row skipped, missing ItemCode or RackNo: ${JSON.stringify(row)}`,
          );
          return;
        }

        // Update hanya jika record ada
        updates.push(
          prisma.items
            .update({
              where: { ItemCode },
              data: { RackNo },
            })
            .catch(() => {
              console.warn(`ItemCode ${ItemCode} not found.`);
            }),
        );
      })
      .on("end", async () => {
        try {
          await Promise.all(updates);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

export async function updateBarcodeFromCSV() {
  // Path file CSV
  const filePath = path.join(process.cwd(), "database", "files", "barcodes.csv");

  if (!fs.existsSync(filePath)) {
    throw new Error("CSV file not found or not readable");
  }

  console.log(`Updating items from CSV: ${filePath}`);

  return new Promise<void>((resolve, reject) => {
    const updates: Promise<any>[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const { ItemCode, Barcode } = row;

        if (!ItemCode || !Barcode) {
          console.warn(
            `Row skipped, missing ItemCode or Barcode: ${JSON.stringify(row)}`,
          );
          return;
        }

        // Update hanya jika record ada
        updates.push(
          prisma.items
            .update({
              where: { ItemCode },
              data: { Barcode },
            })
            .catch(() => {
              console.warn(`ItemCode ${ItemCode} not found.`);
            }),
        );
      })
      .on("end", async () => {
        try {
          await Promise.all(updates);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
const buildOrderData = (item: any, lineNum: number, openQty: any) => {
  return {
    UpdateDate: item.UpdateDate ? new Date(`${item.UpdateDate}Z`) : null,
    CreateDate: item.CreateDate ? new Date(`${item.CreateDate}Z`) : null,
    DocDate: item.DocDate ? new Date(`${item.DocDate}Z`) : null,
    DocTime: String(item.DocTime ?? ""),
    DocDueDate: item.DocDueDate ? new Date(`${item.DocDueDate}Z`) : null,
    ShipDate: item.ShipDate ? new Date(`${item.ShipDate}Z`) : null,
    CardCode: item.CardCode ?? null,
    CardName: item.CardName ?? null,
    Address: item.Address ?? null,
    Phone1: item.Phone1 ?? null,
    TrnspCode: item.TrnspCode ?? null,
    TrnspName: item.TrnspName ?? null,
    Comments: item.Comments ?? null,
    SlpCode: item.SlpCode ?? null,
    SlpName: item.SlpName ?? null,
    USERID: String(item.USERID ?? ""),
    U_NAME: item.U_NAME ?? null,
    Memo: item.Memo ?? null,
    LineNum: lineNum,
    ItemCode: item.ItemCode ?? null,
    Dscription: item.Dscription ?? null,
    Quantity: item.Quantity ?? null,
    OpenQty: openQty,
    DelivrdQty: item.DelivrdQty ?? null,
    unitMsr: item.unitMsr ?? null,
    NumPerMsr: item.NumPerMsr ?? null,
    unitMsr2: item.unitMsr2 ?? null,
    NumPerMsr2: item.NumPerMsr2 ?? null,
    BuyUnitMsr: item.BuyUnitMsr ?? null,
    NumInBuy: item.NumInBuy ?? null,
    SalUnitMsr: item.SalUnitMsr ?? null,
    NumInSale: item.NumInSale ?? null,
    SuppCatNum: item.SuppCatNum ?? null,
    Price: item.Price ?? null,
    OnHand: item.OnHand ?? null,
    InvntryUom: item.InvntryUom ?? null,
    OrdrMulti: item.OrdrMulti ?? null,
    updated_at: new Date(),
  };
}