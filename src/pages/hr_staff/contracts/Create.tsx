import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, UserCheck, Building2, DollarSign, Save, AlertCircle, CheckCircle, Upload, Search, FileCheck, Clock, StickyNote } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { partnerContractService, type PartnerContractPayload, type PartnerContract } from '../../../services/PartnerContract';
import { partnerService, type Partner } from '../../../services/Partner';
import { talentService, type Talent } from '../../../services/Talent';
import { uploadFile } from '../../../utils/firebaseStorage';

export default function CreatePartnerContractPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fileError, setFileError] = useState('');
    const [partners, setPartners] = useState<Partner[]>([]);
    const [talents, setTalents] = useState<Talent[]>([]);
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [existingContracts, setExistingContracts] = useState<{ contractNumber: string }[]>([]);
    const [allContracts, setAllContracts] = useState<PartnerContract[]>([]);
    const [filteredTalentIds, setFilteredTalentIds] = useState<number[]>([]);
    const [partnerSearch, setPartnerSearch] = useState<string>('');
    const [talentSearch, setTalentSearch] = useState<string>('');
    const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
    const [isTalentDropdownOpen, setIsTalentDropdownOpen] = useState(false);

    const [form, setForm] = useState<PartnerContractPayload>({
        partnerId: 0,
        talentId: 0,
        talentApplicationId: undefined,
        devRate: undefined,
        rateType: '', // Giữ lại để tương thích với backend, nhưng không hiển thị trong UI
        standardHoursPerMonth: 160,
        contractNumber: '',
        status: 'Draft',
        startDate: '',
        endDate: undefined,
        contractFileUrl: undefined,
        notes: undefined,
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partnersData, talentsData, contractsData] = await Promise.all([
                    partnerService.getAll(),
                    talentService.getAll({ excludeDeleted: true }),
                    partnerContractService.getAll({ excludeDeleted: true })
                ]);

                setPartners(partnersData);
                setTalents(talentsData);
                
                // Lưu danh sách mã hợp đồng hiện có để kiểm tra trùng
                const contracts = Array.isArray(contractsData) ? contractsData : (contractsData?.items || []);
                const contractsArray = contracts as PartnerContract[];
                setAllContracts(contractsArray);
                setExistingContracts(contractsArray.map((c: PartnerContract) => ({ 
                    contractNumber: (c.contractNumber || '').toUpperCase() 
                })));

                // Pre-fill form từ query params nếu có
                const partnerIdParam = searchParams.get('partnerId');
                const talentIdParam = searchParams.get('talentId');
                const talentApplicationIdParam = searchParams.get('talentApplicationId');
                
                if (partnerIdParam && talentIdParam) {
                    const partnerId = parseInt(partnerIdParam, 10);
                    const talentId = parseInt(talentIdParam, 10);
                    const talentApplicationId = talentApplicationIdParam
                        ? parseInt(talentApplicationIdParam, 10)
                        : undefined;
                    
                    // Kiểm tra partner và talent có tồn tại không
                    const partnerExists = partnersData.some((p: Partner) => p.id === partnerId);
                    const talentExists = talentsData.some((t: Talent) => t.id === talentId);
                    
                    if (partnerExists && talentExists) {
                        setForm(prev => ({
                            ...prev,
                            partnerId: partnerId,
                            talentId: talentId,
                            talentApplicationId: talentApplicationId,
                        }));
                    }
                }
            } catch (err) {
                console.error("❌ Lỗi tải dữ liệu:", err);
                setError("Không thể tải danh sách đối tác và nhân sự");
            }
        };
        fetchData();
    }, [searchParams]);

    // Lọc nhân sự theo đối tác được chọn và loại bỏ những talent đã có hợp đồng (trừ Rejected)
    useEffect(() => {
        if (form.partnerId) {
            // Lọc nhân sự: có currentPartnerId = partnerId đã chọn và status = "Working"
            let filtered = talents
                .filter(talent => 
                    talent.currentPartnerId === form.partnerId && 
                    talent.status === "Working"
                );

            // Lọc bỏ những talent đã có hợp đồng (trừ trạng thái Rejected)
            filtered = filtered.filter(talent => {
                // Tìm hợp đồng của talent này
                const talentContracts = allContracts.filter(c => c.talentId === talent.id);
                
                if (talentContracts.length === 0) {
                    // Chưa có hợp đồng nào, cho phép hiển thị
                    return true;
                }
                
                // Lấy hợp đồng mới nhất
                const latestContract = talentContracts.sort((a, b) => {
                    const dateA = new Date(a.startDate).getTime();
                    const dateB = new Date(b.startDate).getTime();
                    return dateB - dateA;
                })[0];
                
                // Chỉ hiển thị nếu hợp đồng ở trạng thái Rejected
                return latestContract.status === 'Rejected';
            });
            
            const filteredIds = filtered.map(talent => talent.id);
            setFilteredTalentIds(filteredIds);
            
            // Reset talentId nếu talent hiện tại không còn trong danh sách
            if (form.talentId && !filteredIds.includes(form.talentId)) {
                setForm(prev => ({ ...prev, talentId: 0 }));
            }
        } else {
            // Nếu chưa chọn đối tác, không hiển thị nhân sự nào
            setFilteredTalentIds([]);
            setForm(prev => ({ ...prev, talentId: 0 }));
        }
    }, [form.partnerId, form.talentId, talents, allContracts, searchParams]);

    // Filtered lists for search
    const filteredPartners = partners.filter(partner =>
        !partnerSearch || partner.companyName.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const filteredTalents = talents.filter(talent =>
        filteredTalentIds.includes(talent.id) &&
        (!talentSearch || 
         talent.fullName.toLowerCase().includes(talentSearch.toLowerCase()) ||
         talent.email.toLowerCase().includes(talentSearch.toLowerCase()))
    );

    // Helper function để format số tiền
    const formatCurrency = (value: string | number | undefined): string => {
        if (!value && value !== 0) return "";
        const numValue = typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value;
        if (isNaN(numValue)) return "";
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Xử lý đặc biệt cho devRate - format số tiền
        if (name === 'devRate') {
            // Chỉ cho phép nhập số (loại bỏ tất cả ký tự không phải số)
            const cleaned = value.replace(/\D/g, "");
            // Nếu rỗng, set về undefined
            if (cleaned === "") {
                setForm(prev => ({ ...prev, [name]: undefined }));
                return;
            }
            // Parse và lưu số vào state
            const numValue = parseInt(cleaned, 10);
            if (!isNaN(numValue)) {
                setForm(prev => ({ ...prev, [name]: numValue }));
            }
            return;
        }

        // Xử lý số cho talentApplicationId và standardHoursPerMonth
        if (name === 'talentApplicationId' || name === 'standardHoursPerMonth') {
            const numValue = value ? Number(value) : undefined;
            setForm(prev => ({ ...prev, [name]: numValue }));
            return;
        }
        
        setForm(prev => ({
            ...prev,
            [name]: name === 'partnerId' || name === 'talentId'
                ? (value ? Number(value) : undefined)
                : name === 'contractNumber'
                ? value.toUpperCase() // Tự động chuyển thành chữ hoa khi nhập
                : value === '' && (name === 'endDate' || name === 'contractFileUrl' || name === 'talentApplicationId' || name === 'notes')
                ? undefined
                : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 10 * 1024 * 1024) {
            setContractFile(file);
            setFileError('');
            setError('');
        } else {
            setContractFile(null);
            setFileError('❌ File quá lớn (tối đa 10MB)');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Xác nhận trước khi tạo
        const confirmed = window.confirm("Bạn có chắc chắn muốn tạo hợp đồng nhân sự mới không?");
        if (!confirmed) {
            return;
        }
        
        setLoading(true);
        setError('');
        setFileError('');
        setSuccess(false);

        try {
            // Validate required fields
            if (!form.partnerId || !form.talentId || !form.contractNumber || !form.startDate || !form.standardHoursPerMonth) {
                setError("Vui lòng điền đầy đủ các trường bắt buộc");
                setLoading(false);
                return;
            }

            // Chuyển mã hợp đồng thành chữ hoa và kiểm tra trùng
            const contractNumberUpper = form.contractNumber.trim().toUpperCase();
            if (!contractNumberUpper) {
                setError("Mã hợp đồng không được để trống");
                setLoading(false);
                return;
            }

            // Kiểm tra mã hợp đồng có trùng không
            const isDuplicate = existingContracts.some(
                contract => contract.contractNumber === contractNumberUpper
            );
            if (isDuplicate) {
                setError(`Mã hợp đồng "${contractNumberUpper}" đã tồn tại. Vui lòng sử dụng mã khác.`);
                setLoading(false);
                return;
            }

            const selectedTalent = talents.find(talent => talent.id === form.talentId);
            if (!selectedTalent) {
                setError("Không tìm thấy thông tin nhân sự đã chọn");
                setLoading(false);
                return;
            }

            // Kiểm tra talent có đang làm việc với đối tác này không
            if (selectedTalent.currentPartnerId !== form.partnerId || selectedTalent.status !== "Working") {
                setError("Nhân sự này không đang làm việc với đối tác đã chọn hoặc không ở trạng thái 'Đang làm việc'.");
                setLoading(false);
                return;
            }

            if (form.endDate) {
                const start = new Date(form.startDate);
                const end = new Date(form.endDate);

                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                    setError("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ");
                    setLoading(false);
                    return;
                }

                if (end <= start) {
                    setError("Ngày kết thúc phải sau ngày bắt đầu.");
                    setLoading(false);
                    return;
                }
            }

            if (!contractFile) {
                setFileError('⚠️ Vui lòng chọn file hợp đồng');
                setLoading(false);
                return;
            }

            // Upload contract file
            const fileUrl = await uploadFile(contractFile, `partner-contracts/${contractNumberUpper}-${Date.now()}`);

            const payload: PartnerContractPayload = {
                ...form,
                contractNumber: contractNumberUpper, // Đảm bảo gửi lên BE là chữ hoa
                status: 'Draft', // Luôn tạo với trạng thái Draft
                contractFileUrl: fileUrl,
                rateType: form.rateType || 'Fixed', // Giá trị mặc định nếu backend yêu cầu
                standardHoursPerMonth: form.standardHoursPerMonth || 160,
                talentApplicationId: form.talentApplicationId || undefined,
                notes: form.notes || undefined,
            };

            await partnerContractService.create(payload);
            // Không gửi thông báo ngay - chỉ tạo bản nháp
            // Việc gửi yêu cầu duyệt (chuyển sang pending và gửi thông báo) sẽ thực hiện ở bước riêng
            setSuccess(true);
            setContractFile(null);
            
            // Nếu có applicationId trong query params, quay lại trang application detail
            const applicationId = searchParams.get('applicationId');
            setTimeout(() => {
                if (applicationId) {
                    navigate(`/hr/applications/${applicationId}`);
                } else {
                    navigate("/hr/contracts");
                }
            }, 1500);
        } catch (err: unknown) {
            console.error("❌ Lỗi tạo hợp đồng:", err);
            setError(err instanceof Error ? err.message : "Không thể tạo hợp đồng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            to="/hr/contracts"
                            className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-medium">Quay lại danh sách</span>
                        </Link>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo Hợp Đồng Nhân Sự Mới</h1>
                        <p className="text-neutral-600">Thêm hợp đồng nhân sự mới vào hệ thống</p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-700 font-medium">Tạo hợp đồng thành công! Đang chuyển hướng...</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
                        <div className="p-6 border-b border-neutral-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Thông tin hợp đồng</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mã hợp đồng */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Mã hợp đồng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contractNumber"
                                        value={form.contractNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        placeholder="VD: PCTR-2025-010"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Đối tác */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Đối tác <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsPartnerDropdownOpen(prev => !prev)}
                                            className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl bg-white text-left focus:border-primary-500 focus:ring-primary-500"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-neutral-700">
                                                <Building2 className="w-4 h-4 text-neutral-400" />
                                                <span>
                                                    {form.partnerId
                                                        ? partners.find(p => p.id === form.partnerId)?.companyName || "Chọn đối tác"
                                                        : "Chọn đối tác"}
                                                </span>
                                            </div>
                                            <span className="text-neutral-400 text-xs uppercase">Chọn</span>
                                        </button>
                                        {isPartnerDropdownOpen && (
                                            <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                                                <div className="p-3 border-b border-neutral-100">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                                        <input
                                                            type="text"
                                                            value={partnerSearch}
                                                            onChange={(e) => setPartnerSearch(e.target.value)}
                                                            placeholder="Tìm đối tác..."
                                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-56 overflow-y-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setForm(prev => ({ ...prev, partnerId: 0, talentId: 0 }));
                                                            setPartnerSearch("");
                                                            setIsPartnerDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm ${
                                                            !form.partnerId
                                                                ? "bg-primary-50 text-primary-700"
                                                                : "hover:bg-neutral-50 text-neutral-700"
                                                        }`}
                                                    >
                                                        Chọn đối tác
                                                    </button>
                                                    {filteredPartners.length === 0 ? (
                                                        <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy đối tác phù hợp</p>
                                                    ) : (
                                                        filteredPartners.map(partner => (
                                                            <button
                                                                type="button"
                                                                key={partner.id}
                                                                onClick={() => {
                                                                    setForm(prev => ({ ...prev, partnerId: partner.id, talentId: 0 }));
                                                                    setPartnerSearch("");
                                                                    setIsPartnerDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm ${
                                                                    form.partnerId === partner.id
                                                                        ? "bg-primary-50 text-primary-700"
                                                                        : "hover:bg-neutral-50 text-neutral-700"
                                                                }`}
                                                            >
                                                                {partner.companyName}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Nhân sự */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        Nhân sự <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => form.partnerId && setIsTalentDropdownOpen(prev => !prev)}
                                            disabled={!form.partnerId}
                                            className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl bg-white text-left focus:border-primary-500 focus:ring-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-neutral-700">
                                                <UserCheck className="w-4 h-4 text-neutral-400" />
                                                <span>
                                                    {form.talentId
                                                        ? talents.find(t => t.id === form.talentId)?.fullName || "Chọn nhân sự"
                                                        : "Chọn nhân sự"}
                                                </span>
                                            </div>
                                            <span className="text-neutral-400 text-xs uppercase">Chọn</span>
                                        </button>
                                        {isTalentDropdownOpen && form.partnerId && (
                                            <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                                                <div className="p-3 border-b border-neutral-100">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                                        <input
                                                            type="text"
                                                            value={talentSearch}
                                                            onChange={(e) => setTalentSearch(e.target.value)}
                                                            placeholder="Tìm nhân sự..."
                                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-56 overflow-y-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setForm(prev => ({ ...prev, talentId: 0 }));
                                                            setTalentSearch("");
                                                            setIsTalentDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm ${
                                                            !form.talentId
                                                                ? "bg-primary-50 text-primary-700"
                                                                : "hover:bg-neutral-50 text-neutral-700"
                                                        }`}
                                                    >
                                                        Chọn nhân sự
                                                    </button>
                                                    {filteredTalents.length === 0 ? (
                                                        <p className="px-4 py-3 text-sm text-neutral-500">
                                                            {filteredTalentIds.length === 0
                                                                ? "Không có nhân sự nào đang làm việc với đối tác này"
                                                                : "Không tìm thấy nhân sự phù hợp"}
                                                        </p>
                                                    ) : (
                                                        filteredTalents.map(talent => (
                                                            <button
                                                                type="button"
                                                                key={talent.id}
                                                                onClick={() => {
                                                                    setForm(prev => ({ ...prev, talentId: talent.id }));
                                                                    setTalentSearch("");
                                                                    setIsTalentDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm ${
                                                                    form.talentId === talent.id
                                                                        ? "bg-primary-50 text-primary-700"
                                                                        : "hover:bg-neutral-50 text-neutral-700"
                                                                }`}
                                                            >
                                                                {talent.fullName} ({talent.email})
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!form.partnerId && (
                                        <p className="text-xs text-neutral-500 mt-2">Vui lòng chọn đối tác trước</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mức Lương nhân sự */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Mức Lương nhân sự <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="devRate"
                                            value={form.devRate ? formatCurrency(form.devRate) : ''}
                                            onChange={handleChange}
                                            placeholder="VD: 5.000.000"
                                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 pr-12 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                                            VNĐ
                                        </span>
                                    </div>
                                    {form.devRate && (
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Số tiền: {formatCurrency(form.devRate)} VNĐ
                                        </p>
                                    )}
                                </div>

                                {/* Số giờ tiêu chuẩn/tháng */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Số giờ tiêu chuẩn/tháng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="standardHoursPerMonth"
                                        value={form.standardHoursPerMonth || 160}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        max="744"
                                        step="1"
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        placeholder="160"
                                    />
                                    <p className="text-xs text-neutral-500 mt-2">
                                        Số giờ làm việc tiêu chuẩn mỗi tháng (mặc định: 160 giờ)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Đơn ứng tuyển */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <FileCheck className="w-4 h-4" />
                                        Đơn ứng tuyển
                                    </label>
                                    <input
                                        type="number"
                                        name="talentApplicationId"
                                        value={form.talentApplicationId || ""}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        placeholder="Nhập ID đơn ứng tuyển (tùy chọn)"
                                    />
                                    <p className="text-xs text-neutral-500 mt-2">
                                        ID đơn ứng tuyển liên quan đến hợp đồng này (nếu có)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ngày bắt đầu */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        // min={minStartDate}
                                        max={form.endDate || undefined}
                                    />
                                </div>

                                {/* Ngày kết thúc */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={form.endDate || ''}
                                        onChange={handleChange}
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        min={form.startDate || undefined}
                                    />
                                    <p className="text-xs text-neutral-500 mt-2">Để trống nếu hợp đồng không có thời hạn</p>
                                </div>
                            </div>

                            {/* Ghi chú */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                    <StickyNote className="w-4 h-4" />
                                    Ghi chú
                                </label>
                                <textarea
                                    name="notes"
                                    value={form.notes || ""}
                                    onChange={handleChange}
                                    rows={4}
                                    maxLength={4000}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                                    placeholder="Nhập ghi chú về hợp đồng (tùy chọn, tối đa 4000 ký tự)"
                                />
                                <p className="text-xs text-neutral-500 mt-2">
                                    {(form.notes || "").length}/4000 ký tự
                                </p>
                            </div>

                            {/* Upload File Hợp Đồng */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Upload File Hợp Đồng <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-500 transition-all duration-300 cursor-pointer bg-neutral-50 hover:bg-primary-50">
                                    {contractFile ? (
                                        <div className="flex flex-col items-center text-primary-700">
                                            <FileText className="w-8 h-8 mb-2" />
                                            <p className="font-medium">{contractFile.name}</p>
                                            <p className="text-sm text-neutral-600">{(contractFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setContractFile(null);
                                                    setFileError('');
                                                }}
                                                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                                            >
                                                Xóa file
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center text-neutral-500 cursor-pointer">
                                            <Upload className="w-12 h-12 mb-4" />
                                            <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file vào đây</span>
                                            <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                {fileError && (
                                    <p className="mt-2 text-sm text-red-600">{fileError}</p>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            to="/hr/contracts"
                            className="px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 font-medium transition-all duration-300"
                        >
                            Hủy
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Đang tạo...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                    <span>Tạo hợp đồng</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

