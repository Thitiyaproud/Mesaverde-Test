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
  helpTypes: z.array(z.string()).nonempty("กรุณาเลือกประเภทความช่วยเหลือ"),
  urgencyLevel: z.string().min(1, "กรุณาเลือกระดับความเร่งด่วน"),
  additionalDetails: z.string().optional(),
});

interface FormData {
  reporterName: string;
  phoneNumber: string;
  address: string;
  helpTypes: string[];
  urgencyLevel: string;
  additionalDetails?: string;
}

export default function Form2() {
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
    const savedData = localStorage.getItem("form2Data");
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
      localStorage.setItem("form2Data", JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: FormData) => {
    setFormData(data);
    setIsSummaryVisible(true);
  };

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch("/api/helprequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // formData มาจาก state
      });
  
      if (response.ok) {
        toast.success("ส่งข้อมูลสำเร็จ!");
        localStorage.removeItem("form2Data");
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
          <p><strong>ประเภทความช่วยเหลือที่ต้องการ:</strong> {formData.helpTypes.join(", ")}</p>
          <p><strong>ระดับความเร่งด่วน:</strong> {formData.urgencyLevel}</p>
          <p><strong>รายละเอียดเพิ่มเติม:</strong> {formData.additionalDetails || "ไม่มี"}</p>
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
      <h1 className="text-xl font-semibold mt-8 mb-8">รายงานความต้องการในการช่วยเหลือ</h1>
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
          <label className="block text-blue-700 font-semibold mb-1">ประเภทความช่วยเหลือที่ต้องการ:</label>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="อาหาร"
                {...register("helpTypes")}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">อาหาร</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="ยา"
                {...register("helpTypes")}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">ยา</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="ที่พักอาศัย"
                {...register("helpTypes")}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">ที่พักอาศัย</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="อื่นๆ"
                {...register("helpTypes")}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">อื่นๆ</span>
            </label>
          </div>
          {errors.helpTypes && (
            <p className="text-red-500 text-sm mt-1">{errors.helpTypes.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">ระดับความเร่งด่วนของความช่วยเหลือ:</label>
          <div>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="เร่งด่วนมาก"
                {...register("urgencyLevel")}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">เร่งด่วนมาก</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="เร่งด่วน"
                {...register("urgencyLevel")}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">เร่งด่วน</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="ปกติ"
                {...register("urgencyLevel")}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">ปกติ</span>
            </label>
          </div>
          {errors.urgencyLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.urgencyLevel.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="additionalDetails" className="block text-blue-700 font-semibold mb-1">
            รายละเอียดเพิ่มเติม:
          </label>
          <textarea
            id="additionalDetails"
            {...register("additionalDetails")}
            placeholder="โปรดระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
