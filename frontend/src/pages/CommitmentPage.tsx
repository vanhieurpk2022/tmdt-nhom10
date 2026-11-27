import React, { useEffect, useMemo, useState } from "react";

type PolicySection = {
    id: string;
    number: string;
    title: string;
    content: React.ReactNode;
};

const sections: PolicySection[] = [
    {
        id: "muc-dich",
        number: "01",
        title: "Mục đích và phạm vi áp dụng",
        content: (
            <>
                <p>
                    Văn bản này quy định trách nhiệm và cam kết của Nhà máy/Nhà bán hàng
                    (sau đây gọi là <strong>Nhà bán hàng</strong>) đối với tính chính xác,
                    trung thực, đầy đủ và hợp pháp của các thông tin sản phẩm được đăng tải,
                    giới thiệu và kinh doanh trên nền tảng thương mại điện tử Oilia.
                </p>
                <p>
                    Khi đăng tải, chỉnh sửa hoặc tiếp tục kinh doanh sản phẩm trên Oilia,
                    Nhà bán hàng có trách nhiệm bảo đảm rằng toàn bộ thông tin cung cấp cho
                    nền tảng và người tiêu dùng là chính xác, có căn cứ và phù hợp với quy
                    định pháp luật Việt Nam.
                </p>
                <p>
                    Cam kết này áp dụng cho tất cả thông tin liên quan đến sản phẩm, bao
                    gồm nhưng không giới hạn ở tên sản phẩm, hình ảnh, mô tả, thành phần,
                    công dụng, nguồn gốc, xuất xứ, giá bán, quy cách đóng gói, hướng dẫn sử
                    dụng, cảnh báo an toàn và các tài liệu chứng minh liên quan.
                </p>
            </>
        ),
    },
    {
        id: "thong-tin",
        number: "02",
        title: "Cam kết về tính chính xác của thông tin sản phẩm",
        content: (
            <>
                <p>Nhà bán hàng cam kết:</p>
                <h3>2.1. Tên và mô tả sản phẩm</h3>
                <ul>
                    <li>Tên sản phẩm phải phản ánh đúng bản chất, chủng loại và đặc điểm thực tế của hàng hóa.</li>
                    <li>Mô tả sản phẩm phải rõ ràng, đầy đủ, không gây hiểu nhầm hoặc khiến người tiêu dùng nhận thức sai về sản phẩm.</li>
                    <li>Không sử dụng tên gọi, hình ảnh, nội dung hoặc cách trình bày nhằm giả mạo thương hiệu, gây nhầm lẫn về nhà sản xuất hoặc đánh lừa người tiêu dùng.</li>
                    <li>Không cung cấp thông tin sai lệch về chất lượng, đặc tính, hiệu quả hoặc khả năng sử dụng của sản phẩm.</li>
                </ul>
                <h3>2.2. Thành phần và đặc tính sản phẩm</h3>
                <p>Nhà bán hàng có trách nhiệm cung cấp thông tin thành phần phù hợp với bản chất và hồ sơ thực tế của sản phẩm.</p>
                <p>Đối với sản phẩm tinh dầu, cần thể hiện chính xác các thông tin có liên quan, chẳng hạn:</p>
                <ul>
                    <li>Tên loại tinh dầu hoặc nguyên liệu chính.</li>
                    <li>Thành phần cấu tạo hoặc thành phần công thức theo yêu cầu áp dụng cho từng loại sản phẩm.</li>
                    <li>Tỷ lệ pha trộn hoặc nồng độ thành phần khi cần thiết để mô tả chính xác sản phẩm.</li>
                    <li>Dung tích, khối lượng và quy cách đóng gói.</li>
                    <li>Các chất phụ gia, chất nền hoặc thành phần bổ sung nếu có.</li>
                    <li>Những thông tin cần thiết khác để người tiêu dùng hiểu đúng về sản phẩm.</li>
                </ul>
                <p>Nhà bán hàng không được tự ý thay đổi thành phần, công thức hoặc đặc tính sản phẩm so với thông tin đã công bố mà không cập nhật lại thông tin liên quan và thực hiện các thủ tục pháp lý cần thiết.</p>
                <h3>2.3. Nguồn gốc và xuất xứ</h3>
                <p>Nhà bán hàng cam kết cung cấp thông tin trung thực về:</p>
                <ul>
                    <li>Tên và địa chỉ của tổ chức, cá nhân sản xuất hoặc chịu trách nhiệm về sản phẩm theo quy định áp dụng.</li>
                    <li>Nguồn nguyên liệu và xuất xứ hàng hóa khi có thông tin hoặc thuộc trường hợp phải thể hiện.</li>
                    <li>Quốc gia sản xuất, nơi sản xuất hoặc thông tin xuất xứ theo quy định về nhãn hàng hóa.</li>
                    <li>Các giấy tờ, chứng từ liên quan để chứng minh nguồn gốc sản phẩm khi được yêu cầu.</li>
                </ul>
                <p>Không được sử dụng các cụm từ như “nhập khẩu chính hãng”, “sản xuất tại Việt Nam”, “nguyên liệu hữu cơ”, “100% thiên nhiên” hoặc nội dung tương tự nếu không có căn cứ phù hợp để chứng minh.</p>
                <h3>2.4. Hình ảnh và tài liệu sản phẩm</h3>
                <ul>
                    <li>Hình ảnh đăng tải phải phản ánh đúng sản phẩm thực tế được bán.</li>
                    <li>Không sử dụng hình ảnh sản phẩm khác để minh họa gây nhầm lẫn về bao bì, nhãn hiệu, dung tích, thành phần hoặc quy cách sản phẩm.</li>
                    <li>Không chỉnh sửa hình ảnh theo hướng làm sai lệch màu sắc, kích thước, đặc điểm hoặc tình trạng thực tế của sản phẩm.</li>
                    <li>Nhà bán hàng phải có quyền sử dụng hợp pháp đối với hình ảnh, video, nhãn hiệu và tài liệu được cung cấp.</li>
                </ul>
            </>
        ),
    },
    {
        id: "cong-dung",
        number: "03",
        title: "Cam kết về công dụng và nội dung quảng cáo",
        content: (
            <>
                <p>Nhà bán hàng cam kết mọi thông tin về công dụng, tính năng và lợi ích của sản phẩm đều có căn cứ phù hợp, không phóng đại hoặc gây hiểu nhầm cho người tiêu dùng.</p>
                <p>Cụ thể:</p>
                <ul>
                    <li>Chỉ mô tả công dụng phù hợp với bản chất, phân loại và hồ sơ pháp lý của sản phẩm.</li>
                    <li>Không tự ý khẳng định sản phẩm có khả năng điều trị, chữa khỏi hoặc phòng ngừa bệnh khi không được pháp luật cho phép.</li>
                    <li>Không sử dụng các nội dung quảng cáo gây hiểu nhầm rằng sản phẩm có tác dụng như thuốc chữa bệnh.</li>
                    <li>Không đưa ra cam kết tuyệt đối về hiệu quả sử dụng khi không có tài liệu chứng minh hợp pháp.</li>
                    <li>Không sử dụng các cụm từ mang tính khẳng định vượt trội như “tốt nhất”, “số một”, “duy nhất” nếu không có tài liệu hợp pháp chứng minh theo quy định.</li>
                    <li>Không sử dụng thông tin quảng cáo sai lệch về chất lượng, giá bán, nguồn gốc, xuất xứ hoặc đặc tính sản phẩm.</li>
                </ul>
                <div className="policy-callout">
                    <div className="policy-callout-icon">!</div>
                    <div>
                        <strong>Lưu ý đối với tinh dầu và mỹ phẩm</strong>
                        <p>Nhà bán hàng phải phân biệt rõ sản phẩm tinh dầu dùng để khuếch tán hương thơm, sản phẩm dùng làm nguyên liệu, sản phẩm dùng ngoài da và sản phẩm được phân loại là mỹ phẩm.</p>
                        <p>Không được mặc nhiên xem mọi sản phẩm tinh dầu là mỹ phẩm. Việc xác định nghĩa vụ công bố, ghi nhãn và quảng cáo phải căn cứ vào mục đích sử dụng, bản chất và phân loại thực tế của từng sản phẩm.</p>
                        <p>Đối với mỹ phẩm, Nhà bán hàng phải bảo đảm công dụng và nội dung quảng cáo phù hợp với hồ sơ công bố, tài liệu chứng minh tính an toàn và hiệu quả, cũng như quy định quản lý mỹ phẩm hiện hành.</p>
                    </div>
                </div>
            </>
        ),
    },
    {
        id: "nhan-hang",
        number: "04",
        title: "Cam kết về nhãn hàng hóa và điều kiện lưu thông",
        content: (
            <>
                <p>Nhà bán hàng chịu trách nhiệm bảo đảm sản phẩm đáp ứng các yêu cầu pháp luật về chất lượng, an toàn, ghi nhãn và điều kiện lưu thông tương ứng với từng loại hàng hóa.</p>
                <p>Tùy thuộc vào loại sản phẩm, Nhà bán hàng phải bảo đảm:</p>
                <ul>
                    <li>Hàng hóa có nhãn đúng quy định, thể hiện trung thực và rõ ràng các nội dung bắt buộc.</li>
                    <li>Thông tin trên nhãn phù hợp với thông tin được đăng tải trên Oilia.</li>
                    <li>Có hướng dẫn sử dụng, hướng dẫn bảo quản và cảnh báo cần thiết khi pháp luật hoặc đặc tính sản phẩm yêu cầu.</li>
                    <li>Sản phẩm có nguồn gốc hợp pháp, không thuộc danh mục hàng hóa bị cấm kinh doanh hoặc bị cấm lưu thông.</li>
                    <li>Sản phẩm đáp ứng các điều kiện về công bố, chứng nhận, kiểm nghiệm, hợp quy hoặc giấy phép chuyên ngành nếu thuộc trường hợp phải thực hiện.</li>
                </ul>
                <div className="policy-subcallout">
                    <strong>Đối với sản phẩm mỹ phẩm</strong>
                    <p>Nhà bán hàng cam kết sản phẩm mỹ phẩm được đưa ra lưu thông đáp ứng các yêu cầu về công bố sản phẩm mỹ phẩm và các quy định quản lý mỹ phẩm hiện hành.</p>
                    <p>Thông tin trên trang sản phẩm phải thống nhất với hồ sơ công bố và nhãn sản phẩm. Nhà bán hàng phải cung cấp số tiếp nhận Phiếu công bố sản phẩm mỹ phẩm và các tài liệu liên quan khi thuộc trường hợp áp dụng hoặc khi Oilia có yêu cầu kiểm tra.</p>
                </div>
            </>
        ),
    },
    {
        id: "an-toan",
        number: "05",
        title: "Cam kết về an toàn sản phẩm và hướng dẫn sử dụng",
        content: (
            <>
                <p>Nhà bán hàng chịu trách nhiệm cung cấp thông tin cần thiết để người tiêu dùng nhận biết và sử dụng sản phẩm đúng cách.</p>
                <p>Tùy theo đặc tính sản phẩm, thông tin cần thể hiện có thể bao gồm:</p>
                <ul>
                    <li>Hướng dẫn sử dụng và liều lượng hoặc lượng sử dụng phù hợp.</li>
                    <li>Điều kiện bảo quản.</li>
                    <li>Đối tượng hoặc trường hợp cần thận trọng khi sử dụng.</li>
                    <li>Cảnh báo nguy cơ kích ứng, dị ứng hoặc các rủi ro có liên quan.</li>
                    <li>Khuyến cáo tránh tiếp xúc với mắt, da hoặc những khu vực nhạy cảm nếu phù hợp với sản phẩm.</li>
                    <li>Hướng dẫn xử lý khi xảy ra sự cố trong quá trình sử dụng, nếu cần thiết.</li>
                </ul>
                <p>Nhà bán hàng không được che giấu thông tin về nguy cơ hoặc đặc tính có thể ảnh hưởng đến sức khỏe và sự an toàn của người tiêu dùng.</p>
            </>
        ),
    },
    {
        id: "giay-to",
        number: "06",
        title: "Cam kết về giấy tờ và tài liệu chứng minh",
        content: (
            <>
                <p>Nhà bán hàng cam kết có đầy đủ giấy tờ, hồ sơ hoặc tài liệu hợp pháp cần thiết để chứng minh thông tin đã cung cấp và điều kiện kinh doanh sản phẩm.</p>
                <p>Tùy theo loại sản phẩm, Oilia có thể yêu cầu Nhà bán hàng cung cấp:</p>
                <ul>
                    <li>Giấy chứng nhận đăng ký doanh nghiệp hoặc giấy tờ pháp lý tương đương.</li>
                    <li>Tài liệu chứng minh nguồn gốc, xuất xứ hàng hóa.</li>
                    <li>Hồ sơ công bố sản phẩm mỹ phẩm (nếu thuộc trường hợp áp dụng).</li>
                    <li>Tài liệu về thành phần, công thức và đặc tính sản phẩm.</li>
                    <li>Phiếu kiểm nghiệm hoặc tài liệu chứng minh chất lượng, an toàn khi pháp luật yêu cầu hoặc khi cần thiết để xác minh thông tin.</li>
                    <li>Giấy phép, chứng nhận hoặc tài liệu chuyên ngành khác theo quy định.</li>
                </ul>
                <p>Nhà bán hàng cam kết không cung cấp giấy tờ giả mạo, chỉnh sửa trái phép hoặc tài liệu không có giá trị chứng minh.</p>
            </>
        ),
    },
    {
        id: "cap-nhat",
        number: "07",
        title: "Trách nhiệm cập nhật thông tin",
        content: (
            <>
                <p>Nhà bán hàng có trách nhiệm chủ động kiểm tra và cập nhật thông tin sản phẩm khi có thay đổi liên quan đến:</p>
                <ul>
                    <li>Thành phần, công thức hoặc quy trình sản xuất.</li>
                    <li>Tên gọi, thương hiệu, bao bì hoặc quy cách đóng gói.</li>
                    <li>Nguồn gốc, xuất xứ hoặc đơn vị sản xuất.</li>
                    <li>Công dụng, hướng dẫn sử dụng hoặc cảnh báo an toàn.</li>
                    <li>Giá bán và các thông tin thương mại khác.</li>
                    <li>Hồ sơ pháp lý, giấy phép hoặc tình trạng lưu hành sản phẩm.</li>
                </ul>
                <p>Khi phát hiện thông tin đã đăng tải không còn chính xác hoặc không phù hợp với quy định pháp luật, Nhà bán hàng phải chủ động thông báo và thực hiện điều chỉnh trong thời gian sớm nhất.</p>
            </>
        ),
    },
    {
        id: "vi-pham",
        number: "08",
        title: "Trách nhiệm khi có thông tin sai lệch hoặc vi phạm",
        content: (
            <>
                <p>Nếu phát hiện sản phẩm hoặc thông tin sản phẩm có dấu hiệu không chính xác, vi phạm pháp luật hoặc ảnh hưởng đến quyền lợi người tiêu dùng, Nhà bán hàng có trách nhiệm:</p>
                <ol>
                    <li>Chủ động thông báo cho Oilia về vấn đề được phát hiện.</li>
                    <li>Cung cấp thông tin và tài liệu liên quan để phục vụ quá trình xác minh.</li>
                    <li>Nhanh chóng chỉnh sửa, bổ sung hoặc gỡ bỏ thông tin không chính xác.</li>
                    <li>Tạm ngừng kinh doanh hoặc phối hợp thu hồi sản phẩm khi có yêu cầu hợp pháp hoặc khi cần thiết để bảo đảm an toàn cho người tiêu dùng.</li>
                    <li>Phối hợp giải quyết khiếu nại, yêu cầu đổi trả, hoàn tiền và các vấn đề phát sinh theo quy định pháp luật và chính sách áp dụng.</li>
                    <li>Chịu trách nhiệm đối với hành vi vi phạm và thiệt hại phát sinh do lỗi hoặc thông tin sai lệch thuộc trách nhiệm của mình theo quy định pháp luật.</li>
                </ol>
            </>
        ),
    },
    {
        id: "quyen-oilia",
        number: "09",
        title: "Quyền kiểm tra và xử lý của Oilia",
        content: (
            <>
                <p>Trong phạm vi hoạt động của nền tảng và phù hợp với quy định pháp luật, Oilia có quyền:</p>
                <ul>
                    <li>Yêu cầu Nhà bán hàng cung cấp tài liệu để xác minh thông tin sản phẩm.</li>
                    <li>Kiểm tra tính thống nhất giữa thông tin đăng tải và tài liệu do Nhà bán hàng cung cấp.</li>
                    <li>Yêu cầu chỉnh sửa, bổ sung hoặc làm rõ thông tin chưa đầy đủ, chưa chính xác.</li>
                    <li>Tạm ẩn hoặc gỡ bỏ nội dung, sản phẩm có dấu hiệu vi phạm trong thời gian xác minh hoặc theo yêu cầu của cơ quan có thẩm quyền.</li>
                    <li>Tạm ngừng hoặc chấm dứt quyền kinh doanh trên nền tảng đối với trường hợp vi phạm theo quy chế hoạt động và thỏa thuận áp dụng.</li>
                    <li>Phối hợp với cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp.</li>
                </ul>
                <p>Việc kiểm tra hoặc hiển thị sản phẩm trên Oilia không được hiểu là sự xác nhận, chứng nhận hoặc bảo đảm của Oilia về chất lượng, tính an toàn hay tính hợp pháp của sản phẩm thay cho trách nhiệm của Nhà bán hàng và chủ thể chịu trách nhiệm theo quy định pháp luật.</p>
            </>
        ),
    },
    {
        id: "xac-nhan",
        number: "10",
        title: "Xác nhận cam kết",
        content: (
            <>
                <p>Bằng việc đăng tải và kinh doanh sản phẩm trên Oilia, Nhà bán hàng xác nhận rằng:</p>
                <ul>
                    <li>Đã đọc, hiểu và cam kết thực hiện các nội dung nêu tại văn bản này.</li>
                    <li>Các thông tin và tài liệu cung cấp cho Oilia là trung thực, chính xác và có thể kiểm chứng.</li>
                    <li>Sản phẩm được đăng bán có nguồn gốc hợp pháp và đáp ứng các điều kiện kinh doanh tương ứng.</li>
                    <li>Chịu trách nhiệm về tính chính xác, đầy đủ và hợp pháp của thông tin sản phẩm do mình cung cấp.</li>
                    <li>Đồng ý phối hợp với Oilia trong quá trình kiểm tra, xác minh và xử lý các vấn đề phát sinh liên quan đến sản phẩm.</li>
                </ul>
                <p>Cam kết này được áp dụng cùng với Quy chế hoạt động, Chính sách dành cho Nhà bán hàng và các điều khoản liên quan của Oilia. Trường hợp có quy định pháp luật bắt buộc khác với nội dung văn bản này, quy định pháp luật được ưu tiên áp dụng.</p>
            </>
        ),
    },
];

