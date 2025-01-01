import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), "public/uploads");

fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// GET 
export async function GET() {
  try {
    const reports = await prisma.floodReport.findMany();
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST 
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const reporterName = formData.get("reporterName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const address = formData.get("address") as string;
    const floodStatus = formData.get("floodStatus") as string;
    const image = formData.get("image") as File | null;

    if (!reporterName || !phoneNumber || !address || !floodStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let imagePath = null;

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      imagePath = `/uploads/${fileName}`;
      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, fileName), buffer);
    }

    const newReport = await prisma.floodReport.create({
      data: {
        reporterName,
        phoneNumber,
        address,
        floodStatus,
        imagePath,
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

// UPDATE 
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();

    const id = formData.get("id") as string;
    const reporterName = formData.get("reporterName") as string | null;
    const phoneNumber = formData.get("phoneNumber") as string | null;
    const address = formData.get("address") as string | null;
    const floodStatus = formData.get("floodStatus") as string | null;
    const image = formData.get("image") as File | null;

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    let imagePath = null;

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      imagePath = `/uploads/${fileName}`;
      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, fileName), buffer);
    }

    const updatedReport = await prisma.floodReport.update({
      where: { id: Number(id) },
      data: {
        reporterName: reporterName ?? undefined,
        phoneNumber: phoneNumber ?? undefined,
        address: address ?? undefined,
        floodStatus: floodStatus ?? undefined,
        ...(imagePath && { imagePath }),
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}


// DELETE 
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    const report = await prisma.floodReport.findUnique({ where: { id: Number(id) } });

    if (report?.imagePath) {
      const filePath = path.join(process.cwd(), "public", report.imagePath);
      await fs.unlink(filePath).catch(console.error);
    }

    await prisma.floodReport.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
