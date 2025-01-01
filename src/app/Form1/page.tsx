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
  floodStatus: z.enum(["ปกติ", "เฝ้าระวัง", "อันตราย"], {
    errorMap: () => ({ message: "กรุณาเลือกสถานะน้ำท่วม" }),
  }),
  image: z.instanceof(File).optional(),
});

interface FormData {
  reporterName: string;
  phoneNumber: string;
  address: string;
  floodStatus: string;
  image?: File;
}

export default function Form1() {
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // โหลดข้อมูลที่บันทึกจาก localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("formData");
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
      localStorage.setItem("formData", JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: FormData) => {
    setFormData(data);
    setIsSummaryVisible(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      if (formData) {
        formDataToSend.append("reporterName", formData.reporterName);
        formDataToSend.append("phoneNumber", formData.phoneNumber);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("floodStatus", formData.floodStatus);
        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }
      }
  
      const response = await fetch("/api/floodreport", {
        method: "POST",
        body: formDataToSend,
      });
  
      if (response.ok) {
        toast.success("ส่งข้อมูลสำเร็จ!");
        localStorage.removeItem("formData");
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
          <p><strong>สถานะน้ำท่วม:</strong> {formData.floodStatus}</p>
          {imagePreview && (
            <div className="mt-4">
              <strong>รูปภาพ:</strong>
              <img src={imagePreview} alt="Preview" className="mt-2 max-w-full h-auto border rounded" />
            </div>
          )}
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
      <h1 className="text-xl font-semibold mt-8 mb-8">รายงานสถานการณ์น้ำท่วมในพื้นที่</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 min-w-[400px] max-w-md mx-auto p-6 border rounded-lg shadow-md bg-white border-blue-500">
        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">ชื่อผู้รายงาน:</label>
          <input
            {...register("reporterName")}
            placeholder="ชื่อผู้รายงาน"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.reporterName && <p className="text-red-500 text-sm mt-1">{errors.reporterName.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">เบอร์โทร:</label>
          <input
            {...register("phoneNumber")}
            placeholder="เบอร์โทร"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">ที่อยู่:</label>
          <textarea
            {...register("address")}
            placeholder="ที่อยู่"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">สถานะน้ำท่วม:</label>
          <select
            {...register("floodStatus")}
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">กรุณาเลือก</option>
            <option value="ปกติ">ปกติ</option>
            <option value="เฝ้าระวัง">เฝ้าระวัง</option>
            <option value="อันตราย">อันตราย</option>
          </select>
          {errors.floodStatus && <p className="text-red-500 text-sm mt-1">{errors.floodStatus.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">อัปโหลดรูปภาพ:</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-w-full h-auto border rounded" />
            </div>
          )}
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