import Link from "next/link";

const collectedDataItems = [
  "Lịch sử hội thoại với chatbot",
  "Câu hỏi và truy vấn tìm kiếm của người dùng",
  "Dữ liệu đăng nhập cơ bản (tài khoản, phiên làm việc)",
  "Dữ liệu sử dụng hệ thống nhằm phân tích hiệu suất (RAG vs GraphRAG)",
];

const dataUsageItems = [
  "Cải thiện chất lượng trả lời của mô hình AI",
  "Đánh giá hiệu quả truy xuất thông tin",
  "Nghiên cứu và tối ưu hệ thống GraphRAG và Knowledge Graph Neo4j",
];

const dataSharingCases = [
  "Phục vụ xử lý truy vấn của người dùng",
  "Cải thiện mô hình AI và hệ thống truy xuất thông tin",
  "Phân tích phục vụ nghiên cứu học thuật",
];

const securityMeasures = [
  "Mã hóa dữ liệu trong quá trình truyền tải và lưu trữ",
  "Kiểm soát truy cập theo phân quyền (User / Admin)",
  "Lưu log hệ thống phục vụ kiểm tra và debug",
  "Giới hạn truy cập trực tiếp vào cơ sở dữ liệu Neo4j và vector database",
];

export default function PrivacyPage() {
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
              Chính sách bảo mật
            </p>
            <h1 className="-mt-8 sm:-mt-10 text-3xl sm:text-4xl font-serif font-bold text-slate-800 tracking-tight">
              Chính sách bảo mật
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
                Chúng tôi tuân thủ pháp luật,
                <br />
                tuân theo chính sách
                <br />
                và minh bạch dữ liệu
              </h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-8 text-[15px]">
              <p>
                Hệ thống Wikipedia Chatbot cam kết tuân thủ các quy định về bảo
                vệ dữ liệu và quyền riêng tư của người dùng. Mọi thông tin được
                thu thập và xử lý nhằm mục đích nghiên cứu, cải thiện chất lượng
                hệ thống và nâng cao trải nghiệm người dùng.
              </p>
              <p>
                Chúng tôi không sử dụng dữ liệu cá nhân cho mục đích thương mại
                và luôn đảm bảo tính minh bạch trong việc lưu trữ và xử lý thông
                tin.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Quyền đối với dữ liệu người dùng
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Người dùng không trực tiếp chỉnh sửa dữ liệu hội thoại đã lưu
                trong hệ thống.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Dữ liệu được tạo trong quá trình sử dụng chatbot (như lịch sử
                hội thoại) được hệ thống lưu trữ nhằm phục vụ mục đích nghiên
                cứu, cải thiện chất lượng phản hồi và đánh giá hiệu suất mô
                hình.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Trong trường hợp cần thiết, người dùng có thể gửi yêu cầu đến
                quản trị viên để xem dữ liệu liên quan đến tài khoản hoặc yêu
                cầu xóa dữ liệu theo chính sách của hệ thống Hệ thống chỉ thực
                hiện chỉnh sửa hoặc xóa dữ liệu khi có yêu cầu hợp lệ hoặc phục
                vụ mục đích kỹ thuật.
              </p>
            </article>

            <article className="space-y-4 relative">
              <span className="absolute -left-5 top-3 w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Thông tin chi tiết chúng tôi thu thập
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Hệ thống có thể thu thập các loại dữ liệu sau:
              </p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {collectedDataItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-[15px] text-slate-600 leading-8">
                Các dữ liệu này được sử dụng để:
              </p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {dataUsageItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <article className="space-y-4 relative">
              <span className="absolute -left-7 top-2 w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Cung cấp dữ liệu cá nhân của bạn
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Chúng tôi không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba.
              </p>
              <p className="text-[15px] text-slate-600 leading-8">
                Dữ liệu chỉ có thể được sử dụng trong các trường hợp:
              </p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {dataSharingCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-[15px] text-slate-600 leading-8">
                Trong một số trường hợp đặc biệt (bảo mật, lỗi hệ thống), dữ
                liệu có thể được truy cập bởi quản trị viên hệ thống.
              </p>
            </article>

            <article className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                Chính sách bảo mật nội bộ hệ thống
              </h3>
              <p className="text-[15px] text-slate-600 leading-8">
                Hệ thống áp dụng các biện pháp bảo mật nhằm đảm bảo an toàn dữ
                liệu:
              </p>
              <ul className="space-y-2 text-[15px] text-slate-600 leading-8 list-disc list-inside marker:text-slate-400">
                {securityMeasures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-[15px] text-slate-600 leading-8">
                Dữ liệu người dùng được lưu trữ trong thời gian cần thiết cho
                mục đích nghiên cứu và có thể được xóa theo yêu cầu hoặc chính
                sách hệ thống.
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