const legalReferences = [
    "Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15 – đặc biệt là quy định về trách nhiệm cung cấp thông tin chính xác, đầy đủ và ghi nhãn trung thực.",
    "Nghị định 43/2017/NĐ-CP về nhãn hàng hóa, được sửa đổi, bổ sung bởi Nghị định 111/2021/NĐ-CP.",
    "Luật Quảng cáo số 16/2012/QH13 và các văn bản sửa đổi, bổ sung, hợp nhất có liên quan.",
    "Nghị định 52/2013/NĐ-CP về thương mại điện tử, được sửa đổi, bổ sung bởi Nghị định 85/2021/NĐ-CP.",
    "Thông tư 06/2011/TT-BYT về quản lý mỹ phẩm và các văn bản sửa đổi, bổ sung, hướng dẫn có liên quan.",
];

export default function CommitmentPage() {
    const [activeSection, setActiveSection] = useState("muc-dich");
    const [showTop, setShowTop] = useState(false);

    const tocItems = useMemo(
        () => [
            ...sections.map(({ id, number, title }) => ({ id, number, title })),
            { id: "can-cu-phap-ly", number: "PL", title: "Căn cứ pháp lý tham chiếu" },
        ],
        []
    );

    useEffect(() => {
        const handleScroll = () => setShowTop(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll, { passive: true });

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) setActiveSection(visible.target.id);
            },
            { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.15, 0.4, 0.7] }
        );

        tocItems.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, [tocItems]);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="oilia-policy-page">
            <style>{styles}</style>

            <div className="policy-hero">
                <div className="policy-hero-inner">
                    <div className="policy-breadcrumb">
                        <span>Oilia</span><span className="breadcrumb-slash">/</span>
                        <span>Chính sách</span><span className="breadcrumb-slash">/</span>
                        <strong>Cam kết thông tin sản phẩm</strong>
                    </div>
                    <div className="policy-hero-content">
                        <div className="policy-hero-copy">
                            <div className="policy-eyebrow"><span className="eyebrow-line" /> QUY ĐỊNH DÀNH CHO NHÀ BÁN HÀNG</div>
                            <h1>Cam kết về thông tin <em>sản phẩm</em></h1>
                            <p className="policy-hero-description">
                                Minh bạch trong từng thông tin. Trung thực trong từng sản phẩm.
                                Cùng xây dựng môi trường kinh doanh đáng tin cậy trên Oilia.
                            </p>
                            <div className="policy-meta">
                                <span><span className="meta-icon">▤</span> Văn bản cam kết</span>
                                <span className="meta-separator" />
                                <span><span className="meta-icon">◷</span> Cập nhật ngày 27/11/2026</span>
                                <span className="meta-separator" />
                                <span><span className="meta-icon">☰</span> 10 điều khoản</span>
                            </div>
                        </div>
                        <div className="policy-hero-art" aria-hidden="true">
                            <div className="hero-orbit orbit-one" />
                            <div className="hero-orbit orbit-two" />
                            <div className="hero-leaf leaf-one">✦</div>
                            <div className="hero-leaf leaf-two">✧</div>
                            <div className="hero-document">
                                <div className="document-seal">O</div>
                                <div className="document-line line-long" />
                                <div className="document-line line-short" />
                                <div className="document-rule" />
                                <div className="document-check">✓</div>
                                <div className="document-line line-mid" />
                                <div className="document-line line-long" />
                                <div className="document-line line-short" />
                            </div>
                            <div className="hero-art-caption">TRUST & TRANSPARENCY</div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="policy-layout">
                <aside className="policy-sidebar">
                    <div className="sidebar-sticky">
                        <div className="sidebar-heading">NỘI DUNG TÀI LIỆU</div>
                        <nav className="policy-toc" aria-label="Mục lục tài liệu">
                            {tocItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`toc-link ${activeSection === item.id ? "active" : ""}`}
                                    onClick={() => scrollTo(item.id)}
                                >
                                    <span className="toc-number">{item.number}</span>
                                    <span>{item.title}</span>
                                </button>
                            ))}
                        </nav>
                        <div className="sidebar-note">
                            <span className="sidebar-note-icon">i</span>
                            <p>Tài liệu nhằm giúp Nhà bán hàng hiểu rõ trách nhiệm khi cung cấp thông tin sản phẩm trên Oilia.</p>
                        </div>
                    </div>
                </aside>

                <article className="policy-document">
                    <div className="document-intro">
                        <div className="document-kicker">OILIA · SELLER POLICY</div>
                        <h2>CAM KẾT VỀ TÍNH CHÍNH XÁC, TRUNG THỰC VÀ TÍNH HỢP PHÁP CỦA THÔNG TIN SẢN PHẨM</h2>
                        <p className="document-subtitle">Áp dụng đối với Nhà máy/Nhà bán hàng hoạt động trên nền tảng thương mại điện tử Oilia</p>
                        <div className="document-date"><span className="date-icon">◷</span> Cập nhật: 27/11/2026</div>
                    </div>

                    <div className="document-divider"><span /><span className="divider-ornament">✦</span><span /></div>

                    {sections.map((section) => (
                        <section className="policy-section" id={section.id} key={section.id}>
                            <div className="section-heading">
                                <span className="section-number">{section.number}</span>
                                <h2>{section.title}</h2>
                            </div>
                            <div className="section-content">{section.content}</div>
                        </section>
                    ))}

                    <section className="policy-section legal-section" id="can-cu-phap-ly">
                        <div className="section-heading">
                            <span className="section-number legal-number">PL</span>
                            <h2>Căn cứ pháp lý tham chiếu</h2>
                        </div>
                        <div className="section-content">
                            <p>Văn bản được xây dựng trên cơ sở tham chiếu các quy định pháp luật Việt Nam có liên quan, bao gồm:</p>
                            <ol className="legal-list">
                                {legalReferences.map((reference, index) => (
                                    <li key={index}><span className="legal-index">{String(index + 1).padStart(2, "0")}</span>{reference}</li>
                                ))}
                            </ol>
                            <div className="policy-disclaimer">
                                <strong>Lưu ý pháp lý</strong>
                                <p>Việc áp dụng từng quy định phụ thuộc vào phân loại, bản chất, mục đích sử dụng và hình thức kinh doanh của sản phẩm. Nhà bán hàng có trách nhiệm chủ động tìm hiểu và tuân thủ các quy định pháp luật chuyên ngành đang có hiệu lực.</p>
                            </div>
                        </div>
                    </section>

                    <div className="policy-closing">
                        <div className="closing-mark">O</div>
                        <div>
                            <strong>OILIA</strong>
                            <p>Minh bạch thông tin, kinh doanh có trách nhiệm.</p>
                        </div>
                        <span className="closing-sparkle">✦</span>
                    </div>

                    <div className="policy-footnote">
                        <span>OILIA · CHÍNH SÁCH NHÀ BÁN HÀNG</span>
                        <span>Phiên bản 1.0 · 27.11.2026</span>
                    </div>
                </article>
            </main>

            <footer className="policy-footer">
                <div className="policy-footer-inner">
                    <span>© {new Date().getFullYear()} Oilia. All rights reserved.</span>
                    <span>Minh bạch để phát triển bền vững.</span>
                </div>
            </footer>

            {showTop && (
                <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Lên đầu trang">
                    ↑
                </button>
            )}
        </div>
    );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

