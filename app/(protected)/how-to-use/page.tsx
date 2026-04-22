import { auth } from "@/lib/auth";
import PageHeader from "@/components/shared/PageHeader";

const sections = [
  {
    emoji: "🏠",
    title: "หน้าหลัก — บันทึกน้ำหนักและรอบเอว",
    color: "bg-orange-50 border-orange-200",
    badge: "ใช้ทุกเดือน",
    badgeColor: "bg-orange-100 text-orange-700",
    steps: [
      "ดูน้ำหนักล่าสุดและรอบเอวล่าสุดที่การ์ดด้านบน",
      "กรอกน้ำหนัก (กก.) ในช่องบันทึกน้ำหนัก แล้วกดบันทึก → ยืนยัน",
      "กรอกรอบเอว (ซม.) ในช่องบันทึกรอบเอว แล้วกดบันทึก → ยืนยัน",
      "เลื่อนลงดูประวัติ — แท็บ น้ำหนัก หรือ รอบเอว",
      "หากบันทึกผิด กดปุ่ม ลบข้อมูล ในรายการนั้น แล้วยืนยันการลบ",
    ],
    tip: "ควรชั่งน้ำหนักและวัดรอบเอวตอนเช้าหลังตื่นนอน เพื่อให้ได้ตัวเลขที่แม่นยำ",
  },
  {
    emoji: "👥",
    title: "กลุ่ม — ดูและจัดการกลุ่มของคุณ",
    color: "bg-purple-50 border-purple-200",
    badge: "ทีมเวิร์ค",
    badgeColor: "bg-purple-100 text-purple-700",
    steps: [
      "กดเมนูกลุ่มที่แถบด้านล่าง",
      "ถ้ายังไม่มีกลุ่ม: เลือกกลุ่มที่ต้องการและกดเข้าร่วม",
      "ถ้ามีกลุ่มแล้ว: ดูน้ำหนักของสมาชิกทุกคนในเดือนนี้",
      "เปลี่ยนกลุ่มหรือออกจากกลุ่มได้ที่ด้านล่างของหน้า",
    ],
    tip: "แต่ละกลุ่มมีสมาชิกได้สูงสุด 10 คน กลุ่มที่เต็มแล้วจะไม่สามารถเข้าร่วมได้",
  },
  {
    emoji: "🏆",
    title: "อันดับ — ดูอันดับกลุ่ม",
    color: "bg-yellow-50 border-yellow-200",
    badge: "แข่งกับเพื่อน",
    badgeColor: "bg-yellow-100 text-yellow-700",
    steps: [
      "กดเมนูอันดับที่แถบด้านล่าง",
      "ด้านบน: อันดับน้ำหนัก — เรียงตาม % น้ำหนักที่ลดได้",
      "ด้านล่าง: อันดับรอบเอว — เรียงตาม % รอบเอวที่ลดได้",
      "สลับดูแต่ละเดือนหรือดูเฉพาะกลุ่มของฉันได้",
    ],
    tip: "กลุ่มที่ลด % ได้มากที่สุดจะอยู่อันดับ 1 ทั้งน้ำหนักและรอบเอว",
  },
  {
    emoji: "📈",
    title: "Dashboard — ภาพรวมทุกกลุ่ม",
    color: "bg-blue-50 border-blue-200",
    badge: "ดูกราฟ",
    badgeColor: "bg-blue-100 text-blue-700",
    steps: [
      "กดเมนู Dashboard ที่แถบด้านล่าง",
      "เลือกกลุ่มที่ต้องการดูจากแถบเลือก",
      "ดูกราฟแนวโน้มน้ำหนักของสมาชิกทุกคน",
      "เลื่อนลงเพื่อดูส่วนรอบเอว — ข้อมูลและกราฟแยกต่างหาก",
      "เปรียบเทียบความก้าวหน้าระหว่างกลุ่มได้ทั้งน้ำหนักและรอบเอว",
    ],
    tip: "ใช้ Dashboard เพื่อดูภาพรวมและกระตุ้นให้ทีมลดน้ำหนักและรอบเอวต่อเนื่อง",
  },
  {
    emoji: "👤",
    title: "โปรไฟล์ — ข้อมูลของคุณ",
    color: "bg-green-50 border-green-200",
    badge: "ตั้งค่า",
    badgeColor: "bg-green-100 text-green-700",
    steps: [
      "กดเมนูโปรไฟล์ที่แถบด้านล่าง",
      "ดูชื่อผู้ใช้และกลุ่มที่สังกัด",
      "เปลี่ยนรหัสผ่านได้ที่นี่",
      "กดปุ่มออกจากระบบเมื่อต้องการออก",
    ],
    tip: "การเปลี่ยนกลุ่มหรือออกจากกลุ่มทำได้ที่เมนูกลุ่ม ไม่ใช่ที่นี่",
  },
];

