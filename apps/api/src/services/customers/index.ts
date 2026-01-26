import prisma from "@/libs/prisma";

export const customerListService = async () => {
  const customers = await prisma.orders.findMany({
    select: {
      CardCode: true,
      CardName: true,
    },
    distinct: ["CardCode"],
  });

  return customers;
};
