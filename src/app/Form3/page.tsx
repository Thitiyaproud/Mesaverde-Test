"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from 'react-hot-toast';

const validationSchema = z.object({
  reporterName: z.string().min(1, "กรุณากรอกชื่อ").max(100, "ไม่เกิน 100 ตัวอักษร"),
  phoneNumber: z.string().regex(/^\d{10}$/, "เบอร์โทรต้องมี 10 หลัก"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  additionalDetails: z.string().optional(),
  assessmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "กรุณาเลือกวันที่ประเมิน",
  }),
  damageList: z.string().min(1, "กรุณาระบุรายการความเสียหาย"),
  propertyDamage: z
    .number({
      invalid_type_error: "กรุณากรอกจำนวนเงินที่ถูกต้อง",
    })
    .min(0, "จำนวนเงินต้องไม่ต่ำกว่า 0")
    .max(1000000, "จำนวนเงินต้องไม่เกิน 1,000,000 บาท"),
  lifeImpact: z.string().optional(),
  additionalNotes: z.string().optional(),
});

interface FormData {
  reporterName: string;
  phoneNumber: string;
  address: string;
  additionalDetails?: string;
  assessmentDate: string;
  damageList: string;
  propertyDamage: number;
  lifeImpact?: string;
  additionalNotes?: string;
}

export default function Form3() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
  });

  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  // โหลดข้อมูลที่บันทึกจาก localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("form3Data");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        setValue(key as keyof FormData, parsedData[key]);
      });
    }
  }, [setValue]);

  // ดูค่าฟอร์มและบันทึกลงใน localStorage
  useEffect(() => {
    const subscription = watch((data) => {
      localStorage.setItem("form3Data", JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: FormData) => {
    setFormData(data);
    setIsSummaryVisible(true);
  };

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch("/api/damagereport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        toast.success("ส่งข้อมูลสำเร็จ!");
        localStorage.removeItem("form3Data");
        setIsSummaryVisible(false);
      } else {
        toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };
  

  if (isSummaryVisible && formData) {
    return (
      <div className="min-h-screen flex flex-col items-center">
        <h1 className="text-xl font-semibold mt-8 mb-4">สรุปข้อมูลก่อนส่ง</h1>
        <div className="mb-8 min-w-[400px] max-w-md mx-auto p-6 border rounded-lg shadow-md bg-white border-blue-500">
          <p><strong>ชื่อผู้รายงาน:</strong> {formData.reporterName}</p>
          <p><strong>เบอร์โทร:</strong> {formData.phoneNumber}</p>
          <p><strong>ที่อยู่:</strong> {formData.address}</p>
          <p><strong>วันที่ประเมิน:</strong> {formData.assessmentDate}</p>
          <p><strong>รายการความเสียหาย:</strong> {formData.damageList}</p>
          <p><strong>ความเสียหายทางทรัพย์สิน:</strong> {formData.propertyDamage.toLocaleString()} บาท</p>
          <p><strong>ความเสียหายทางชีวิต:</strong> {formData.lifeImpact || "ไม่มี"}</p>
          <p><strong>หมายเหตุ:</strong> {formData.additionalNotes || "ไม่มี"}</p>
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
              onClick={() => setIsSummaryVisible(false)}
            >
              แก้ไขข้อมูล
            </button>
            <button
              type="button"
              className="py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={handleFinalSubmit}
            >
              ยืนยันส่งข้อมูล
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <h1 className="text-xl font-semibold mt-8 mb-8">รายงานประเมินความเสียหายจากน้ำท่วม</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-8 min-w-[400px] max-w-md mx-auto p-6 border rounded-lg shadow-md bg-white border-blue-500"
      >
        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">ชื่อผู้รายงาน:</label>
          <input
            {...register("reporterName")}
            placeholder="ชื่อผู้รายงาน"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.reporterName && (
            <p className="text-red-500 text-sm mt-1">{errors.reporterName.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">เบอร์โทร:</label>
          <input
            {...register("phoneNumber")}
            placeholder="เบอร์โทร"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">ที่อยู่:</label>
          <textarea
            {...register("address")}
            placeholder="ที่อยู่"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="assessmentDate" className="block text-blue-700 font-semibold mb-1">
            วันที่ประเมิน
          </label>
          <input
            type="date"
            id="assessmentDate"
            {...register("assessmentDate")}
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.assessmentDate && <p className="text-red-500 text-sm mt-1">{errors.assessmentDate.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="damageList" className="block text-blue-700 font-semibold mb-1">
            รายการความเสียหาย
          </label>
          <textarea
            id="damageList"
            {...register("damageList")}
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="โปรดระบุทรัพย์สินหรือสิ่งของที่ได้รับความเสียหาย"
          />
          {errors.damageList && <p className="text-red-500 text-sm mt-1">{errors.damageList.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="propertyDamage" className="block text-blue-700 font-semibold mb-1">
            ความเสียหายทางทรัพย์สิน (บาท)
          </label>
          <input
            type="number"
            id="propertyDamage"
            {...register("propertyDamage", { valueAsNumber: true })}
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรุณากรอกจำนวนเงิน"
          />
          {errors.propertyDamage && (
            <p className="text-red-500 text-sm mt-1">
              {errors.propertyDamage.message || "กรุณาตรวจสอบข้อมูลอีกครั้ง"}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="lifeImpact" className="block text-blue-700 font-semibold mb-1">
            ความเสียหายทางชีวิต (ถ้ามี)
          </label>
          <textarea
            id="lifeImpact"
            {...register("lifeImpact")}
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="โปรดระบุ เช่น การบาดเจ็บหรือสูญเสีย"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="additionalNotes" className="block text-blue-700 font-semibold mb-1">
            หมายเหตุ
          </label>
          <textarea
            id="additionalNotes"
            {...register("additionalNotes")}
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="โปรดระบุข้อมูลเพิ่มเติม (ถ้ามี)"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            onClick={() => window.location.href = "/"}
          >
            กลับหน้าหลัก
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            ถัดไป
          </button>
        </div>
      </form>
    </div>
  );
}