const adminSections = [
  {
    emoji: "👤",
    title: "จัดการผู้ใช้",
    steps: [
      "กดเมนู Admin ที่แถบด้านล่าง",
      "กด + เพิ่มผู้ใช้ใหม่ กรอกชื่อจริง ชื่อผู้ใช้ รหัสผ่าน และเลือกกลุ่ม",
      "กดปุ่มถังขยะหน้าชื่อผู้ใช้เพื่อลบผู้ใช้ออกจากระบบ (ข้อมูลน้ำหนักจะถูกลบด้วย)",
    ],
  },
  {
    emoji: "👥",
    title: "จัดการกลุ่ม",
    steps: [
      "เลื่อนลงมาที่ส่วนจัดการกลุ่มในหน้า Admin",
      "กด + สร้างกลุ่มใหม่ พิมพ์ชื่อกลุ่มแล้วกดสร้าง",
      "กดไอคอนดินสอเพื่อแก้ไขชื่อกลุ่ม",
      "กดไอคอนถังขยะเพื่อลบกลุ่ม (ผู้ใช้ในกลุ่มจะถูกย้ายออกอัตโนมัติ)",
    ],
  },
  {
    emoji: "🔀",
    title: "ย้ายผู้ใช้ระหว่างกลุ่ม",
    steps: [
      "ในตารางรายชื่อผู้ใช้ กด dropdown ในคอลัมน์ กลุ่ม",
      "เลือกกลุ่มที่ต้องการย้ายผู้ใช้ไป",
      "กดปุ่ม บันทึกการเปลี่ยนกลุ่ม แล้วยืนยัน",
    ],
  },
  {
    emoji: "📊",
    title: "ดูข้อมูลรายบุคคลใน Dashboard",
    steps: [
      "กดเมนู Dashboard ที่แถบด้านล่าง",
      "เลื่อนลงมาจะเห็นตาราง น้ำหนักรายบุคคล และ รอบเอวรายบุคคล",
      "ใช้ตัวเลือกเรียงลำดับด้านบนตารางเพื่อเรียงตามคอลัมน์ที่ต้องการ",
      "ค่าสีเขียว = ลดลง, สีแดง = เพิ่มขึ้น",
    ],
  },
  {
    emoji: "🔑",
    title: "เปลี่ยนรหัสผ่านผู้ใช้",
    steps: [
      "ในหน้า Admin เมนูจัดการผู้ใช้",
      "กดไอคอนกุญแจ (🔑) ข้างชื่อผู้ใช้ที่ต้องการเปลี่ยน",
      "กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) แล้วกดยืนยัน",
    ],
  },
];

