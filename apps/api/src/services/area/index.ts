import { MSSQL_API } from "@/utils/index.js";

export const areaListService = async () => {
  const apiUrl = `${MSSQL_API}/areas`;
  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch areas: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.areas;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
