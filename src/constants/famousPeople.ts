export interface FamousPerson {
  id: string;
  name: string;
  title: string;
  category: Category;
  years: string;
  description: string;
}

export type Category =
  | 'history'
  | 'kings'
  | 'business'
  | 'education'
  | 'military'
  | 'culture';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'history', label: 'Lịch sử' },
  { value: 'kings', label: 'Vua – Hoàng đế' },
  { value: 'business', label: 'Kinh doanh – Thương nhân' },
  { value: 'education', label: 'Giáo dục – Trí thức' },
  { value: 'military', label: 'Quân sự – Danh tướng' },
  { value: 'culture', label: 'Văn hóa – Nghệ thuật' },
];

// 6 danh nhân đại diện cho Landing Page
export const FAMOUS_PEOPLE: FamousPerson[] = [
  {
    id: 'ho-chi-minh',
    name: 'Hồ Chí Minh',
    title: 'Anh hùng giải phóng dân tộc, Danh nhân văn hóa thế giới',
    category: 'history',
    years: '1890 – 1969',
    description:
      'Người sáng lập nước Việt Nam Dân chủ Cộng hòa, được UNESCO vinh danh là Anh hùng giải phóng dân tộc.',
  },
  {
    id: 'ly-thai-to',
    name: 'Lý Thái Tổ',
    title: 'Người sáng lập nhà Lý',
    category: 'kings',
    years: '974 – 1028',
    description:
      'Dời đô từ Hoa Lư về Thăng Long năm 1010, mở ra kỷ nguyên thịnh trị của văn minh Đại Việt.',
  },
  {
    id: 'bach-thai-buoi',
    name: 'Bạch Thái Bưởi',
    title: 'Vua tàu thủy Việt Nam',
    category: 'business',
    years: '1874 – 1932',
    description:
      'Nhà tư sản dân tộc tiên phong, xây dựng đội tàu thủy cạnh tranh với người Pháp, người Hoa.',
  },
  {
    id: 'chu-van-an',
    name: 'Chu Văn An',
    title: 'Vạn thế sư biểu',
    category: 'education',
    years: '1292 – 1370',
    description:
      'Người thầy của muôn đời, biểu tượng cho đạo học và nhân cách cao quý của dân tộc.',
  },
  {
    id: 'vo-nguyen-giap',
    name: 'Võ Nguyên Giáp',
    title: 'Đại tướng đầu tiên của Việt Nam',
    category: 'military',
    years: '1911 – 2013',
    description:
      'Kiến trúc sư của chiến thắng Điện Biên Phủ, một trong những danh tướng vĩ đại nhất thế kỷ 20.',
  },
  {
    id: 'nguyen-du',
    name: 'Nguyễn Du',
    title: 'Đại thi hào dân tộc',
    category: 'culture',
    years: '1765 – 1820',
    description:
      'Tác giả Truyện Kiều – kiệt tác văn học, được UNESCO vinh danh là Danh nhân văn hóa thế giới.',
  },
];