const faqs = [
  {
    q: "บันทึกน้ำหนักได้วันละกี่ครั้ง?",
    a: "บันทึกได้ไม่จำกัด แต่ระบบจะแสดงข้อมูลล่าสุดในหน้าหลัก",
  },
  {
    q: "บันทึกผิด ลบได้ไหม?",
    a: "ได้ เลื่อนลงมาที่ส่วน รายการทั้งหมด เลือกแท็บ น้ำหนัก หรือ รอบเอว แล้วกดปุ่ม ลบข้อมูล ในรายการที่ต้องการ จากนั้นยืนยันการลบ",
  },
  {
    q: "สมัครแล้วไม่มีกลุ่ม ต้องทำอย่างไร?",
    a: "กดเมนูกลุ่มที่แถบด้านล่าง แล้วเลือกกลุ่มที่ต้องการเข้าร่วมได้เลย",
  },
  {
    q: "เปลี่ยนกลุ่มหรือออกจากกลุ่มได้ไหม?",
    a: "ได้ กดเมนูกลุ่ม แล้วเลือกเปลี่ยนกลุ่มหรือกดออกจากกลุ่มที่ด้านล่างของหน้า",
  },
  {
    q: "กลุ่มรับสมาชิกได้กี่คน?",
    a: "แต่ละกลุ่มรับสมาชิกได้สูงสุด 10 คน กลุ่มที่เต็มแล้วจะไม่สามารถเข้าร่วมได้",
  },
  {
    q: "อันดับอัปเดตเมื่อไหร่?",
    a: "อัปเดตทันทีทุกครั้งที่มีการบันทึกน้ำหนักใหม่",
  },
  {
    q: "ลืมรหัสผ่านต้องทำอย่างไร?",
    a: "ติดต่อผู้ดูแลระบบ (Admin) เพื่อรีเซ็ตรหัสผ่านให้",
  },
];

export default async function HowToUsePage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="📖 วิธีใช้งาน"
        subtitle="เริ่มต้นใช้งานได้ง่าย ๆ ใน 5 ขั้นตอน"
      />

      <div className="px-4 pb-8 space-y-4">
        {/* Admin-only section — shown before everything else */}
        {isAdmin && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🛡️</span>
              <h2 className="font-bold text-red-700 text-base">
                สำหรับผู้ดูแลระบบ (Admin) เท่านั้น
              </h2>
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                แอดมิน
              </span>
            </div>

            <div className="space-y-4">
              {adminSections.map((s) => (
                <div key={s.title} className="bg-white/70 rounded-xl p-3">
                  <p className="font-semibold text-red-700 text-sm flex items-center gap-1.5 mb-2">
                    <span>{s.emoji}</span>
                    {s.title}
                  </p>
                  <ol className="space-y-1.5">
                    {s.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-xs font-bold text-red-700">
                          {i + 1}
                        </span>
                        <span className="text-xs text-red-800 leading-relaxed pt-0.5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Welcome banner */}
        <div className="bg-[#5C3D1E] text-white rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">👋</span>
          <div>
            <p className="font-bold text-base">ยินดีต้อนรับ!</p>
            <p className="text-sm opacity-90">
              เป้าหมายของเราคือลดน้ำหนักด้วยกันเป็นทีม
              บันทึกน้ำหนักทุกเดือนเพื่อดูความก้าวหน้า
            </p>
          </div>
        </div>

        {/* Section cards */}
        {sections.map((s) => (
          <div key={s.title} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{s.emoji}</span>
                <h2 className="font-bold text-[#5C3D1E] text-base">
                  {s.title}
                </h2>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}
              >
                {s.badge}
              </span>
            </div>

            <ol className="space-y-2 mb-3">
              {s.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-[#D4C4A8] flex items-center justify-center text-xs font-bold text-[#5C3D1E]">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#5C3D1E] leading-relaxed pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="bg-white/70 rounded-xl px-3 py-2 flex items-start gap-2">
              <span className="text-base mt-0.5">💡</span>
              <p className="text-xs text-[#A08060] leading-relaxed">{s.tip}</p>
            </div>
          </div>
        ))}

        {/* FAQ */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl p-4">
          <h2 className="font-bold text-[#5C3D1E] text-base mb-3 flex items-center gap-2">
            <span>❓</span> คำถามที่พบบ่อย
          </h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="border-b border-[#EDE3D0] last:border-0 pb-3 last:pb-0"
              >
                <p className="text-sm font-semibold text-[#5C3D1E] mb-1">
                  Q: {f.q}
                </p>
                <p className="text-sm text-[#A08060]">A: {f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#EDE3D0] border border-[#D4C4A8] rounded-2xl p-4 text-center">
          <p className="text-sm text-[#5C3D1E]">
            มีปัญหาหรือข้อสงสัยเพิ่มเติม?
          </p>
          <p className="text-sm font-semibold text-[#5C3D1E] mt-1">
            ติดต่อผู้ดูแลระบบ (Admin) ได้เลย 🙏
          </p>
        </div>
      </div>
    </div>
  );
}
