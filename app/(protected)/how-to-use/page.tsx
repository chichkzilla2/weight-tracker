import PageHeader from "@/components/shared/PageHeader"

const sections = [
  {
    emoji: "🏠",
    title: "หน้าหลัก — บันทึกน้ำหนัก",
    color: "bg-orange-50 border-orange-200",
    badge: "ใช้ทุกวัน",
    badgeColor: "bg-orange-100 text-orange-700",
    steps: [
      "กดที่ช่องกรอกน้ำหนัก (กก.)",
      "พิมพ์ตัวเลขน้ำหนักของคุณ เช่น 65.5",
      "กดปุ่มบันทึก",
      "ระบบจะแสดงน้ำหนักล่าสุดและกราฟให้อัตโนมัติ",
    ],
    tip: "ควรชั่งน้ำหนักตอนเช้าหลังตื่นนอน เพื่อให้ได้ตัวเลขที่แม่นยำ",
  },
  {
    emoji: "🏆",
    title: "อันดับ — ดูอันดับกลุ่ม",
    color: "bg-yellow-50 border-yellow-200",
    badge: "แข่งกับเพื่อน",
    badgeColor: "bg-yellow-100 text-yellow-700",
    steps: [
      "กดเมนูอันดับที่แถบด้านล่าง",
      "ดูอันดับกลุ่มของคุณเทียบกับกลุ่มอื่น",
      "อันดับคำนวณจาก % น้ำหนักที่ลดได้ของทั้งกลุ่ม",
      "สลับดูแต่ละเดือนได้โดยกดแท็บด้านบน",
    ],
    tip: "กลุ่มที่ลด % น้ำหนักได้มากที่สุดจะอยู่อันดับ 1",
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
      "เปรียบเทียบความก้าวหน้าระหว่างกลุ่ม",
    ],
    tip: "ใช้ Dashboard เพื่อดูภาพรวมและกระตุ้นให้ทีมลดน้ำหนักต่อเนื่อง",
  },
  {
    emoji: "👤",
    title: "โปรไฟล์ — ข้อมูลของคุณ",
    color: "bg-green-50 border-green-200",
    badge: "ตั้งค่า",
    badgeColor: "bg-green-100 text-green-700",
    steps: [
      "กดเมนูโปรไฟล์ที่แถบด้านล่าง",
      "ดูสถิติน้ำหนักของตัวเองตั้งแต่เริ่มต้น",
      "แก้ไขชื่อหรือรหัสผ่านได้ที่นี่",
      "กดปุ่มออกจากระบบเมื่อต้องการออก",
    ],
    tip: "เปลี่ยนรหัสผ่านสม่ำเสมอเพื่อความปลอดภัย",
  },
]

const faqs = [
  {
    q: "บันทึกน้ำหนักได้วันละกี่ครั้ง?",
    a: "บันทึกได้ไม่จำกัด แต่ระบบจะแสดงข้อมูลล่าสุดในหน้าหลัก",
  },
  {
    q: "ถ้าลืมบันทึกวันนี้ทำอย่างไร?",
    a: "บันทึกย้อนหลังได้โดยเลือกวันที่ในฟอร์มบันทึกน้ำหนัก",
  },
  {
    q: "อันดับอัปเดตเมื่อไหร่?",
    a: "อัปเดตทันทีทุกครั้งที่มีการบันทึกน้ำหนักใหม่",
  },
  {
    q: "ลืมรหัสผ่านต้องทำอย่างไร?",
    a: "ติดต่อผู้ดูแลระบบ (Admin) เพื่อรีเซ็ตรหัสผ่านให้",
  },
]

export default function HowToUsePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="📖 วิธีใช้งาน" subtitle="เริ่มต้นใช้งานได้ง่าย ๆ ใน 4 ขั้นตอน" />

      <div className="px-4 pb-8 space-y-4">

        {/* Welcome banner */}
        <div className="bg-[#5C3D1E] text-white rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">👋</span>
          <div>
            <p className="font-bold text-base">ยินดีต้อนรับ!</p>
            <p className="text-sm opacity-90">เป้าหมายของเราคือลดน้ำหนักด้วยกันเป็นทีม บันทึกน้ำหนักทุกวันเพื่อดูความก้าวหน้า</p>
          </div>
        </div>

        {/* Section cards */}
        {sections.map((s) => (
          <div key={s.title} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{s.emoji}</span>
                <h2 className="font-bold text-[#5C3D1E] text-base">{s.title}</h2>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                {s.badge}
              </span>
            </div>

            <ol className="space-y-2 mb-3">
              {s.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-[#D4C4A8] flex items-center justify-center text-xs font-bold text-[#5C3D1E]">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#5C3D1E] leading-relaxed pt-0.5">{step}</span>
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
              <div key={i} className="border-b border-[#EDE3D0] last:border-0 pb-3 last:pb-0">
                <p className="text-sm font-semibold text-[#5C3D1E] mb-1">Q: {f.q}</p>
                <p className="text-sm text-[#A08060]">A: {f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#EDE3D0] border border-[#D4C4A8] rounded-2xl p-4 text-center">
          <p className="text-sm text-[#5C3D1E]">มีปัญหาหรือข้อสงสัยเพิ่มเติม?</p>
          <p className="text-sm font-semibold text-[#5C3D1E] mt-1">ติดต่อผู้ดูแลระบบ (Admin) ได้เลย 🙏</p>
        </div>

      </div>
    </div>
  )
}
