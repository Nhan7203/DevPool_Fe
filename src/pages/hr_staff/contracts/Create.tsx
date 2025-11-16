import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, UserCheck, Building2, DollarSign, Save, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { partnerContractService, type PartnerContractPayload } from '../../../services/PartnerContract';
import { partnerService, type Partner } from '../../../services/Partner';
import { talentService, type Talent } from '../../../services/Talent';
import { talentApplicationService, type TalentApplication } from '../../../services/TalentApplication';
import { talentCVService, type TalentCV } from '../../../services/TalentCV';
import { uploadFile } from '../../../utils/firebaseStorage';

export default function CreatePartnerContractPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fileError, setFileError] = useState('');
    const [partners, setPartners] = useState<Partner[]>([]);
    const [talents, setTalents] = useState<Talent[]>([]);
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [eligibleTalentIds, setEligibleTalentIds] = useState<number[]>([]);
    const [talentHireDates, setTalentHireDates] = useState<Record<number, string>>({});
    const [existingContracts, setExistingContracts] = useState<{ contractNumber: string }[]>([]);

    const [form, setForm] = useState<PartnerContractPayload>({
        partnerId: 0,
        talentId: 0,
        devRate: undefined,
        rateType: '',
        contractNumber: '',
        status: 'Draft',
        startDate: '',
        endDate: undefined,
        contractFileUrl: undefined,
    });

    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partnersData, talentsData, hiredApplications, talentCVs, contractsData] = await Promise.all([
                    partnerService.getAll(),
                    talentService.getAll({ excludeDeleted: true }),
                    talentApplicationService.getAll({ excludeDeleted: true }),
                    talentCVService.getAll({ excludeDeleted: true }),
                    partnerContractService.getAll({ excludeDeleted: true })
                ]);

                const cvTalentMap = new Map<number, number>();
                (talentCVs as TalentCV[]).forEach(cv => {
                    cvTalentMap.set(cv.id, cv.talentId);
                });

                const hiredTalentSet = new Set<number>();
                const talentHireDateMap: Record<number, string> = {};

                (hiredApplications as TalentApplication[])
                    .filter(app => app.status === 'Hired')
                    .forEach(app => {
                        const talentId = cvTalentMap.get(app.cvId);
                        if (!talentId) return;

                        hiredTalentSet.add(talentId);

                        const hireDate = app.updatedAt ?? app.createdAt;
                        if (!hireDate) return;

                        const existing = talentHireDateMap[talentId];
                        if (!existing || new Date(hireDate).getTime() < new Date(existing).getTime()) {
                            talentHireDateMap[talentId] = hireDate;
                        }
                    });

                setPartners(partnersData);
                setTalents(talentsData);
                setEligibleTalentIds(Array.from(hiredTalentSet));
                setTalentHireDates(talentHireDateMap);
                
                // Lưu danh sách mã hợp đồng hiện có để kiểm tra trùng
                const contracts = Array.isArray(contractsData) ? contractsData : (contractsData?.items || []);
                setExistingContracts(contracts.map((c: any) => ({ 
                    contractNumber: (c.contractNumber || '').toUpperCase() 
                })));
            } catch (err) {
                console.error("❌ Lỗi tải dữ liệu:", err);
                setError("Không thể tải danh sách đối tác và nhân sự");
            }
        };
        fetchData();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'partnerId' || name === 'talentId' || name === 'devRate'
                ? (value ? Number(value) : undefined)
                : name === 'contractNumber'
                ? value.toUpperCase() // Tự động chuyển thành chữ hoa khi nhập
                : value === '' && (name === 'endDate' || name === 'devRate' || name === 'contractFileUrl')
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
        const confirmed = window.confirm("Bạn có chắc chắn muốn tạo hợp đồng đối tác mới không?");
        if (!confirmed) {
            return;
        }
        
        setLoading(true);
        setError('');
        setFileError('');
        setSuccess(false);

        try {
            // Validate required fields
            if (!form.partnerId || !form.talentId || !form.contractNumber || !form.rateType || !form.startDate) {
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

            if (!eligibleTalentIds.includes(selectedTalent.id)) {
                setError("Talent chưa có hồ sơ ứng tuyển ở trạng thái Đã tuyển, không thể tạo hợp đồng.");
                setLoading(false);
                return;
            }

            const talentHireDate = talentHireDates[selectedTalent.id];
            if (talentHireDate) {
                const hireDateValue = new Date(talentHireDate);
                const startDateValue = new Date(form.startDate);
                if (!Number.isNaN(hireDateValue.getTime()) && !Number.isNaN(startDateValue.getTime())) {
                    if (startDateValue <= hireDateValue) {
                        setError("Ngày bắt đầu hợp đồng phải sau ngày được tuyển dụng.");
                        setLoading(false);
                        return;
                    }
                }
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
            };

            await partnerContractService.create(payload);
            // Không gửi thông báo ngay - chỉ tạo bản nháp
            // Việc gửi yêu cầu duyệt (chuyển sang pending và gửi thông báo) sẽ thực hiện ở bước riêng
            setSuccess(true);
            setContractFile(null);
            setTimeout(() => {
                navigate("/hr/contracts");
            }, 1500);
        } catch (err: any) {
            console.error("❌ Lỗi tạo hợp đồng:", err);
            setError(err.message || "Không thể tạo hợp đồng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const selectedTalentHireDate = form.talentId ? talentHireDates[form.talentId] : undefined;
    const minStartDate = selectedTalentHireDate ? (() => {
        const date = new Date(selectedTalentHireDate);
        if (Number.isNaN(date.getTime())) return undefined;
        date.setDate(date.getDate() + 1);
        return formatDateForInput(date);
    })() : undefined;

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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo Hợp Đồng Đối Tác Mới</h1>
                        <p className="text-neutral-600">Thêm hợp đồng đối tác mới vào hệ thống</p>
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

                                {/* Hình thức tính lương */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Hình thức tính lương <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="rateType"
                                        value={form.rateType}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                    >
                                        <option value="">-- Chọn hình thức tính lương --</option>
                                        <option value="Hourly">Theo giờ</option>
                                        <option value="Daily">Theo ngày</option>
                                        <option value="Monthly">Theo tháng</option>
                                        <option value="Fixed">Cố định</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Đối tác */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Đối tác <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="partnerId"
                                        value={form.partnerId || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                    >
                                        <option value="">-- Chọn đối tác --</option>
                                        {partners.map(partner => (
                                            <option key={partner.id} value={partner.id}>
                                                {partner.companyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Nhân sự */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        Nhân sự <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="talentId"
                                        value={form.talentId || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                    >
                                        <option value="">-- Chọn nhân sự --</option>
                                        {eligibleTalentIds.length === 0 && (
                                            <option disabled value="">
                                                Không có nhân sự nào có hồ sơ ứng tuyển ở trạng thái Đã tuyển
                                            </option>
                                        )}
                                        {talents
                                            .filter(talent => eligibleTalentIds.includes(talent.id))
                                            .map(talent => (
                                                <option key={talent.id} value={talent.id}>
                                                    {talent.fullName} ({talent.email})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                {/* Mức Lương nhân sự */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Mức Lương nhân sự (VND) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="devRate"
                                        value={form.devRate || ''}
                                        onChange={handleChange}
                                        min="0"
                                        step="1000"
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        placeholder="VD: 50000000"
                                    />
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

