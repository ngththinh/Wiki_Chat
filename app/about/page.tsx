import Link from "next/link";

const coreFeatures = [
  "Hỏi đáp ngữ nghĩa với mô hình LLM kết hợp RAG và GraphRAG.",
  "Khai thác quan hệ thực thể qua Knowledge Graph Neo4j.",
  "So sánh hiệu suất truy xuất giữa các pipeline để tối ưu chất lượng trả lời.",
  "Lưu vết hội thoại nhằm cải thiện trải nghiệm và phục vụ phân tích học thuật.",
];

const systemValues = [
  "Minh bạch trong nguồn dữ liệu và cách xử lý truy vấn.",
  "Ưu tiên độ chính xác, khả năng kiểm chứng và tính giải thích.",
  "Tôn trọng quyền riêng tư và an toàn thông tin người dùng.",
  "Phát triển bền vững theo định hướng giáo dục và nghiên cứu.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0 bg-slate-700/2 backdrop-blur-[0.3px]" />

      <div className="relative z-10">
        <header className="pt-14 pb-10 sm:pt-20 sm:pb-16 border-b border-slate-200/70 bg-slate-50/60">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-5xl sm:text-7xl md:text-8xl font-serif font-semibold text-slate-300/40 tracking-tight select-none">
              Giới thiệu hệ thống
            </p>
            <h1 className="-mt-8 sm:-mt-10 text-3xl sm:text-4xl font-serif font-bold text-slate-800 tracking-tight">
              Giới thiệu hệ thống
            </h1>

            <div className="mt-5 flex justify-center text-slate-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-11">
          <section className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
            <div className="relative">
              <span className="absolute -left-7 top-2 w-2.5 h-2.5 rounded-full bg-rose-400" />
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800 leading-tight tracking-tight">
                Wikipedia Chatbot
                <br />
                GraphRAG & Neo4j
              </h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-8 text-[15px]">
              <p>
                Wikipedia Chatbot là nền tảng hỏi đáp tri thức được xây dựng để
                hỗ trợ người dùng khám phá thông tin về danh nhân, sự kiện lịch
                sử và các chủ đề liên quan trên Wikipedia bằng ngôn ngữ tự
                nhiên.
              </p>
              <p>
                Hệ thống kết hợp mô hình ngôn ngữ lớn với các kỹ thuật truy xuất
                thông tin hiện đại nhằm nâng cao độ chính xác, độ bao phủ và khả
                năng diễn giải trong câu trả lời.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4 relative">
              <span className="absolute -left-5 top-3 w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Năng lực chính của hệ thống
              </h3>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {coreFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Giá trị phát triển
              </h3>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {systemValues.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Công nghệ cốt lõi
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Hệ thống sử dụng kiến trúc Retrieval-Augmented Generation (RAG)
                và GraphRAG để liên kết truy vấn người dùng với tri thức có cấu
                trúc trong Knowledge Graph Neo4j. Cách tiếp cận này giúp mô hình
                trả lời bám sát ngữ cảnh, giảm nhiễu và tăng khả năng kiểm chứng
                nội dung.
              </p>
            </article>

            <article className="space-y-4 relative">
              <span className="absolute -left-5 top-3 w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Định hướng tiếp theo
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Nhóm phát triển tiếp tục mở rộng kho tri thức, cải thiện khả
                năng truy xuất đa bước và nâng cao chất lượng hội thoại theo
                từng ngữ cảnh học tập cụ thể. Mục tiêu là xây dựng một trợ lý
                tri thức tiếng Việt đáng tin cậy cho nghiên cứu và giáo dục.
              </p>
            </article>
          </section>
        </main>

        <footer className="border-t border-slate-200/70 mt-6">
          <div className="max-w-5xl mx-auto px-6 py-8 text-center text-xs sm:text-sm text-slate-500 tracking-wide">
            © 2025 WikiChatbot · SEP490.8 Team
          </div>
        </footer>
      </div>
    </div>
  );
}
