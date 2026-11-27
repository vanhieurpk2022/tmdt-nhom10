import { useEffect, useState } from "react";

const LAST_UPDATED = "27/11/2026";

interface PolicySectionMeta {
    id: string;
    title: string;
}

const POLICY_SECTIONS: PolicySectionMeta[] = [
    { id: "dieu-kien", title: "Điều kiện đăng ký" },
    { id: "ho-so", title: "Hồ sơ đăng ký" },
    { id: "quy-trinh", title: "Quy trình xét duyệt" },
    { id: "phan-quyen", title: "Tài khoản & phân quyền" },
    { id: "chat-luong", title: "Tiêu chuẩn sản phẩm" },
    { id: "tai-chinh", title: "Phí & đối soát" },
    { id: "vi-pham", title: "Vi phạm & xử lý" },
    { id: "bao-mat", title: "Bảo mật dữ liệu" },
    { id: "faq", title: "Câu hỏi thường gặp" },
];

interface DocumentItem {
    name: string;
    detail: string;
    level: "required" | "optional" | "recommended";
}

const DOCUMENTS: DocumentItem[] = [
    { name: "Giấy phép đăng ký kinh doanh", detail: "Bản scan hoặc ảnh chụp rõ nét, còn hiệu lực.", level: "required" },
    { name: "Giấy tờ tùy thân người đại diện", detail: "CCCD/CMND mặt trước và mặt sau, thông tin khớp với tài khoản.", level: "required" },
    { name: "Hình ảnh cơ sở sản xuất", detail: "Tối thiểu 3 ảnh: khu sản xuất, kho lưu trữ và khu đóng gói.", level: "required" },
    { name: "Giấy chứng nhận an toàn thực phẩm / PCCC", detail: "Nộp nếu cơ sở đã được cấp theo quy định hiện hành.", level: "optional" },
    { name: "Phiếu kiểm nghiệm hoặc công bố sản phẩm", detail: "Giúp hồ sơ được xem xét thuận lợi hơn và tăng độ tin cậy với khách hàng.", level: "optional" },
    { name: "Logo và mô tả giới thiệu xưởng", detail: "Thông tin hiển thị trên trang gian hàng của xưởng.", level: "recommended" },
];

const DOCUMENT_LEVEL_LABEL: Record<DocumentItem["level"], string> = {
    required: "Bắt buộc",
    optional: "Nếu có",
    recommended: "Khuyến nghị",
};

interface ProcessStep {
    title: string;
    description: string;
    badge: string;
    badgeTone: "neutral" | "pending" | "success";
}

const PROCESS_STEPS: ProcessStep[] = [
    {
        title: "Gửi hồ sơ đăng ký",
        description:
            "Điền biểu mẫu và tải tài liệu lên. Hệ thống tạo xưởng ở trạng thái chờ duyệt và liên kết với tài khoản đăng ký. Tài khoản này trở thành OWNER của xưởng.",
        badge: "PENDING",
        badgeTone: "pending",
    },
    {
        title: "Quản trị viên xem xét",
        description:
            "Quản trị viên đối chiếu thông tin và giấy tờ trong 2–3 ngày làm việc. Nếu hồ sơ thiếu hoặc chưa rõ, đối tác sẽ nhận được yêu cầu bổ sung.",
        badge: "2–3 ngày",
        badgeTone: "neutral",
    },
    {
        title: "Nhận kết quả",
        description:
            "Hồ sơ hợp lệ được kích hoạt. Hồ sơ không đạt sẽ bị từ chối kèm lý do; đối tác có thể chỉnh sửa và nộp lại.",
        badge: "ACTIVE",
        badgeTone: "success",
    },
    {
        title: "Bắt đầu hoạt động",
        description: "Đăng sản phẩm, thiết lập gian hàng và mời nhân viên tham gia quản lý xưởng.",
        badge: "Hoạt động",
        badgeTone: "neutral",
    },
];

interface RoleRow {
    capability: string;
    owner: boolean;
    staff: boolean;
}

const ROLE_ROWS: RoleRow[] = [
    { capability: "Chỉnh sửa thông tin và hồ sơ xưởng", owner: true, staff: false },
    { capability: "Thêm hoặc xóa nhân viên", owner: true, staff: false },
    { capability: "Xem doanh thu và đối soát", owner: true, staff: false },
    { capability: "Đăng và chỉnh sửa sản phẩm", owner: true, staff: true },
    { capability: "Xử lý đơn hàng", owner: true, staff: true },
    { capability: "Phản hồi đánh giá của khách hàng", owner: true, staff: true },
];

const ELIGIBILITY = [
    "Là cá nhân hoặc doanh nghiệp có cơ sở sản xuất, chiết xuất hoặc đóng gói tinh dầu thực tế tại Việt Nam.",
    "Có giấy phép kinh doanh hợp lệ (hộ kinh doanh hoặc doanh nghiệp) và còn hiệu lực.",
    "Cơ sở sản xuất đáp ứng các quy định hiện hành về an toàn và phòng cháy chữa cháy.",
    "Người đại diện từ đủ 18 tuổi, cung cấp thông tin định danh chính xác và đầy đủ.",
    "Chưa từng bị Oilia chấm dứt hợp tác do vi phạm nghiêm trọng.",
];

