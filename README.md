# แบบฟอร์มรายงานสถานการณ์น้ำท่วม

โปรเจกต์นี้สร้างหน้าแบบฟอร์มรายงานสถานการณ์น้ำท่วมที่พัฒนาด้วย Next.js (version 14), Prisma และใช้ MAMP สำหรับการจัดการฐานข้อมูล

## การติดตั้ง

1. clone project
   ```bash
   git clone https://github.com/Thitiyaproud/mesaverde-test
   ```

2. ติดตั้ง dependencies
   ```bash
   npm install
   # หรือ
   yarn install
   ```

3. ตั้งค่า Database
   - ใช้ Prisma สำหรับการจัดการฐานข้อมูล รันคำสั่งดังต่อไปนี้เพื่อสร้างฐานข้อมูล SQLite:
     ```bash
     npx prisma migrate dev --name init
     ```
   คำสั่งนี้จะสร้างฐานข้อมูล


## การรันโปรเจกต์

1. Run the development server
   ```bash
   npm run dev
   # หรือ
   yarn dev
   ```

2. เปิดเบราว์เซอร์และไปที่ `http://localhost:3000`

## วิธีการทำงาน

1. ผู้ใช้กรอกแบบฟอร์มมี 3 แบบฟอร์ม ได้แก่
    - รายงานสถานการณ์น้ำท่วมในพื้นที่ 
    - รายงานความต้องการในการช่วยเหลือ 
    - รายงานประเมินความเสียหายจากน้ำท่วม

2. การบันทึกข้อมูล
    - เมื่อเปลี่ยนหน้า ฟอร์มจะบันทึกข้อมูลล่าสุดไว้โดยใช้ localStorage
    - หากปิดเว็บไซต์และเปิดใหม่ ข้อมูลเดิมยังคงอยู่

3. หน้าสรุปข้อมูล
    - หลังจากกรอกแบบฟอร์มครบถ้วน ผู้ใช้คลิก "ถัดไป" เพื่อดูหน้าสรุปข้อมูล
    - มีปุ่ม "แก้ไขข้อมูล" เพื่อปรับปรุงข้อมูลก่อนการส่ง

4. เมื่อคลิก "ยืนยันส่งข้อมูล" ระบบจะส่งคำขอ POST ไปยัง backend
Endpoint สำหรับแต่ละแบบฟอร์ม ได้แก่ `/api/floodreport`, `/api/helprequest` และ `/api/damagereport`

5. Backend ตรวจสอบความถูกต้องของข้อมูลและบันทึกรายงานลงในฐานข้อมูล SQLite โดยใช้ Prisma

6. หากมีการอัปโหลดรูปภาพ ระบบจะบันทึกไฟล์ไว้ในโฟลเดอร์ `public/uploads` และบันทึก Path ของไฟล์ไว้ในฐานข้อมูล

7. สามารถดึงข้อมูลรายงานที่ถูกส่งผ่านคำขอ `GET` ไปยัง endpoint 
`/api/floodreport`, `/api/helprequest` และ `/api/damagereport` ใน Postman

8. ผู้ใช้สามารถอัปเดตข้อมูลรายงานผ่านคำขอ `PUT` ไปยัง endpoint 
`/api/floodreport`, `/api/helprequest` และ `/api/damagereport` ใน Postman

   - ตัวอย่าง JSON สำหรับ `PUT`
     ```json
     {
       "id": 1,
       "reporterName": "Prim",
       "phoneNumber": "0123456789",
       "address": "555",
       "helpTypes": ["ที่พักอาศัย"],
       "urgencyLevel": "ปกติ",
       "additionalDetails": "รายละเอียดเพิ่มเติม"
     }
     ```
   - ระบบจะตรวจสอบ `id` และอัปเดตข้อมูลที่เกี่ยวข้องในฐานข้อมูล

9. ผู้ใช้สามารถลบข้อมูลรายงานผ่าน `DELETE` 
endpoint `/api/floodreport`, `/api/helprequest` และ `/api/damagereport` ใน Postman

   - ตัวอย่าง JSON สำหรับลบ:
     ```json
     {
       "id": 1
     }
     ```
   - ระบบจะตรวจสอบ `id` และลบข้อมูลที่เกี่ยวข้องในฐานข้อมูล

10. ทุกคำขอ CRUD (`POST`, `GET`, `PUT`, `DELETE`) สามารถทดสอบได้ผ่าน Postman โดยการส่งคำขอไปยัง endpoint ที่กำหนด

## หมายเหตุ

- Prisma ถูกตั้งค่าให้ใช้ SQLite เป็นฐานข้อมูล
- รูปภาพจะถูกจัดเก็บไว้ในโฟลเดอร์ `public/uploads` 

