import prisma from "@/libs/prisma/index.js";
import path from "path";
import fs from "fs";
import csv from "csv-parser";

export async function insertToOrderTable(data: any[], returnResponse = false) {
  const results: any[] = [];

  if (!Array.isArray(data)) return returnResponse ? results : null;

  for (const item of data) {
    try {
      const docNum = Number(String(item.DocNum || "").trim());
      const lineNum = Number(item.LineNum);
      let openQty = item.OpenQty;

      // Cari order yang sudah ada
      const existingOrder = await prisma.orders.findUnique({
        where: {
          DocNum_LineNum: { DocNum: docNum, LineNum: lineNum },
        },
        include: {
          pick_list_details: true,
        },
      });

      if (existingOrder) {
        // cek apakah ada pick_list yang statusnya 'picked'
        const pickLists = await prisma.pick_lists.findMany({
          where: {
            pick_list_details: {
              some: { order_id: existingOrder.id },
            },
            status: "picked",
          },
          include: {
            pick_list_details: {
              where: { order_id: existingOrder.id },
            },
          },
        });

        const hasClosedPickList = pickLists.length > 0;

        const demand = Number(existingOrder.Quantity || 0);
        let complete = false;

        let pickDetail = pickLists[0]?.pick_list_details[0];
        if (pickDetail) {
          complete = demand - Number(pickDetail.picked || 0) === 0;
          openQty = pickDetail.open_qty || openQty;
        }

        if (complete || (hasClosedPickList && openQty <= 0)) {
          continue; // skip update
        }

        // update order
        const updatedOrder = await prisma.orders.update({
          where: { id: existingOrder.id },
          data: {
            CreateDate: item.CreateDate ? new Date(`${item.CreateDate}Z`) : null,
            DocDate: item.DocDate ? new Date(`${item.DocDate}Z`) : null,
            DocTime: String(item.DocTime),
            DocDueDate: item.DocDueDate ? new Date(`${item.DocDueDate}Z`) : null,
            UpdateDate: item.UpdateDate ? new Date(`${item.UpdateDate}Z`) : null,
            CardCode: item.CardCode,
            CardName: item.CardName,
            Address: item.Address,
            Phone1: item.Phone1,
            TrnspCode: item.TrnspCode,
            TrnspName: item.TrnspName,
            Comments: item.Comments,
            SlpCode: item.SlpCode,
            SlpName: item.SlpName,
            USERID: String(item.USERID),
            U_NAME: item.U_NAME,
            Memo: item.Memo,
            LineNum: lineNum,
            ItemCode: item.ItemCode,
            Dscription: item.Dscription,
            ShipDate: item.ShipDate ? new Date(`${item.ShipDate}Z`) : null,
            Quantity: item.Quantity,
            OpenQty: openQty,
            DelivrdQty: item.DelivrdQty,
            unitMsr: item.unitMsr,
            NumPerMsr: item.NumPerMsr,
            unitMsr2: item.unitMsr2,
            NumPerMsr2: item.NumPerMsr2,
            BuyUnitMsr: item.BuyUnitMsr,
            NumInBuy: item.NumInBuy,
            SalUnitMsr: item.SalUnitMsr,
            NumInSale: item.NumInSale,
            SuppCatNum: item.SuppCatNum,
            Price: item.Price,
            OnHand: item.OnHand,
            InvntryUom: item.InvntryUom,
            OrdrMulti: item.OrdrMulti,
            updated_at: new Date(),
          },
        });

        if (returnResponse) results.push(updatedOrder);
      } else {
        // create new order
        const newOrder = await prisma.orders.create({
          data: {
            DocNum: Number(docNum),
            CreateDate: item.CreateDate ? new Date(`${item.CreateDate}Z`) : null,
            DocDate: item.DocDate ? new Date(`${item.DocDate}Z`) : null,
            DocTime: String(item.DocTime),
            DocDueDate: item.DocDueDate ? new Date(`${item.DocDueDate}Z`) : null,
            UpdateDate: item.UpdateDate ? new Date(`${item.UpdateDate}Z`) : null,
            CardCode: item.CardCode,
            CardName: item.CardName,
            Address: item.Address,
            Phone1: item.Phone1,
            TrnspCode: item.TrnspCode,
            TrnspName: item.TrnspName,
            Comments: item.Comments,
            SlpCode: item.SlpCode,
            SlpName: item.SlpName,
            USERID: String(item.USERID),
            U_NAME: item.U_NAME,
            Memo: item.Memo,
            LineNum: lineNum,
            ItemCode: item.ItemCode,
            Dscription: item.Dscription,
            ShipDate: item.ShipDate ? new Date(`${item.ShipDate}Z`) : null,
            Quantity: item.Quantity,
            OpenQty: item.OpenQty,
            DelivrdQty: item.DelivrdQty,
            unitMsr: item.unitMsr,
            NumPerMsr: item.NumPerMsr,
            unitMsr2: item.unitMsr2,
            NumPerMsr2: item.NumPerMsr2,
            BuyUnitMsr: item.BuyUnitMsr,
            NumInBuy: item.NumInBuy,
            SalUnitMsr: item.SalUnitMsr,
            NumInSale: item.NumInSale,
            SuppCatNum: item.SuppCatNum,
            Price: item.Price,
            OnHand: item.OnHand,
            InvntryUom: item.InvntryUom,
            OrdrMulti: item.OrdrMulti,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        if (returnResponse) results.push(newOrder);
      }
    } catch (error) {
      console.error(error);
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
