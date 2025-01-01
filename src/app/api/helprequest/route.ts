import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET
export async function GET() {
  try {
    const helpRequests = await prisma.helpRequest.findMany();
    return NextResponse.json(helpRequests, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching help requests" }, { status: 500 });
  }
}

// POST
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reporterName, phoneNumber, address, helpTypes, urgencyLevel, additionalDetails } = body;

    // ตรวจสอบข้อมูล
    if (!reporterName || !phoneNumber || !address || !helpTypes || !urgencyLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // บันทึกข้อมูลในฐานข้อมูล
    const newHelpRequest = await prisma.helpRequest.create({
      data: {
        reporterName,
        phoneNumber,
        address,
        helpTypes: JSON.stringify(helpTypes), // เก็บ JSON String
        urgencyLevel,
        additionalDetails,
      },
    });

    return NextResponse.json(newHelpRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating help request" }, { status: 500 });
  }
}

// PUT
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, reporterName, phoneNumber, address, helpTypes, urgencyLevel, additionalDetails } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    const updatedHelpRequest = await prisma.helpRequest.update({
      where: { id: Number(id) },
      data: {
        ...(reporterName && { reporterName }),
        ...(phoneNumber && { phoneNumber }),
        ...(address && { address }),
        ...(helpTypes && { helpTypes: JSON.stringify(helpTypes) }),
        ...(urgencyLevel && { urgencyLevel }),
        ...(additionalDetails && { additionalDetails }),
      },
    });

    return NextResponse.json(updatedHelpRequest, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating help request:", error.message);
      return NextResponse.json({
        error: "Error updating help request",
        details: error.message,
      }, { status: 500 });
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
    }
  }
}

// DELETE
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    await prisma.helpRequest.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Help request deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting help request" }, { status: 500 });
  }
}