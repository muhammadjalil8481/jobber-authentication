import {
  getGigById,
  gigsSearch,
} from "@authentication/services/search.service";
import {
  IPaginateProps,
  ISearchResult,
} from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
// import { sortBy } from "lodash";

export async function gigs(req: Request, res: Response): Promise<void> {
  const { from, size, type } = req.query;
  let resultHits: unknown[] = [];
  const paginate: IPaginateProps = { from: from as string, size: parseInt(`${size}`), type: type as string };

  const gigs: ISearchResult = await gigsSearch({
    searchQuery: req.query.query as string || "",
    paginate,
    deliveryTime: req.query.deliveryTime as string || "",
    min: parseInt(`${req.query.minPrice}`),
    max: parseInt(`${req.query.maxPrice}`),
  });

  for (const item of gigs.hits) {
    resultHits.push(item._source);
  }
  // if (type === "backward") {
  //   resultHits = sortBy(resultHits, ["sortId"]);
  // }
  res.status(StatusCodes.OK).json({
    message: "Search gigs results",
    total: gigs.total,
    gigs: resultHits,
  });
}

export async function singleGigById(
  req: Request,
  res: Response
): Promise<void> {
  const gig = await getGigById("gigs", req.params.gigId);
  res.status(StatusCodes.OK).json({ message: "Signle gig result", data:gig });
}
