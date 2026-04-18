import Link from "next/link";

const purposeItems = [
  "Hỗ trợ học tập, nghiên cứu và tìm hiểu thông tin.",
  "Cung cấp công cụ chatbot thông minh sử dụng LLM, RAG và GraphRAG.",
  "Khai thác và phân tích mối quan hệ giữa các thực thể trong Knowledge Graph.",
  "Hỗ trợ so sánh và đánh giá các phương pháp truy xuất thông tin.",
];

const accuracyNotes = [
  "Hệ thống có thể tạo ra thông tin không chính xác hoặc chưa cập nhật (hallucination).",
  "Nội dung chỉ mang tính tham khảo, không thay thế nguồn học thuật hoặc chuyên môn chính thức.",
  "Người dùng nên kiểm chứng lại thông tin trong các trường hợp quan trọng.",
];

const userResponsibilities = [
  "Không sử dụng hệ thống cho mục đích vi phạm pháp luật hoặc gây hại.",
  "Không khai thác, sao chép hoặc phân phối dữ liệu trái phép.",
  "Không cố gắng can thiệp, tấn công hoặc làm gián đoạn hệ thống.",
  "Chịu trách nhiệm cho các hành vi của mình khi sử dụng chatbot.",
];

const liabilityLimits = [
  "Chúng tôi không đảm bảo thông tin luôn chính xác tuyệt đối hoặc đầy đủ.",
  "Không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng thông tin từ hệ thống.",
  "Hiệu suất trả lời có thể khác nhau tùy theo chế độ RAG hoặc GraphRAG.",
];

export default function TermsPage() {
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
              Điều khoản sử dụng
            </p>
            <h1 className="-mt-8 sm:-mt-10 text-3xl sm:text-4xl font-serif font-bold text-slate-800 tracking-tight">
              Điều khoản sử dụng
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500"></p>
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
                Điều khoản sử dụng
              </h2>
              <p className="mt-4 text-[15px] text-slate-600 leading-8">
                Chào mừng bạn đến với hệ thống Wikipedia Chatbot sử dụng
                Knowledge Graph (Neo4j) và GraphRAG.
              </p>
            </div>
            <div className="space-y-4 text-slate-600 leading-8 text-[15px]">
              <p>
                Bằng việc truy cập và sử dụng hệ thống, bạn đồng ý tuân thủ các
                điều khoản được quy định trong tài liệu này.
              </p>
              <p>
                Hệ thống được phát triển nhằm mục đích hỗ trợ người dùng khám
                phá thông tin về các nhân vật nổi tiếng, sự kiện lịch sử và tri
                thức từ Wikipedia thông qua công nghệ trí tuệ nhân tạo.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4 relative">
              <span className="absolute -left-5 top-3 w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                2. Mục đích sử dụng hệ thống
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Hệ thống được xây dựng nhằm phục vụ các mục đích sau:
              </p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {purposeItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-[15px] text-slate-600 leading-8">
                Bạn cam kết sử dụng hệ thống đúng mục đích, không lạm dụng vào
                các hành vi gây hại hoặc trái pháp luật.
              </p>
            </article>

            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                3. Nội dung và độ chính xác thông tin
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Hệ thống sử dụng dữ liệu từ Wikipedia và các phương pháp truy
                xuất như RAG và GraphRAG để tạo câu trả lời.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">Tuy nhiên:</p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {accuracyNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4 relative">
              <span className="absolute -left-7 top-2 w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                4. Trách nhiệm người dùng
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Khi sử dụng hệ thống, bạn đồng ý rằng:
              </p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {userResponsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                5. Giới hạn trách nhiệm
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Hệ thống được cung cấp trên cơ sở “nguyên trạng” (as-is):
              </p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {liabilityLimits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                6. Dữ liệu người dùng
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Hệ thống có thể lưu trữ lịch sử hội thoại để cải thiện trải
                nghiệm người dùng.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Dữ liệu được sử dụng phục vụ mục đích nghiên cứu và cải tiến hệ
                thống.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Chúng tôi không chia sẻ dữ liệu cá nhân cho bên thứ ba nếu không
                có sự đồng ý của người dùng.
              </p>
            </article>

            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                7. Tài khoản và truy cập
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Người dùng có thể cần tài khoản để sử dụng đầy đủ chức năng hệ
                thống.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát
                hiện hành vi vi phạm.
              </p>
            </article>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                8. Thay đổi điều khoản
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Chúng tôi có thể cập nhật điều khoản sử dụng theo thời gian nhằm
                phù hợp với hệ thống và yêu cầu kỹ thuật mới.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Việc tiếp tục sử dụng hệ thống sau khi thay đổi đồng nghĩa với
                việc bạn chấp nhận các điều khoản cập nhật.
              </p>
            </article>

            <article className="space-y-4 relative">
              <span className="absolute -left-5 top-3 w-2 h-2 rounded-full bg-rose-400" />
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                9. Liên hệ
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Nếu bạn có câu hỏi hoặc phản hồi liên quan đến điều khoản sử
                dụng, vui lòng liên hệ với nhóm phát triển hệ thống.
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
