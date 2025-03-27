import { NextRequest, NextResponse } from "next/server";
import Batch from "@/models/batch.model";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  const batch = await Batch.aggregate([
    { $match: { name } },
    {
      $unwind: "$users",
    },
    {
      $lookup: {
        from: "users",
        localField: "users.user",
        foreignField: "_id",
        as: "users.user",
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        isArchived: { $first: "$isArchived" },
        inviteCode: { $first: "$inviteCode" },
        users: { $push: "$users" },
        notes: { $first: "$notes" },
        lectures: { $first: "$lectures" },
        notices: { $first: "$notices" },
        requests: { $first: "$requests" },
      },
    },
    {
      $lookup: {
        from: "sections",
        localField: "notes",
        foreignField: "_id",
        as: "notes",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              let: { section_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$section", "$$section_id"] },
                  },
                },
              ],
              as: "videos",
            },
          },
          {
            $lookup: {
              from: "notes",
              let: { section_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$section", "$$section_id"] },
                  },
                },
              ],
              as: "noteDocuments",
            },
          },
          {
            $addFields: {
              content: { $concatArrays: ["$videos", "$noteDocuments"] },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "sections",
        localField: "lectures",
        foreignField: "_id",
        as: "lectures",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              let: { section_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$section", "$$section_id"] },
                  },
                },
              ],
              as: "videos",
            },
          },
          {
            $lookup: {
              from: "notes",
              let: { section_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$section", "$$section_id"] },
                  },
                },
              ],
              as: "noteDocuments",
            },
          },
          {
            $addFields: {
              content: { $concatArrays: ["$videos", "$noteDocuments"] },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "notices",
        localField: "notices",
        foreignField: "_id",
        as: "notices",
      },
    },
    {
      $lookup: {
        from: "requests",
        localField: "requests",
        foreignField: "_id",
        as: "requests",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sentBy",
              foreignField: "_id",
              as: "sentBy",
            },
          },
        ],
      },
    },
  ]);

  if (!batch || batch.length === 0) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  return NextResponse.json({ data: batch[0] }, { status: 200 });
}
