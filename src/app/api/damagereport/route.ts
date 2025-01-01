import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET
export async function GET() {
  try {
    const reports = await prisma.damageReport.findMany();
    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      reporterName,
      phoneNumber,
      address,
      additionalDetails,
      assessmentDate,
      damageList,
      propertyDamage,
      lifeImpact,
      additionalNotes,
    } = body;

    // ตรวจสอบข้อมูล
    if (!reporterName || !phoneNumber || !address || !assessmentDate || !damageList || !propertyDamage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // บันทึกข้อมูลในฐานข้อมูล
    const newReport = await prisma.damageReport.create({
      data: {
        reporterName,
        phoneNumber,
        address,
        additionalDetails,
        assessmentDate: new Date(assessmentDate), // แปลงวันที่เป็น DateTime
        damageList: JSON.stringify(damageList), // เก็บเป็น JSON String
        propertyDamage,
        lifeImpact,
        additionalNotes,
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error creating damage report:", error);
    return NextResponse.json({ error: "Failed to create damage report" }, { status: 500 });
  }
}

// PUT
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      reporterName,
      phoneNumber,
      address,
      additionalDetails,
      assessmentDate,
      damageList,
      propertyDamage,
      lifeImpact,
      additionalNotes,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    const updatedReport = await prisma.damageReport.update({
      where: { id: Number(id) },
      data: {
        ...(reporterName && { reporterName }),
        ...(phoneNumber && { phoneNumber }),
        ...(address && { address }),
        ...(additionalDetails && { additionalDetails }),
        ...(assessmentDate && { assessmentDate: new Date(assessmentDate) }),
        ...(damageList && { damageList: JSON.stringify(damageList) }),
        ...(propertyDamage && { propertyDamage: parseFloat(propertyDamage) }),
        ...(lifeImpact && { lifeImpact }),
        ...(additionalNotes && { additionalNotes }),
      },
    });

    return NextResponse.json(updatedReport, { status: 200 });
  } catch (error) {
    console.error("Error updating damage report:", error);
    return NextResponse.json({
      error: "Failed to update damage report",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
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

    await prisma.damageReport.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Damage report deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting damage report:", error);
    return NextResponse.json({ error: "Failed to delete damage report" }, { status: 500 });
  }
}
