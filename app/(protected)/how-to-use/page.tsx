import { auth } from "@/lib/auth";
import PageHeader from "@/components/shared/PageHeader";

const sections = [
  {
    emoji: "🏠",
    title: "หน้าหลัก — บันทึกสุขภาพ",
    color: "bg-orange-50 border-orange-200",
    badge: "ใช้ทุกเดือน",
    badgeColor: "bg-orange-100 text-orange-700",
    steps: [
      "ดูน้ำหนักล่าสุดและรอบเอวล่าสุดที่การ์ดด้านบน",
      "กรอกน้ำหนัก (กก.) ในช่องบันทึกน้ำหนัก แล้วกดบันทึก → ยืนยัน",
      "กรอกรอบเอว (ซม.) ในช่องบันทึกรอบเอว แล้วกดบันทึก → ยืนยัน",
      "น้ำหนักและรอบเอวบันทึกได้อย่างละ 1 ครั้งต่อเดือนเท่านั้น",
      "เลื่อนลงดูประวัติ — แท็บ น้ำหนัก หรือ รอบเอว",
      "หากต้องการแก้ไขข้อมูลหลังบันทึกแล้ว กรุณาติดต่อผู้ดูแลระบบ",
    ],
    tip: "ควรชั่งน้ำหนักและวัดรอบเอวตอนเช้าหลังตื่นนอน เพื่อให้ได้ตัวเลขที่แม่นยำ",
  },
  {
    emoji: "👥",
    title: "กลุ่ม — จัดการกลุ่มของคุณ",
    color: "bg-purple-50 border-purple-200",
    badge: "ทีมเวิร์ค",
    badgeColor: "bg-purple-100 text-purple-700",
    steps: [
      "กดเมนูกลุ่มที่แถบด้านล่าง",
      "ถ้ายังไม่มีกลุ่ม: เลือกกลุ่มที่ต้องการและกดเข้าร่วม",
      "หลังจากเลือกกลุ่มแล้ว ผู้ใช้ทั่วไปจะเปลี่ยนกลุ่มเองไม่ได้",
      "หากต้องการเปลี่ยนกลุ่ม กรุณาติดต่อผู้ดูแลระบบ",
      "ถ้ามีกลุ่มแล้ว: ดูน้ำหนักของสมาชิกทุกคนในเดือนนี้",
    ],
    tip: "ก่อนเลือกกลุ่มควรตรวจสอบให้แน่ใจ เพราะหลังจากเลือกแล้วต้องให้ผู้ดูแลระบบช่วยเปลี่ยนให้",
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
      "ตารางจะแสดงค่าเริ่มต้น เช่น น้ำหนักเริ่มต้น หรือ รอบเอวเริ่มต้น",
      "ค่าลดลงคำนวณจากค่าเริ่มต้นเทียบกับค่าล่าสุดของเดือนที่เลือก",
      "สลับดูแต่ละเดือนหรือดูเฉพาะกลุ่มของฉันได้",
    ],
    tip: "กลุ่มที่ลด % ได้มากที่สุดจะอยู่อันดับ 1 ทั้งน้ำหนักและรอบเอว",
  },
  {
    emoji: "📈",
    title: "Dashboard — ภาพรวม",
    color: "bg-blue-50 border-blue-200",
    badge: "ดูกราฟ",
    badgeColor: "bg-blue-100 text-blue-700",
    steps: [
      "กดเมนู Dashboard ที่แถบด้านล่าง",
      "ใช้ตัวกรองแบบเลือกหลายกลุ่ม เพื่อเลือกกลุ่มที่ต้องการดูในกราฟน้ำหนัก",
      "กราฟน้ำหนักแสดงน้ำหนักรวมล่าสุดของแต่ละกลุ่มที่เลือก",
      "เลื่อนลงไปส่วนรอบเอว แล้วใช้ตัวกรองอีกชุดเพื่อเลือกกลุ่มของกราฟรอบเอว",
      "กราฟรอบเอวแสดงรอบเอวรวมล่าสุดของแต่ละกลุ่มที่เลือก",
      "อ่านข้อความใต้หัวข้อเพื่อดูวิธีคำนวณค่าต่าง ๆ แบบสั้น ๆ",
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
    emoji: "👥",
    title: "จัดการผู้ใช้",
    steps: [
      "กดเมนู Admin ที่แถบด้านล่าง แล้วเปิดแท็บจัดการผู้ใช้",
      "ดูรายชื่อผู้ใช้ทั้งหมดในตาราง หรือเป็นการ์ดบนมือถือและแท็บเล็ต",
      "กดปุ่ม รายละเอียด เพื่อดูและแก้ไขข้อมูลพื้นฐาน เช่น user_id, role, ชื่อจริง, นามสกุล และกลุ่ม",
      "กดปุ่ม แก้ไขรหัสผ่าน เมื่อต้องการตั้งรหัสผ่านใหม่ให้ผู้ใช้",
      "กดปุ่ม แก้ไขน้ำหนัก/รอบเอว เมื่อต้องการเพิ่มหรือแก้ไขข้อมูลสุขภาพของผู้ใช้",
      "กด ลบ เมื่อต้องการลบผู้ใช้ออกจากระบบ",
      "ปุ่ม บันทึก จะเปิดใช้งานเมื่อมีการแก้ไขข้อมูลเท่านั้น",
    ],
  },
  {
    emoji: "👥",
    title: "จัดการกลุ่ม",
    steps: [
      "เปิดแท็บจัดการกลุ่มในหน้า Admin",
      "สร้างกลุ่มใหม่ได้โดยกรอกชื่อกลุ่มแล้วกดสร้าง",
      "แก้ไขชื่อกลุ่มได้จากปุ่มจัดการในรายการกลุ่ม",
      "แอดมินสามารถเปลี่ยนกลุ่มให้ผู้ใช้ได้จากหน้ารายละเอียดผู้ใช้",
      "dropdown กลุ่มจะแสดงจำนวนที่ว่างของแต่ละกลุ่ม",
      "ตอนสร้างผู้ใช้ใหม่ สามารถเลือก ยังไม่เข้าร่วมกลุ่ม ได้",
    ],
  },
  {
    emoji: "📜",
    title: "ประวัติผู้ใช้",
    steps: [
      "เปิดแท็บ ประวัติผู้ใช้ เพื่อดู log การใช้งานของระบบ",
      "ตัวอย่าง log เช่น สมัครสมาชิก, เข้าร่วมกลุ่ม, เปลี่ยนกลุ่ม, แก้ไขชื่อ, admin สร้างหรือแก้ไข user และ admin สร้างหรือแก้ไขกลุ่ม",
      "ตารางประวัติมี search, filter, sort และ pagination",
      "เวลาที่แสดงเป็นเวลาไทย UTC+7",
    ],
  },
  {
    emoji: "📄",
    title: "ดาวน์โหลดรายชื่อสมาชิก",
    steps: [
      "ไปที่เมนูโปรไฟล์",
      "กดแท็บ ดาวน์โหลดรายชื่อสมาชิก",
      "ระบบจะดาวน์โหลดไฟล์ PDF ที่มีวันที่ปัจจุบัน รายชื่อสมาชิกทั้งหมด และแยกตามกลุ่ม",
    ],
  },
  {
    emoji: "📊",
    title: "Dashboard สำหรับแอดมิน",
    steps: [
      "กดเมนู Dashboard ที่แถบด้านล่าง",
      "กราฟน้ำหนักและกราฟรอบเอวมี dropdown filter แยกกัน และเลือกได้หลายกลุ่ม",
      "กราฟน้ำหนักแสดงน้ำหนักรวมล่าสุดของแต่ละกลุ่มที่เลือก",
      "กราฟรอบเอวแสดงรอบเอวรวมล่าสุดของแต่ละกลุ่มที่เลือก",
      "ข้อความใต้หัวข้อจะอธิบายวิธีคำนวณ เช่น ค่าเปลี่ยนแปลง = ค่าล่าสุด - ค่าเริ่มต้น",
      "เลื่อนลงมาจะเห็นตาราง น้ำหนักรายบุคคล และ รอบเอวรายบุคคล",
      "ใช้ช่องค้นหาในข้อมูลน้ำหนักรายบุคคลและรอบเอวรายบุคคล เพื่อค้นหาชื่อจริงหรือนามสกุล",
      "ใช้ตัวเลือกเรียงลำดับด้านบนตารางเพื่อเรียงตามคอลัมน์ที่ต้องการ",
      "ค่าสีเขียว = ลดลง, สีแดง = เพิ่มขึ้น",
    ],
  },
  {
    emoji: "📱",
    title: "การใช้งานบนมือถือและแท็บเล็ต",
    steps: [
      "ตารางจะแสดงเป็น card บนมือถือและแท็บเล็ต เพื่อให้อ่านง่าย",
      "กดปุ่มใน card เช่น รายละเอียด, แก้ไข หรือลบ เพื่อจัดการข้อมูล",
      "modal และ drawer บนมือถือจะเลื่อนขึ้นจากด้านล่าง",
      "ถ้าข้อมูลใน drawer ยาว ส่วนเนื้อหาจะเลื่อนภายใน drawer ได้",
    ],
  },
];