const QUALITY_RULES = [
    "Thông tin sản phẩm trung thực: tên, xuất xứ, nguyên liệu, dung tích và hạn sử dụng phải đúng với thực tế.",
    "Sản phẩm có nhãn mác đầy đủ theo quy định, kèm hướng dẫn sử dụng và cảnh báo an toàn khi cần.",
    "Hình ảnh sản phẩm do xưởng tự chụp hoặc có quyền sử dụng hợp pháp, không sử dụng trái phép hình ảnh của bên khác.",
    "Không đăng bán sản phẩm bị cấm, hàng giả, hàng nhái hoặc hàng không rõ nguồn gốc.",
    "Đóng gói cẩn thận, đảm bảo tinh dầu không rò rỉ trong quá trình vận chuyển.",
];

const FINANCE_ITEMS = [
    { label: "Phí đăng ký", value: "Miễn phí", description: "Không thu phí khi gửi hồ sơ hoặc khi được duyệt." },
    { label: "Phí dịch vụ trên mỗi đơn", value: "5%", description: "Tính trên giá trị sản phẩm của đơn hàng hoàn tất, chưa gồm phí vận chuyển." },
    { label: "Chu kỳ đối soát", value: "Hằng tuần", description: "Doanh thu của các đơn đã giao thành công được đối soát và thanh toán theo tuần." },
];

const VIOLATION_LEVELS = [
    { level: "Mức 1", title: "Nhắc nhở", description: "Áp dụng với lỗi nhẹ như thông tin sản phẩm chưa chính xác. Xưởng cần chỉnh sửa trong thời hạn được yêu cầu." },
    { level: "Mức 2", title: "Tạm khóa", description: "Áp dụng khi tái phạm hoặc có khiếu nại nghiêm trọng. Sản phẩm có thể bị ẩn cho đến khi vấn đề được giải quyết." },
    { level: "Mức 3", title: "Chấm dứt hợp tác", description: "Áp dụng với hàng giả, gian lận hoặc cung cấp hồ sơ giả mạo. Tài khoản xưởng có thể bị vô hiệu hóa vĩnh viễn." },
];

const PRIVACY_RULES = [
    "Giấy tờ và thông tin định danh chỉ được sử dụng để xác minh xưởng, không công khai trên gian hàng.",
    "Chỉ quản trị viên được phân quyền mới có quyền truy cập hồ sơ đăng ký.",
    "Đối tác có thể yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân khi chấm dứt hợp tác, trừ dữ liệu pháp luật yêu cầu lưu trữ.",
    "Oilia không chia sẻ dữ liệu của xưởng cho bên thứ ba khi chưa có sự đồng ý, trừ trường hợp pháp luật yêu cầu.",
];

const FAQS = [
    {
        question: "Hồ sơ của tôi bị từ chối thì có nộp lại được không?",
        answer: "Có. Đối tác có thể chỉnh sửa hồ sơ theo lý do từ chối rồi gửi lại. Hồ sơ sẽ được xem xét theo quy trình xét duyệt của Oilia.",
    },
    {
        question: "Một tài khoản có thể sở hữu nhiều xưởng không?",
        answer: "Mỗi xưởng chỉ có đúng một OWNER. Nếu quản lý nhiều cơ sở, đối tác vui lòng liên hệ bộ phận hỗ trợ để được tư vấn cách thiết lập phù hợp.",
    },
    {
        question: "Tôi có thể đổi OWNER của xưởng không?",
        answer: "Có thể, nhưng cần được quản trị viên xác minh để đảm bảo quyền sở hữu hợp lệ. Tài khoản STAFF không thể tự nâng quyền.",
    },
    {
        question: "Trong lúc chờ duyệt, tôi có đăng sản phẩm được không?",
        answer: "Chưa. Đối tác chỉ có thể đăng bán sau khi xưởng chuyển sang trạng thái đã được duyệt (ACTIVE).",
    },
    {
        question: "Tôi cần hỗ trợ trong lúc điền hồ sơ thì liên hệ ở đâu?",
        answer: "Đối tác có thể gửi yêu cầu qua mục hỗ trợ trên website. Đội ngũ Oilia phản hồi trong giờ hành chính.",
    },
];

function SectionHeading({
    index,
    title,
    summary,
}: {
    index: number;
    title: string;
    summary: string;
}) {
    return (
        <header className="policy-section-heading">
            <span className="policy-section-number">{String(index).padStart(2, "0")}</span>
            <div>
                <h2>{title}</h2>
                <p>{summary}</p>
            </div>
        </header>
    );
}

function CheckIcon({ active }: { active: boolean }) {
    return (
        <span className={`policy-role-mark ${active ? "is-yes" : "is-no"}`} aria-label={active ? "Có quyền" : "Không có quyền"}>
            {active ? "✓" : "—"}
        </span>
    );
}

