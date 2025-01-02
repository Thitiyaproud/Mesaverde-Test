"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const step1Schema = z.object({
  reporterName: z.string().min(1, "กรุณากรอกชื่อ").max(100, "ไม่เกิน 100 ตัวอักษร"),
  phoneNumber: z.string().regex(/^\d{10}$/, "เบอร์โทรต้องมี 10 หลัก"),
});

const step2Schema = z.object({
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  assessmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "กรุณาเลือกวันที่ประเมิน",
  }),
});

const step3Schema = z.object({
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

const stepSchemas = [step1Schema, step2Schema, step3Schema];

const finalSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type FormData = z.infer<typeof finalSchema>;

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isClient, setIsClient] = useState(false);

  const currentSchema = stepSchemas[currentStep - 1] || z.object({});
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Partial<FormData>>({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    setIsClient(true);
    const savedData = localStorage.getItem("form3Data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData && typeof parsedData === "object") {
          const sanitizedData = Object.fromEntries(
            Object.entries(parsedData).map(([key, value]) => {
              if (typeof value === "string" || typeof value === "number" || value === undefined) {
                return [key, value];
              }
              return [key, undefined];
            })
          );
          setFormData(sanitizedData);
          Object.entries(sanitizedData).forEach(([key, value]) => {
            if (value !== undefined) setValue(key as keyof FormData, value);
          });
        }
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, [setValue]);   

  useEffect(() => {
    try {
      if (isClient) {
        const data = JSON.stringify(formData);
        localStorage.setItem("form3Data", data);
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [formData, isClient]);  

  const handleNext = (data: Partial<FormData>) => {
    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (typeof value === "string" || typeof value === "number" || value === undefined) {
          return [key, value];
        }
        return [key, undefined]; 
      })
    );
    setFormData((prev) => ({ ...prev, ...sanitizedData }));
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit({ ...formData, ...sanitizedData } as FormData);
    }
  };  

  const handleFinalSubmit = async (data: FormData) => {
    console.log("Submitting data:", data);
    try {
      const response = await fetch("/api/damagereport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("API Error:", errorDetails);
        toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล");
      } else {
        toast.success("ส่งข้อมูลสำเร็จ!");
        localStorage.removeItem("form3Data");
        setFormData({});
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
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
          </>
        );
      case 2:
        return (
          <>
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
              <label htmlFor="assessmentDate" className="block text-blue-700 font-semibold mb-1">
                วันที่ประเมิน
              </label>
              <input
                type="date"
                id="assessmentDate"
                {...register("assessmentDate")}
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.assessmentDate && (
                <p className="text-red-500 text-sm mt-1">{errors.assessmentDate.message}</p>
              )}
            </div>
          </>
        );
      case 3:
        return (
          <>
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
              {errors.damageList && (
                <p className="text-red-500 text-sm mt-1">{errors.damageList.message}</p>
              )}
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
                <p className="text-red-500 text-sm mt-1">{errors.propertyDamage.message}</p>
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
          </>
        );
      case 4:
        return (
          <div>
            <h2 className="text-blue-700 font-semibold text-lg mb-4">สรุปข้อมูล</h2>
            <pre className="mb-8 min-w-[400px] max-w-md mx-auto p-6 border rounded-lg shadow-md bg-white border-blue-500">
              <p><strong>ชื่อผู้รายงาน:</strong> {formData.reporterName}</p>
              <p><strong>เบอร์โทร:</strong> {formData.phoneNumber}</p>
              <p><strong>ที่อยู่:</strong> {formData.address}</p>
              <p><strong>วันที่ประเมิน:</strong> {formData.assessmentDate}</p>
              <p><strong>รายการความเสียหาย:</strong> {formData.damageList}</p>
              <p>
                <strong>ความเสียหายทางทรัพย์สิน:</strong>{" "}
                {formData.propertyDamage !== undefined ? formData.propertyDamage.toLocaleString() : "ไม่มีข้อมูล"} บาท
              </p>
              <p><strong>ความเสียหายทางชีวิต:</strong> {formData.lifeImpact || "ไม่มี"}</p>
              <p><strong>หมายเหตุ:</strong> {formData.additionalNotes || "ไม่มี"}</p>
            </pre>
            <p className="text-sm text-gray-500 mt-2">กรุณาตรวจสอบข้อมูลก่อนกดยืนยันส่ง</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <h1 className="text-xl font-semibold mt-8 mb-8">รายงานประเมินความเสียหายจากน้ำท่วม</h1>
      <form
        onSubmit={handleSubmit(handleNext)}
        className="mb-8 min-w-[400px] max-w-md mx-auto p-6 border rounded-lg shadow-md bg-white border-blue-500"
      >
        {renderStep()}
        <div className="flex justify-between mt-4">
          {currentStep > 1 && (
            <button
              type="button"
              className="py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              ย้อนกลับ
            </button>
          )}
          {currentStep === 1 && (
            <button
              type="button"
              className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
              onClick={() => window.location.href = "/"}
            >
              กลับหน้าหลัก
            </button>
          )}
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {currentStep < 4 ? "ถัดไป" : "ยืนยันและส่งข้อมูล"}
          </button>
        </div>
      </form>
    </div>
  );
}