.oilia-policy-page {
  --ink: #24352e;
  --muted: #75827b;
  --green: #456b55;
  --green-dark: #294b39;
  --sage: #eaf0e9;
  --line: #e7ebe6;
  --paper: #fff;
  min-height: 100vh;
  background: #f7f8f5;
  color: var(--ink);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  line-height: 1.8;
}
.oilia-policy-page * { box-sizing: border-box; }
.oilia-policy-page button, .oilia-policy-page a { font: inherit; }
.policy-topbar { height: 72px; background: #fff; border-bottom: 1px solid #edf0eb; }
.policy-topbar-inner { max-width: 1240px; height: 100%; margin: auto; padding: 0 28px; display: flex; align-items: center; }
.policy-brand { display: inline-flex; align-items: center; gap: 10px; color: #2c4938; text-decoration: none; font-size: 25px; font-weight: 700; letter-spacing: -1.5px; }
.policy-brand-mark { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 11px 11px 11px 3px; background: #456b55; color: #fff; font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; }
.brand-dot { color: #9caf8e; }
.policy-topbar-label { display: flex; align-items: center; gap: 17px; margin-left: 27px; color: #7b877f; font-size: 12px; font-weight: 600; letter-spacing: .3px; }
.topbar-divider { width: 1px; height: 23px; background: #e4e9e3; }
.policy-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 9px; color: #718078; font-size: 11px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #83a88a; box-shadow: 0 0 0 4px #edf4ed; }
.policy-hero { position: relative; overflow: hidden; background: #eaf0e9; }
.policy-hero:before { content: ''; position: absolute; width: 620px; height: 620px; border: 1px solid rgba(79,111,86,.09); border-radius: 50%; right: -180px; top: -360px; }
.policy-hero-inner { max-width: 1240px; margin: auto; padding: 25px 28px 43px; position: relative; }
.policy-breadcrumb { display: flex; flex-wrap: wrap; gap: 11px; align-items: center; color: #87938a; font-size: 11px; }
.policy-breadcrumb strong { color: #496451; font-weight: 600; }
.breadcrumb-slash { color: #b0bcb1; }
.policy-hero-content { min-height: 260px; display: flex; align-items: center; justify-content: space-between; }
.policy-hero-copy { max-width: 680px; padding: 33px 0 14px; }
.policy-eyebrow { display: flex; align-items: center; gap: 10px; color: #62806a; font-size: 10px; font-weight: 700; letter-spacing: 2px; }
.eyebrow-line { width: 25px; height: 1px; background: #78927b; }
.policy-hero h1 { margin: 15px 0 12px; color: #294635; font-family: 'Playfair Display', serif; font-size: clamp(35px, 4.5vw, 53px); font-weight: 600; line-height: 1.16; letter-spacing: -.9px; }
.policy-hero h1 em { color: #779278; font-weight: 500; }
.policy-hero-description { max-width: 565px; margin: 0; color: #65766a; font-size: 14px; line-height: 1.85; }
.policy-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 25px; color: #718074; font-size: 11px; font-weight: 500; }
.policy-meta > span:not(.meta-separator) { display: inline-flex; align-items: center; gap: 7px; }
.meta-icon { color: #6f8b72; font-size: 14px; }
.meta-separator { width: 3px; height: 3px; border-radius: 50%; background: #a6b3a6; }
.policy-hero-art { position: relative; width: 260px; height: 240px; margin-right: 65px; display: grid; place-items: center; }
.hero-orbit { position: absolute; border: 1px solid rgba(97,128,99,.18); border-radius: 50%; }
.orbit-one { width: 220px; height: 220px; }
.orbit-two { width: 175px; height: 175px; border-style: dashed; }
.hero-document { position: relative; width: 124px; height: 160px; padding: 20px 17px; background: #fff; border: 1px solid #e3e9e1; border-radius: 8px; box-shadow: 0 18px 40px rgba(47,75,53,.13); transform: rotate(5deg); }
.document-seal { width: 26px; height: 26px; margin: 0 auto 15px; display: grid; place-items: center; border-radius: 50%; background: #eaf0e9; color: #527357; font-family: 'Playfair Display', serif; font-size: 16px; }
.document-line { height: 4px; margin: 7px 0; border-radius: 5px; background: #e8ede7; }
.line-long { width: 100%; }.line-short { width: 56%; }.line-mid { width: 76%; }
.document-rule { height: 1px; margin: 13px 0 9px; background: #e9eee8; }
.document-check { position: absolute; right: 13px; bottom: 21px; width: 23px; height: 23px; display: grid; place-items: center; border: 1px solid #94b094; border-radius: 50%; color: #638768; font-size: 13px; }
.hero-leaf { position: absolute; color: #8fa58b; }.leaf-one { left: 18px; top: 47px; font-size: 24px; }.leaf-two { right: 12px; bottom: 48px; font-size: 29px; }
.hero-art-caption { position: absolute; bottom: -1px; color: #8a9c8b; font-size: 8px; font-weight: 700; letter-spacing: 2.5px; }
.policy-layout { max-width: 1240px; margin: 0 auto; padding: 54px 28px 80px; display: grid; grid-template-columns: 245px minmax(0, 1fr); gap: 55px; align-items: start; }
.policy-sidebar { min-width: 0; }
.sidebar-sticky { position: sticky; top: 28px; }
.sidebar-heading { margin: 2px 0 17px 13px; color: #9aa49b; font-size: 9px; font-weight: 700; letter-spacing: 1.7px; }
.policy-toc { display: flex; flex-direction: column; gap: 3px; }
.toc-link { width: 100%; min-height: 42px; padding: 8px 11px; display: flex; align-items: center; gap: 11px; border: 0; border-radius: 6px; background: transparent; color: #7a867d; text-align: left; font-size: 11px; line-height: 1.45; cursor: pointer; transition: .2s ease; }
.toc-link:hover { background: #eef2ec; color: #385a42; }
.toc-link.active { background: #e9efe8; color: #34543d; font-weight: 700; }
.toc-number { flex: 0 0 23px; color: #a0ada0; font-size: 9px; font-weight: 700; letter-spacing: .5px; }
.toc-link.active .toc-number { color: #5d8062; }
.sidebar-note { margin: 28px 5px 0; padding: 15px 14px; display: flex; align-items: flex-start; gap: 10px; border: 1px solid #e6ebe4; border-radius: 7px; background: rgba(255,255,255,.55); }
.sidebar-note-icon { flex: 0 0 17px; width: 17px; height: 17px; display: grid; place-items: center; border-radius: 50%; background: #e6eee4; color: #66816a; font-family: Georgia,serif; font-size: 11px; font-weight: 700; }
.sidebar-note p { margin: 0; color: #8a958b; font-size: 10px; line-height: 1.7; }
.policy-document { min-width: 0; padding: 49px 58px 39px; border: 1px solid #ecefea; border-radius: 8px; background: #fff; box-shadow: 0 8px 30px rgba(40,59,44,.035); }
.document-intro { text-align: center; }
.document-kicker { color: #829782; font-size: 9px; font-weight: 700; letter-spacing: 2.3px; }
.document-intro h2 { max-width: 690px; margin: 17px auto 13px; color: #2d4735; font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; line-height: 1.45; letter-spacing: .1px; }
.document-subtitle { margin: 0; color: #758078; font-size: 12px; }
.document-date { margin-top: 13px; color: #9aa49b; font-size: 10px; }
.date-icon { margin-right: 5px; color: #809781; }
.document-divider { display: flex; align-items: center; gap: 13px; margin: 34px 0 39px; }
.document-divider > span:not(.divider-ornament) { height: 1px; flex: 1; background: #e9eee8; }
.divider-ornament { color: #9caf98; font-size: 13px; }
.policy-section { scroll-margin-top: 28px; margin: 0 0 38px; }
.section-heading { display: flex; align-items: center; gap: 14px; margin-bottom: 17px; padding-bottom: 13px; border-bottom: 1px solid #edf0eb; }
.section-number { flex: 0 0 33px; width: 33px; height: 33px; display: grid; place-items: center; border-radius: 50%; background: #edf2eb; color: #5d7b60; font-size: 10px; font-weight: 700; letter-spacing: .4px; }
.section-heading h2 { margin: 0; color: #344d3a; font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 600; line-height: 1.4; }
.section-content { color: #59665d; font-size: 12.5px; line-height: 1.95; }
.section-content p { margin: 0 0 13px; }
.section-content strong { color: #3c5542; font-weight: 700; }
.section-content h3 { margin: 23px 0 9px; color: #425d48; font-size: 13px; font-weight: 700; }
.section-content ul, .section-content ol { margin: 8px 0 16px; padding-left: 22px; }
.section-content li { margin: 5px 0; padding-left: 3px; }
.section-content li::marker { color: #8da18b; }
.policy-callout { display: flex; gap: 13px; margin: 22px 0 5px; padding: 17px 18px; border: 1px solid #e6ede3; border-left: 3px solid #8da68a; border-radius: 5px; background: #f7f9f5; }
.policy-callout-icon { flex: 0 0 22px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: #e5eee2; color: #688468; font-family: Georgia,serif; font-weight: 700; }
.policy-callout p { margin: 7px 0 0; }
.policy-subcallout { margin: 20px 0 5px; padding: 16px 18px; border-radius: 5px; background: #f6f8f4; }
.policy-subcallout p { margin: 7px 0 0; }
.legal-section { margin-top: 10px; }
.legal-number { border-radius: 8px; }
.legal-list { list-style: none; padding: 0 !important; }
.legal-list li { display: flex; align-items: flex-start; gap: 12px; margin: 12px 0; padding: 0; }
.legal-index { flex: 0 0 24px; color: #8ba08b; font-size: 10px; font-weight: 700; }
.policy-disclaimer { margin-top: 22px; padding: 16px 18px; border: 1px solid #ecefe9; border-radius: 5px; background: #fafbf9; }
.policy-disclaimer strong { display: block; margin-bottom: 5px; color: #607b62; font-size: 11px; }
.policy-disclaimer p { margin: 0; color: #7b877d; font-size: 11px; }
.policy-closing { position: relative; display: flex; align-items: center; gap: 13px; margin-top: 50px; padding: 22px 0 7px; border-top: 1px solid #e9eee8; }
.closing-mark { width: 37px; height: 37px; display: grid; place-items: center; border-radius: 12px 12px 12px 3px; background: #456b55; color: white; font-family: 'Playfair Display',serif; font-size: 22px; }
.policy-closing strong { color: #405b45; font-size: 12px; letter-spacing: 1.5px; }
.policy-closing p { margin: 0; color: #8b968c; font-size: 10px; }
.closing-sparkle { margin-left: auto; color: #a5b59f; font-size: 22px; }
.policy-footnote { display: flex; justify-content: space-between; gap: 15px; margin-top: 34px; padding-top: 14px; border-top: 1px solid #f0f2ee; color: #a5ada5; font-size: 8px; letter-spacing: 1px; }
.policy-footer { border-top: 1px solid #e9ede7; background: #fff; }
.policy-footer-inner { max-width: 1240px; margin: auto; padding: 19px 28px; display: flex; justify-content: space-between; gap: 20px; color: #9aa49b; font-size: 10px; }
.back-to-top { position: fixed; right: 28px; bottom: 28px; z-index: 20; width: 42px; height: 42px; border: 1px solid #dfe7dc; border-radius: 50%; background: #fff; color: #527257; font-size: 20px; box-shadow: 0 5px 20px rgba(38,63,43,.1); cursor: pointer; transition: .2s; }
.back-to-top:hover { transform: translateY(-3px); background: #edf3eb; }
@media (max-width: 900px) {
  .policy-layout { grid-template-columns: 200px minmax(0,1fr); gap: 28px; }
  .policy-document { padding: 38px 34px; }
  .policy-hero-art { margin-right: 5px; transform: scale(.85); }
}
@media (max-width: 680px) {
  .policy-topbar { height: 62px; }
  .policy-topbar-inner { padding: 0 18px; }
  .policy-brand { font-size: 22px; }
  .policy-topbar-label { margin-left: 15px; gap: 12px; font-size: 10px; }
  .policy-topbar-right { display: none; }
  .policy-hero-inner { padding: 20px 20px 30px; }
  .policy-hero-content { min-height: auto; }
  .policy-hero-copy { padding: 32px 0 10px; }
  .policy-hero h1 { font-size: 37px; }
  .policy-hero-description { font-size: 12px; }
  .policy-hero-art { display: none; }
  .policy-meta { gap: 9px 12px; font-size: 10px; }
  .policy-layout { display: block; padding: 25px 14px 45px; }
  .policy-sidebar { margin-bottom: 18px; }
  .sidebar-sticky { position: static; }
  .sidebar-heading { margin-left: 4px; margin-bottom: 9px; }
  .policy-toc { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 5px; }
  .toc-link { min-height: 39px; padding: 7px 8px; font-size: 10px; }
  .toc-number { flex-basis: 19px; }
  .sidebar-note { display: none; }
  .policy-document { padding: 30px 21px 27px; border-radius: 6px; }
  .document-intro h2 { font-size: 19px; }
  .document-subtitle { font-size: 10px; }
  .document-divider { margin: 27px 0 31px; }
  .section-heading { gap: 10px; }
  .section-heading h2 { font-size: 16px; }
  .section-number { flex-basis: 29px; width: 29px; height: 29px; font-size: 9px; }
  .section-content { font-size: 12px; }
  .policy-footnote { flex-direction: column; gap: 5px; }
  .policy-footer-inner { padding: 16px 18px; flex-direction: column; gap: 4px; }
  .back-to-top { right: 15px; bottom: 15px; }
}
`;

