import { getPublicMenuCatalogue, parseMenuFilters } from "@/lib/menu/public-catalogue";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const filters = parseMenuFilters({
      category: searchParams.getAll("category"),
      q: searchParams.getAll("q"),
      sort: searchParams.getAll("sort"),
      page: searchParams.getAll("page"),
    });
    const catalogue = await getPublicMenuCatalogue(filters);

    return NextResponse.json({
      success: true,
      data: catalogue.products,
      categories: catalogue.categories,
      count: catalogue.total,
      pageSize: catalogue.pageSize,
      filters: catalogue.filters,
    });
  } catch (error) {
    console.error("Unable to load the public menu catalogue.", error);
    return NextResponse.json(
      {
        success: false,
        message: "The menu could not be loaded. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