const faqs = [
  {
    q: "บันทึกน้ำหนักและรอบเอวได้กี่ครั้ง?",
    a: "บันทึกได้อย่างละ 1 ครั้งต่อเดือน หากต้องการแก้ไขข้อมูล กรุณาติดต่อผู้ดูแลระบบ",
  },
  {
    q: "บันทึกผิด ลบได้ไหม?",
    a: "หากบันทึกผิดและต้องการแก้ไขข้อมูล กรุณาติดต่อผู้ดูแลระบบ",
  },
  {
    q: "สมัครแล้วไม่มีกลุ่ม ต้องทำอย่างไร?",
    a: "กดเมนูกลุ่มที่แถบด้านล่าง แล้วเลือกกลุ่มที่ต้องการเข้าร่วมได้เลย",
  },
  {
    q: "เปลี่ยนกลุ่มหรือออกจากกลุ่มได้ไหม?",
    a: "ผู้ใช้ทั่วไปเปลี่ยนกลุ่มเองไม่ได้ หากต้องการเปลี่ยนกลุ่ม กรุณาติดต่อผู้ดูแลระบบ",
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
          <div className="rounded-2xl border border-[#6B3A3D] bg-[#2A1719] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🛡️</span>
              <h2 className="font-bold text-[#D08A8A] text-base">
                สำหรับผู้ดูแลระบบ (Admin) เท่านั้น
              </h2>
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-[#3A2022] text-[#D08A8A] whitespace-nowrap">
                แอดมิน
              </span>
            </div>

            <div className="space-y-4">
              {adminSections.map((s) => (
                <div key={s.title} className="bg-[#171A20]/80 rounded-xl p-3">
                  <p className="font-semibold text-[#D08A8A] text-sm flex items-center gap-1.5 mb-2">
                    <span>{s.emoji}</span>
                    {s.title}
                  </p>
                  <ol className="space-y-1.5">
                    {s.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3A2022] border border-[#5A3032] flex items-center justify-center text-xs font-bold text-[#D08A8A]">
                          {i + 1}
                        </span>
                        <span className="text-xs text-[#D9A0A0] leading-relaxed pt-0.5">
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
        <div className="bg-[#F59E0B] text-[#111318] rounded-2xl p-4 flex items-center gap-3">
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
          <div key={s.title} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{s.emoji}</span>
                <h2 className="font-bold text-[#F59E0B] text-base">
                  {s.title}
                </h2>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#242832]/65 text-[#F59E0B] border border-white/10"
              >
                {s.badge}
              </span>
            </div>

            <ol className="space-y-2 mb-3">
              {s.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full glass-card flex items-center justify-center text-xs font-bold text-[#F59E0B]">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#A8AFBD] leading-relaxed pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="bg-[#171A20]/80 rounded-xl px-3 py-2 flex items-start gap-2">
              <span className="text-base mt-0.5">💡</span>
              <p className="text-xs text-[#A8AFBD] leading-relaxed">{s.tip}</p>
            </div>
          </div>
        ))}

        {/* FAQ */}
        <div className="glass-card rounded-2xl p-4">
          <h2 className="font-bold text-[#F59E0B] text-base mb-3 flex items-center gap-2">
            <span>❓</span> คำถามที่พบบ่อย
          </h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="border-b border-white/10 last:border-0 pb-3 last:pb-0"
              >
                <p className="text-sm font-semibold text-[#F59E0B] mb-1">
                  Q: {f.q}
                </p>
                <p className="text-sm text-[#A8AFBD]">A: {f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#242832]/65 border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-sm text-[#F59E0B]">
            มีปัญหาหรือข้อสงสัยเพิ่มเติม?
          </p>
          <p className="text-sm font-semibold text-[#F59E0B] mt-1">
            ติดต่อผู้ดูแลระบบ (Admin) ได้เลย 🙏
          </p>
        </div>
      </div>
    </div>
  );
}
