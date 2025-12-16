/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const categoryFilter = searchParams.get("category");
  const nameFilter = searchParams.get("name");

  const whereClause: any = {};

  if (categoryFilter) {
    whereClause.category = {
      name: {
        contains: categoryFilter,
        mode: "insensitive",
      },
    };
  }

  if (nameFilter) {
    whereClause.name = {
      contains: nameFilter,
      mode: "insensitive",
    };
  }

  try {
    const products = await prisma.product.findMany({
      where: whereClause,

      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return Response.json(
      {
        success: true,
        data: products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching products: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to retrive products due to a server error",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
};