export default function FactoryPolicyPage() {
    const [activeId, setActiveId] = useState<string>(POLICY_SECTIONS[0].id);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    useEffect(() => {
        const elements = POLICY_SECTIONS
            .map((section) => document.getElementById(section.id))
            .filter((element): element is HTMLElement => element !== null);

        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visibleEntries.length > 0) {
                    setActiveId(visibleEntries[0].target.id);
                }
            },
            { rootMargin: "-18% 0px -68% 0px" },
        );

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
    };

    return (
        <main className="policy-doc-page">
            <style>{`
                .policy-doc-page{min-height:100vh;background:#f5f6f7;color:#252d33;padding:34px 0 70px;font-family:inherit}
                .policy-doc-container{width:min(1400px,calc(100% - 64px));margin:0 auto}
                .policy-doc-header{padding-bottom:26px;border-bottom:1px solid #dfe4e7}
                .policy-breadcrumb{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:34px;color:#929ba2;font-size:12px}
                .policy-breadcrumb strong{color:#4a555e;font-weight:600}
                .policy-doc-label{display:flex;align-items:center;gap:9px;margin-bottom:13px;color:#728078;font-size:10px;font-weight:700;letter-spacing:1.4px}
                .policy-doc-dot{width:7px;height:7px;border-radius:50%;background:#47836a}
                .policy-doc-heading h1{margin:0 0 12px;color:#202a30;font-size:clamp(27px,3vw,38px);font-weight:700;letter-spacing:-.9px;line-height:1.25}
                .policy-doc-heading p{max-width:790px;margin:0;color:#69747d;font-size:14px;line-height:1.85}
                .policy-doc-metadata{display:flex;flex-wrap:wrap;gap:0;margin-top:27px;padding:17px 0;border-top:1px solid #e5e9eb;border-bottom:1px solid #e5e9eb}
                .policy-doc-metadata>div{min-width:170px;padding:0 25px;border-right:1px solid #e5e9eb;display:flex;flex-direction:column;gap:6px}
                .policy-doc-metadata>div:first-child{padding-left:0}
                .policy-doc-metadata>div:last-child{border:0}
                .policy-doc-metadata span{color:#929ba2;font-size:11px}
                .policy-doc-metadata strong{color:#3e4951;font-size:12px;font-weight:600}
                .policy-doc-metadata .policy-doc-status{color:#398063}
                .policy-doc-layout{display:grid;grid-template-columns:245px minmax(0,850px);justify-content:space-between;gap:55px;align-items:start;padding-top:32px}
                .policy-doc-sidebar{position:sticky;top:24px}
                .policy-sidebar-inner{padding-right:18px}
                .policy-sidebar-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}
                .policy-sidebar-title span:first-child{color:#87919a;font-size:10px;font-weight:700;letter-spacing:1px}
                .policy-sidebar-title span:last-child{color:#a1a9af;font-size:10px}
                .policy-doc-sidebar nav{display:flex;flex-direction:column;gap:3px}
                .policy-sidebar-link{display:flex;align-items:center;gap:12px;padding:10px 11px;border-left:2px solid transparent;border-radius:3px;color:#68737c;text-decoration:none;font-size:12px;transition:background .18s,color .18s}
                .policy-sidebar-link>span{color:#a0a8af;font-size:10px;font-variant-numeric:tabular-nums}
                .policy-sidebar-link:hover{background:#eceff0;color:#315b48}
                .policy-sidebar-link.active{border-left-color:#47836a;background:#e9efeb;color:#285d48;font-weight:600}
                .policy-sidebar-link.active>span{color:#47836a}
                .policy-sidebar-note{display:flex;gap:9px;margin-top:24px;padding-top:17px;border-top:1px solid #dfe4e7;color:#89939a}
                .policy-sidebar-note>span{font-size:14px}
                .policy-sidebar-note p{margin:0;font-size:11px;line-height:1.7}
                .policy-doc-content{min-width:0;padding:44px 52px;background:#fff;border:1px solid #e5e9eb;border-radius:4px;box-shadow:0 2px 8px rgba(30,40,50,.025)}
                .policy-document-intro{margin-bottom:8px;padding-bottom:28px;border-bottom:1px solid #e8ecee}
                .policy-document-intro h2{margin:0 0 15px;color:#3d5146;font-size:11px;font-weight:700;letter-spacing:1px}
                .policy-document-intro p{margin:0 0 11px;color:#59656e;font-size:13px;line-height:1.9}
                .policy-document-intro p:last-child{margin-bottom:0}
                .policy-doc-section{padding:33px 0;border-bottom:1px solid #e9edef;scroll-margin-top:28px}
                .policy-section-heading{display:flex;align-items:flex-start;gap:13px;margin-bottom:17px}
                .policy-section-number{flex-shrink:0;padding-top:3px;color:#47836a;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}
                .policy-section-heading h2{margin:0 0 7px;color:#28362f;font-size:19px;font-weight:700;line-height:1.45}
                .policy-section-heading p{margin:0;color:#77818a;font-size:12px;line-height:1.7}
                .policy-clause{margin:0 0 17px;color:#626d76;font-size:13px;line-height:1.9}
                .policy-subheading{margin:23px 0 13px;color:#3b4941;font-size:13px;font-weight:700}
                .policy-legal-list{margin:0;padding-left:24px}
                .policy-legal-list li{margin-bottom:12px;padding-left:5px;color:#515e67;font-size:13px;line-height:1.85}
                .policy-legal-list li:last-child{margin-bottom:0}
                .policy-legal-list li::marker{color:#47836a;font-weight:600}
                .policy-document-table-wrap{width:100%;overflow-x:auto;margin:18px 0;border:1px solid #e7ebed;border-radius:3px}
                .policy-document-table{width:100%;border-collapse:collapse;font-size:12px}
                .policy-document-table th{padding:12px 14px;background:#f6f8f7;border-bottom:1px solid #e3e8e5;color:#53615a;text-align:left;font-weight:700;white-space:nowrap}
                .policy-document-table td{padding:13px 14px;border-bottom:1px solid #edf0f2;color:#626d76;vertical-align:top;line-height:1.7}
                .policy-document-table tbody tr:last-child td{border-bottom:0}
                .policy-document-table td strong{color:#39443e;font-weight:600}
                .policy-document-table td:first-child{color:#89939b;font-variant-numeric:tabular-nums}
                .policy-requirement{display:inline-block;padding:4px 8px;border-radius:3px;font-size:10px;font-weight:600;white-space:nowrap}
                .policy-requirement.required{background:#f8eeec;color:#9c5750}
                .policy-requirement.optional{background:#f6f2e8;color:#81714b}
                .policy-requirement.recommended{background:#edf4ef;color:#46775f}
                .policy-role-table th:not(:first-child),.policy-role-table td:not(:first-child){text-align:center}
                .policy-role-mark{display:inline-block;width:22px;font-size:15px;font-weight:600}
                .policy-role-mark.is-yes{color:#42846a}
                .policy-role-mark.is-no{color:#c3c9ce}
                .policy-legal-note{margin-top:19px;padding:13px 16px;border-left:3px solid #9aab9f;background:#f7f9f7}
                .policy-legal-note strong{display:block;margin-bottom:5px;color:#41594c;font-size:12px}
                .policy-legal-note p{margin:0;color:#69746d;font-size:12px;line-height:1.8}
                .policy-process-list{margin-top:18px}
                .policy-process-item{display:flex;gap:19px;padding:17px 0;border-bottom:1px solid #edf0f1}
                .policy-process-item:last-child{border-bottom:0}
                .policy-process-number{flex-shrink:0;padding-top:2px;color:#47836b;font-size:12px;font-weight:700}
                .policy-process-content{flex:1;min-width:0}
                .policy-process-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}
                .policy-process-heading h3{margin:0;color:#35423b;font-size:13px;font-weight:700}
                .policy-process-content p{margin:7px 0 0;color:#707a83;font-size:12px;line-height:1.8}
                .policy-process-badge{padding:4px 8px;border-radius:3px;background:#f0f2f3;color:#68737c;font-size:10px;white-space:nowrap}
                .policy-process-badge.pending{background:#f7f1e5;color:#9b7941}
                .policy-process-badge.success{background:#eaf3ed;color:#428064}
                .policy-doc-faq{border-top:1px solid #e7eaed}
                .policy-doc-faq-item{border-bottom:1px solid #e7eaed}
                .policy-doc-faq-item button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:16px 0;border:0;background:transparent;color:#46534c;text-align:left;font-size:13px;font-weight:600;cursor:pointer}
                .policy-doc-faq-item button span:last-child{color:#48826a;font-size:18px}
                .policy-doc-faq-item p{margin:0;padding:0 25px 16px 0;color:#737d85;font-size:12px;line-height:1.8}
                .policy-document-footer{padding:33px 0 5px;text-align:center}
                .policy-document-end{display:flex;align-items:center;gap:15px;margin-bottom:13px}
                .policy-document-end span{color:#929ba2;font-size:10px;font-weight:700;letter-spacing:1px;white-space:nowrap}
                .policy-document-end div{flex:1;height:1px;background:#e5e8ea}
                .policy-document-footer>p{margin:0 0 11px;color:#929ba2;font-size:11px}
                .policy-footer-meta{display:flex;justify-content:center;flex-wrap:wrap;gap:7px 18px}
                .policy-footer-meta span{color:#a0a8af;font-size:10px}
                @media(max-width:1050px){.policy-doc-layout{grid-template-columns:210px minmax(0,1fr);gap:28px}.policy-doc-content{padding:35px 30px}}
                @media(max-width:767px){.policy-doc-page{padding:20px 0 45px}.policy-doc-container{width:calc(100% - 24px)}.policy-breadcrumb{margin-bottom:24px}.policy-doc-metadata{display:grid;grid-template-columns:1fr 1fr;row-gap:16px}.policy-doc-metadata>div{min-width:0;padding:0 10px;border:0}.policy-doc-metadata>div:nth-child(odd){padding-left:0}.policy-doc-layout{display:flex;flex-direction:column;gap:17px;padding-top:20px}.policy-doc-sidebar{position:static;width:100%}.policy-sidebar-inner{padding:14px;background:#fff;border:1px solid #e5e9eb;border-radius:4px}.policy-doc-sidebar nav{display:grid;grid-template-columns:1fr 1fr}.policy-sidebar-link{padding:9px 7px;font-size:11px}.policy-sidebar-note{display:none}.policy-doc-content{width:100%;padding:25px 18px}.policy-section-heading h2{font-size:17px}.policy-process-heading{align-items:flex-start}.policy-document-table{min-width:560px}}
                @media(max-width:420px){.policy-doc-sidebar nav{grid-template-columns:1fr}.policy-process-heading{flex-direction:column}}

                /* Đồng bộ bố cục với trang Cam kết thông tin sản phẩm */
                .policy-doc-page{--ink:#24352e;--muted:#75827b;--green:#456b55;--green-dark:#294b39;--sage:#eaf0e9;--line:#e7ebe6;min-height:100vh;padding:0 0 0;background:#f7f8f5;color:var(--ink);font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.8}
                .policy-doc-page *{box-sizing:border-box}
                .factory-policy-hero{position:relative;overflow:hidden;background:#eaf0e9}
                .factory-policy-hero:before{content:'';position:absolute;width:620px;height:620px;border:1px solid rgba(79,111,86,.09);border-radius:50%;right:-180px;top:-360px}
                .factory-policy-hero-inner{position:relative;max-width:1240px;margin:0 auto;padding:25px 28px 43px}
                .policy-doc-page .policy-breadcrumb{display:flex;align-items:center;flex-wrap:wrap;gap:11px;margin:0;color:#87938a;font-size:11px}
                .policy-doc-page .policy-breadcrumb strong{color:#496451;font-weight:600}
                .breadcrumb-slash{color:#b0bcb1}
                .factory-policy-hero-content{min-height:260px;display:flex;align-items:center;justify-content:space-between}
                .factory-policy-hero-copy{max-width:700px;padding:33px 0 14px}
                .policy-doc-page .policy-doc-label{display:flex;align-items:center;gap:10px;margin:0;color:#62806a;font-size:10px;font-weight:700;letter-spacing:2px}
                .policy-doc-page .policy-doc-dot{width:25px;height:1px;border-radius:0;background:#78927b}
                .factory-policy-hero h1{margin:15px 0 12px;color:#294635;font-family:'Playfair Display',Georgia,serif;font-size:clamp(35px,4.5vw,53px);font-weight:600;line-height:1.16;letter-spacing:-.9px}
                .factory-policy-hero h1 em{color:#779278;font-weight:500}
                .factory-policy-hero-copy>p{max-width:590px;margin:0;color:#65766a;font-size:14px;line-height:1.85}
                .factory-policy-meta{display:flex;align-items:center;flex-wrap:wrap;gap:16px;margin-top:25px;color:#718074;font-size:11px}
                .factory-policy-meta span{display:inline-flex;align-items:center;gap:7px}
                .factory-policy-meta b{color:#6f8b72;font-weight:600}
                .factory-policy-meta i{width:3px;height:3px;border-radius:50%;background:#a6b3a6}
                .factory-policy-art{position:relative;width:260px;height:240px;margin-right:65px;display:grid;place-items:center;flex-shrink:0}
                .factory-art-orbit{position:absolute;border:1px solid rgba(97,128,99,.18);border-radius:50%}
                .factory-art-orbit.orbit-a{width:220px;height:220px}.factory-art-orbit.orbit-b{width:175px;height:175px;border-style:dashed}
                .factory-art-sheet{position:relative;width:124px;height:160px;padding:20px 17px;background:#fff;border:1px solid #e3e9e1;border-radius:8px;box-shadow:0 18px 40px rgba(47,75,53,.13);transform:rotate(5deg)}
                .factory-art-seal{width:26px;height:26px;margin:0 auto 15px;display:grid;place-items:center;border-radius:50%;background:#eaf0e9;color:#527357;font-family:'Playfair Display',serif;font-size:16px}
                .factory-art-sheet .art-line{display:block;height:4px;margin:8px 0;border-radius:5px;background:#e8ede7}
                .factory-art-sheet .art-line.long{width:100%}.factory-art-sheet .art-line.short{width:56%}.factory-art-sheet .art-line.medium{width:76%}
                .factory-art-check{position:absolute;right:13px;bottom:19px;width:23px;height:23px;display:grid;place-items:center;border:1px solid #94b094;border-radius:50%;color:#638768;font-size:13px}
                .factory-art-spark{position:absolute;color:#8fa58b}.factory-art-spark.spark-a{left:18px;top:47px;font-size:24px}.factory-art-spark.spark-b{right:12px;bottom:48px;font-size:29px}
                .factory-policy-art small{position:absolute;bottom:-1px;color:#8a9c8b;font-size:8px;font-weight:700;letter-spacing:2.5px}
                .policy-doc-layout{max-width:1240px;margin:0 auto;padding:54px 28px 80px;display:grid;grid-template-columns:245px minmax(0,1fr);gap:55px;align-items:start}
                .policy-doc-sidebar{position:relative;top:auto;min-width:0}
                .policy-sidebar-inner{position:sticky;top:28px;padding:0 0 0 0;border:0;background:transparent}
                .policy-sidebar-title{margin:2px 0 17px 13px}
                .policy-sidebar-title span:first-child{color:#9aa49b;font-size:9px;font-weight:700;letter-spacing:1.7px}
                .policy-sidebar-title span:last-child{color:#a5afa6;font-size:10px}
                .policy-doc-sidebar nav{display:flex;flex-direction:column;gap:3px}
                .policy-sidebar-link{min-height:42px;padding:8px 11px;display:flex;align-items:center;gap:11px;border:0;border-left:0;border-radius:6px;background:transparent;color:#7a867d;font-size:11px;line-height:1.45;transition:.2s ease}
                .policy-sidebar-link:hover{background:#eef2ec;color:#385a42}
                .policy-sidebar-link.active{background:#e9efe8;color:#34543d;font-weight:700}
                .policy-sidebar-link>span{flex:0 0 23px;color:#a0ada0;font-size:9px;font-weight:700}
                .policy-sidebar-link.active>span{color:#5d8062}
                .policy-sidebar-note{margin:28px 5px 0;padding:15px 14px;display:flex;align-items:flex-start;gap:10px;border:1px solid #e6ebe4;border-radius:7px;background:rgba(255,255,255,.55);color:#8a958b}
                .policy-sidebar-note>span{flex:0 0 17px;width:17px;height:17px;display:grid;place-items:center;border-radius:50%;background:#e6eee4;color:#66816a;font-size:11px}
                .policy-sidebar-note p{margin:0;color:#8a958b;font-size:10px;line-height:1.7}
                .policy-doc-content{min-width:0;padding:49px 58px 39px;border:1px solid #ecefea;border-radius:8px;background:#fff;box-shadow:0 8px 30px rgba(40,59,44,.035)}
                .policy-document-intro{margin-bottom:8px;padding-bottom:28px;border-bottom:0;text-align:center}
                .policy-document-intro h2{margin:0 0 17px;color:#829782;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:700;letter-spacing:2.3px}
                .policy-document-intro p{margin:0 0 9px;color:#758078;font-size:12px;line-height:1.85}
                .policy-doc-section{padding:0 0 0;margin:0 0 38px;border:0;scroll-margin-top:28px}
                .policy-section-heading{display:flex;align-items:center;gap:14px;margin-bottom:17px;padding-bottom:13px;border-bottom:1px solid #edf0eb}
                .policy-section-number{flex:0 0 33px;width:33px;height:33px;padding:0;display:grid;place-items:center;border-radius:50%;background:#edf2eb;color:#5d7b60;font-size:10px;letter-spacing:.4px}
                .policy-section-heading h2{margin:0;color:#344d3a;font-family:'Playfair Display',Georgia,serif;font-size:19px;font-weight:600;line-height:1.4}
                .policy-section-heading p{margin:3px 0 0;color:#879188;font-size:11px;line-height:1.65}
                .policy-clause,.policy-legal-list li{color:#59665d;font-size:12.5px;line-height:1.95}
                .policy-clause{margin:0 0 13px}
                .policy-subheading{margin:23px 0 13px;color:#425d48;font-size:13px;font-weight:700}
                .policy-legal-list{margin:8px 0 16px;padding-left:22px}
                .policy-legal-list li{margin:5px 0;padding-left:3px}
                .policy-legal-list li::marker{color:#8da18b}
                .policy-document-table-wrap{margin:18px 0;border:1px solid #e7ece5;border-radius:5px}
                .policy-document-table{font-size:12px}
                .policy-document-table th{padding:12px 14px;background:#f6f8f4;border-bottom:1px solid #e3e8e1;color:#53615a}
                .policy-document-table td{padding:13px 14px;border-bottom:1px solid #edf0eb;color:#626d64;line-height:1.7}
                .policy-document-table td strong{color:#3c5542}
                .policy-requirement{padding:4px 8px;border-radius:4px;font-size:10px}
                .policy-legal-note{margin-top:19px;padding:16px 18px;border:1px solid #e6ede3;border-left:3px solid #8da68a;border-radius:5px;background:#f7f9f5}
                .policy-legal-note strong{color:#3c5542;font-size:11px}
                .policy-legal-note p{color:#69766c;font-size:11px;line-height:1.8}
                .policy-process-list{margin-top:18px}
                .policy-process-item{gap:19px;padding:17px 0;border-color:#edf0eb}
                .policy-process-number{color:#638468}
                .policy-process-heading h3{color:#354d3b}
                .policy-process-content p{color:#707c72;font-size:12px;line-height:1.8}
                .policy-process-badge{border-radius:4px}
                .policy-doc-faq{border-color:#e9eee8}
                .policy-doc-faq-item{border-color:#e9eee8}
                .policy-doc-faq-item button{color:#465b4b;font-size:12.5px}
                .policy-doc-faq-item button span:last-child{color:#638468}
                .policy-doc-faq-item p{color:#707c72;font-size:12px}
                .policy-document-footer{margin-top:48px;padding:22px 0 5px;border-top:1px solid #e9eee8}
                .policy-document-end{margin-bottom:13px}
                .policy-document-end span{color:#829782}
                .policy-document-end div{background:#e5ece3}
                .policy-document-footer>p{color:#8b968c}
                .policy-footer-meta span{color:#a0aaa0}
                @media(max-width:900px){.policy-doc-layout{grid-template-columns:200px minmax(0,1fr);gap:28px}.policy-doc-content{padding:38px 34px}.factory-policy-art{margin-right:5px;transform:scale(.85)}}
                @media(max-width:680px){.factory-policy-hero-inner{padding:20px 20px 30px}.factory-policy-hero-content{min-height:auto}.factory-policy-hero-copy{padding:32px 0 10px}.factory-policy-hero h1{font-size:37px}.factory-policy-hero-copy>p{font-size:12px}.factory-policy-art{display:none}.factory-policy-meta{gap:9px 12px;font-size:10px}.policy-doc-layout{display:flex;flex-direction:column;gap:18px;padding:25px 14px 45px}.policy-doc-sidebar{width:100%;position:static}.policy-sidebar-inner{position:static;padding:14px;border:1px solid #e6ebe4;border-radius:6px;background:rgba(255,255,255,.65)}.policy-sidebar-title{margin:0 0 9px 4px}.policy-doc-sidebar nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.policy-sidebar-link{min-height:39px;padding:7px 8px;font-size:10px}.policy-sidebar-link>span{flex-basis:19px}.policy-sidebar-note{display:none}.policy-doc-content{width:100%;padding:30px 21px 27px;border-radius:6px}.policy-document-intro h2{font-size:9px}.policy-document-intro p{font-size:11px}.policy-section-heading{gap:10px}.policy-section-heading h2{font-size:16px}.policy-section-number{flex-basis:29px;width:29px;height:29px;font-size:9px}.policy-clause,.policy-legal-list li{font-size:12px}.policy-document-table{min-width:560px}.policy-process-heading{align-items:flex-start}.policy-footer-meta{gap:7px 12px}}
                @media(max-width:420px){.policy-doc-sidebar nav{grid-template-columns:1fr}.policy-process-heading{flex-direction:column}}
            `}</style>

            <div className="factory-policy-hero">
                <div className="factory-policy-hero-inner">
                    <div className="policy-breadcrumb">
                        <span>Oilia</span><span className="breadcrumb-slash">/</span>
                        <span>Chính sách</span><span className="breadcrumb-slash">/</span>
                        <strong>Đối tác sản xuất</strong>
                    </div>
                    <div className="factory-policy-hero-content">
                        <div className="factory-policy-hero-copy">
                            <div className="policy-doc-label">
                                <span className="policy-doc-dot" />
                                QUY ĐỊNH DÀNH CHO ĐỐI TÁC SẢN XUẤT
                            </div>
                            <h1>Chính sách dành cho <em>đối tác sản xuất</em></h1>
                            <p>
                                Quy định về điều kiện tham gia, hồ sơ, hoạt động kinh doanh,
                                trách nhiệm và quyền lợi của các xưởng sản xuất trên sàn thương mại điện tử Oilia.
                            </p>
                            <div className="factory-policy-meta">
                                <span><b>▤</b> OL-POL-FACTORY-001</span>
                                <i />
                                <span><b>◷</b> Cập nhật {LAST_UPDATED}</span>
                                <i />
                                <span><b>☰</b> 09 chương</span>
                            </div>
                        </div>
                        <div className="factory-policy-art" aria-hidden="true">
                            <div className="factory-art-orbit orbit-a" />
                            <div className="factory-art-orbit orbit-b" />
                            <div className="factory-art-sheet">
                                <span className="factory-art-seal">O</span>
                                <i className="art-line long" /><i className="art-line short" />
                                <i className="art-line medium" /><i className="art-line long" />
                                <span className="factory-art-check">✓</span>
                            </div>
                            <span className="factory-art-spark spark-a">✦</span>
                            <span className="factory-art-spark spark-b">✧</span>
                            <small>PARTNER POLICY</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="policy-doc-layout">
                <aside className="policy-doc-sidebar" aria-label="Mục lục chính sách">
                    <div className="policy-sidebar-inner">
                        <div className="policy-sidebar-title">
                            <span>NỘI DUNG TÀI LIỆU</span>
                            <span>09 chương</span>
                        </div>
                        <nav>
                            {POLICY_SECTIONS.map((section, index) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className={`policy-sidebar-link${activeId === section.id ? " active" : ""}`}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        scrollToSection(section.id);
                                    }}
                                >
                                    <span>{String(index + 1).padStart(2, "0")}</span>
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                        <div className="policy-sidebar-note">
                            <span aria-hidden="true">ⓘ</span>
                            <p>Tài liệu cung cấp các quy định áp dụng đối với đối tác sản xuất trên nền tảng Oilia.</p>
                        </div>
                    </div>
                </aside>

                <article className="policy-doc-content">
                    <div className="policy-document-intro">
                        <h2>GIỚI THIỆU CHUNG</h2>
                        <p>
                            Chính sách này quy định các điều kiện và nguyên tắc áp dụng đối với cá nhân,
                            tổ chức đăng ký trở thành đối tác sản xuất trên nền tảng Oilia.
                        </p>
                        <p>
                            Đối tác có trách nhiệm tìm hiểu và tuân thủ các quy định trong tài liệu này
                            trong suốt quá trình tham gia và hoạt động trên nền tảng.
                        </p>
                    </div>

                    <section id="dieu-kien" className="policy-doc-section">
                        <SectionHeading index={1} title="Điều kiện đăng ký" summary="Các điều kiện cơ bản mà cá nhân hoặc tổ chức cần đáp ứng khi đăng ký trở thành đối tác sản xuất." />
                        <ol className="policy-legal-list">
                            {ELIGIBILITY.map((item) => <li key={item}>{item}</li>)}
                        </ol>
                    </section>

                    <section id="ho-so" className="policy-doc-section">
                        <SectionHeading index={2} title="Hồ sơ đăng ký" summary="Danh mục tài liệu phục vụ quá trình xác minh thông tin và xét duyệt đối tác." />
                        <p className="policy-clause">Đối tác có trách nhiệm cung cấp các tài liệu phù hợp với tình trạng pháp lý và hoạt động thực tế của cơ sở.</p>
                        <div className="policy-document-table-wrap">
                            <table className="policy-document-table">
                                <thead><tr><th>STT</th><th>Tài liệu</th><th>Yêu cầu</th><th>Ghi chú</th></tr></thead>
                                <tbody>
                                    {DOCUMENTS.map((item, index) => (
                                        <tr key={item.name}>
                                            <td>{String(index + 1).padStart(2, "0")}</td>
                                            <td><strong>{item.name}</strong></td>
                                            <td><span className={`policy-requirement ${item.level}`}>{DOCUMENT_LEVEL_LABEL[item.level]}</span></td>
                                            <td>{item.detail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="policy-legal-note">
                            <strong>Lưu ý về hồ sơ</strong>
                            <p>Tài liệu cung cấp cần rõ ràng, đầy đủ và đảm bảo tính xác thực. Oilia có thể yêu cầu bổ sung nếu thông tin chưa đáp ứng yêu cầu xác minh.</p>
                        </div>
                    </section>

                    <section id="quy-trinh" className="policy-doc-section">
                        <SectionHeading index={3} title="Quy trình xét duyệt" summary="Các bước xử lý hồ sơ từ thời điểm tiếp nhận đến khi xưởng đủ điều kiện hoạt động." />
                        <div className="policy-process-list">
                            {PROCESS_STEPS.map((step, index) => (
                                <div className="policy-process-item" key={step.title}>
                                    <div className="policy-process-number">{String(index + 1).padStart(2, "0")}</div>
                                    <div className="policy-process-content">
                                        <div className="policy-process-heading">
                                            <h3>{step.title}</h3>
                                            <span className={`policy-process-badge ${step.badgeTone}`}>{step.badge}</span>
                                        </div>
                                        <p>{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="phan-quyen" className="policy-doc-section">
                        <SectionHeading index={4} title="Tài khoản và phân quyền" summary="Nguyên tắc tổ chức tài khoản và phạm vi quyền hạn của các thành viên thuộc một xưởng." />
                        <p className="policy-clause">Mỗi xưởng có một tài khoản OWNER chịu trách nhiệm quản lý chung và có thể có nhiều tài khoản STAFF hỗ trợ vận hành.</p>
                        <h3 className="policy-subheading">4.1. Bảng phân quyền</h3>
                        <div className="policy-document-table-wrap">
                            <table className="policy-document-table policy-role-table">
                                <thead><tr><th>Quyền hạn</th><th>OWNER</th><th>STAFF</th></tr></thead>
                                <tbody>
                                    {ROLE_ROWS.map((row) => (
                                        <tr key={row.capability}>
                                            <td>{row.capability}</td>
                                            <td><CheckIcon active={row.owner} /></td>
                                            <td><CheckIcon active={row.staff} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <h3 className="policy-subheading">4.2. Nguyên tắc quản lý</h3>
                        <ol className="policy-legal-list">
                            <li>Tài khoản dùng để gửi hồ sơ đăng ký được thiết lập làm OWNER của xưởng tương ứng.</li>
                            <li>OWNER chịu trách nhiệm quản lý thông tin xưởng và phân quyền cho các tài khoản STAFF.</li>
                            <li>Việc thay đổi OWNER cần được quản trị viên xác minh để đảm bảo quyền sở hữu hợp lệ.</li>
                            <li>STAFF không được tự ý thay đổi quyền sở hữu hoặc nâng quyền tài khoản của mình.</li>
                        </ol>
                    </section>

                    <section id="chat-luong" className="policy-doc-section">
                        <SectionHeading index={5} title="Tiêu chuẩn sản phẩm" summary="Yêu cầu về chất lượng, nguồn gốc và tính minh bạch của sản phẩm được đăng bán trên Oilia." />
                        <ol className="policy-legal-list">
                            {QUALITY_RULES.map((item) => <li key={item}>{item}</li>)}
                        </ol>
                    </section>

                    <section id="tai-chinh" className="policy-doc-section">
                        <SectionHeading index={6} title="Phí và đối soát" summary="Các khoản phí dịch vụ và nguyên tắc đối soát doanh thu áp dụng cho đối tác sản xuất." />
                        <div className="policy-document-table-wrap">
                            <table className="policy-document-table">
                                <thead><tr><th>Khoản mục</th><th>Mức áp dụng</th><th>Điều kiện / mô tả</th></tr></thead>
                                <tbody>
                                    {FINANCE_ITEMS.map((item) => (
                                        <tr key={item.label}>
                                            <td><strong>{item.label}</strong></td><td><strong>{item.value}</strong></td><td>{item.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="policy-legal-note">
                            <strong>Nguyên tắc đối soát</strong>
                            <p>Doanh thu của các đơn hàng đã giao thành công được tổng hợp để đối soát theo chu kỳ. Việc thanh toán thực hiện theo thông tin và quy trình đối soát của nền tảng.</p>
                        </div>
                    </section>

                    <section id="vi-pham" className="policy-doc-section">
                        <SectionHeading index={7} title="Vi phạm và xử lý" summary="Các biện pháp xử lý được cân nhắc tùy theo tính chất, mức độ và tần suất vi phạm." />
                        <div className="policy-document-table-wrap">
                            <table className="policy-document-table">
                                <thead><tr><th>Cấp độ</th><th>Hình thức xử lý</th><th>Trường hợp áp dụng</th></tr></thead>
                                <tbody>
                                    {VIOLATION_LEVELS.map((item) => (
                                        <tr key={item.level}><td><strong>{item.level}</strong></td><td><strong>{item.title}</strong></td><td>{item.description}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="policy-clause">Tùy từng trường hợp, Oilia có thể xem xét mức độ ảnh hưởng, lịch sử hoạt động và mức độ hợp tác khắc phục của đối tác trước khi đưa ra biện pháp xử lý.</p>
                    </section>

                    <section id="bao-mat" className="policy-doc-section">
                        <SectionHeading index={8} title="Bảo mật dữ liệu" summary="Nguyên tắc thu thập, sử dụng, truy cập và bảo vệ thông tin do đối tác cung cấp." />
                        <ol className="policy-legal-list">
                            {PRIVACY_RULES.map((item) => <li key={item}>{item}</li>)}
                        </ol>
                    </section>

                    <section id="faq" className="policy-doc-section">
                        <SectionHeading index={9} title="Câu hỏi thường gặp" summary="Giải đáp một số nội dung phổ biến liên quan đến đăng ký và quản lý xưởng." />
                        <div className="policy-doc-faq">
                            {FAQS.map((faq, index) => {
                                const isOpen = openFaqIndex === index;
                                return (
                                    <div className="policy-doc-faq-item" key={faq.question}>
                                        <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaqIndex(isOpen ? null : index)}>
                                            <span>{faq.question}</span>
                                            <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                                        </button>
                                        {isOpen && <p>{faq.answer}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <footer className="policy-document-footer">
                        <div className="policy-document-end"><span>KẾT THÚC TÀI LIỆU</span><div /></div>
                        <p>Chính sách dành cho đối tác sản xuất trên nền tảng thương mại điện tử Oilia.</p>
                        <div className="policy-footer-meta">
                            <span>Mã tài liệu: OL-POL-FACTORY-001</span>
                            <span>Phiên bản 1.0</span>
                            <span>Cập nhật: {LAST_UPDATED}</span>
                        </div>
                    </footer>
                </article>
            </div>
        </main>
    );
}
