import Image from "next/image";
import Card from "./components/Card/card"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full h-[32px] bg-gradient-to-r from-cyan-500 to-blue-500">
      </div>
      <h1 className="text-2xl font-semibold mt-8 mb-8">รายงานสถานการณ์อุทกภัย</h1>
      <Image src="/image/1.png" alt="Flood Situation" width={200} height={100} />
      <div className="flex flex-wrap justify-center gap-6 mt-8">
        <Card
          title="รายงานสถานการณ์น้ำท่วมในพื้นที่"
          description="สำหรับการรวบรวมข้อมูลสถานการณ์น้ำท่วมจากประชาชนในพื้นที่"
          link="/Form1"
          buttonText="แจ้งข้อมูล"
        />
        <Card
          title="รายงานความต้องการในการช่วยเหลือ (ด่วน!)"
          description="สำหรับประชาชนที่ต้องการความช่วยเหลือ เช่น อาหาร ยา หรือที่พักอาศัย"
          link="/Form2"
          buttonText="แจ้งข้อมูล"
        />
        <Card
          title="รายงานประเมินความเสียหายจากน้ำท่วม"
          description="ใช้สำหรับการเก็บข้อมูลความเสียหายทั้งเชิงทรัพย์สินและเชิงชีวิต"
          link="/Form3"
          buttonText="แจ้งข้อมูล"
        />
      </div>
    </div>
  );
}
