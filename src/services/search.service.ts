import {
  elasticsearch,
  elasticSearchClient,
} from "@authentication/elasticsearch";
import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import {
  IHitsTotal,
  IPaginateProps,
  IQueryList,
  ISearchResult,
} from "@muhammadjalil8481/jobber-shared";

interface GigSearchParams {
  searchQuery: string;
  paginate: IPaginateProps;
  deliveryTime?: string;
  min?: number;
  max?: number;
}

export async function getGigById(index: string, id: string) {
  const gig = await elasticsearch.getGigById(index, id);
  return gig;
}

export async function gigsSearch({
  searchQuery,
  paginate,
  deliveryTime,
  min,
  max,
}: GigSearchParams): Promise<ISearchResult> {
  const { from, size, type } = paginate;
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: [
          "username",
          "title",
          "description",
          "basicDescription",
          "basicTitle",
          "categories",
          "subCategories",
          "tags",
        ],
        query: `*${searchQuery}*`,
      },
    },
    {
      term: {
        active: true,
      },
    },
  ];

  if (deliveryTime) {
    queryList.push({
      query_string: {
        fields: ["expectedDelivery"],
        query: `*${deliveryTime}*`,
      },
    });
  }

  if (!isNaN(parseInt(`${min}`)) || !isNaN(parseInt(`${max}`))) {
    queryList.push({
      range: {
        price: {
          gte: min || 0,
          lte: max || 10000000000000,
        },
      },
    });
  }

  const result: SearchResponse = await elasticSearchClient.search({
    index: "gigs",
    query: {
      bool: {
        must: queryList,
      },
    },
    sort: [
      {
        sortId: type === "forward" ? "asc" : "desc", // Default desc
      },
    ],
    size: size || 10,
    ...(from && from !== "0" && { search_after: [from] }),
  });

  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits,
  };
}
