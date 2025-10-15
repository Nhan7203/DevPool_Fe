import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type Project, type ProjectPayload } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { marketService, type Market } from "../../../services/Market";
import { industryService, type Industry } from "../../../services/Industry";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

export default function ProjectEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [company, setCompany] = useState<ClientCompany | null>(null);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<Partial<ProjectPayload>>({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "",
        clientCompanyId: undefined,
        marketId: undefined,
        industryId: undefined,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;

                // Lấy dự án
                const proj = await projectService.getById(Number(id));
                setProject(proj);

                // Lấy công ty
                const comp = await clientCompanyService.getById(proj.clientCompanyId);
                setCompany(comp);

                // Lấy danh sách Market và Industry
                const [mkList, indList] = await Promise.all([
                    marketService.getAll({ excludeDeleted: true }),
                    industryService.getAll({ excludeDeleted: true }),
                ]);
                setMarkets(mkList);
                setIndustries(indList);

                // Gán giá trị mặc định cho form
                setFormData({
                    name: proj.name,
                    description: proj.description ?? "",
                    startDate: formatDate(proj.startDate),
                    endDate: formatDate(proj.endDate),
                    status: proj.status,
                    clientCompanyId: proj.clientCompanyId,
                    marketId: proj.marketId,
                    industryId: proj.industryId,
                });
            } catch (err) {
                console.error("❌ Lỗi tải dữ liệu dự án:", err);
                alert("Không thể tải dữ liệu dự án!");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (!formData.name?.trim()) {
            alert("⚠️ Tên dự án không được để trống!");
            return;
        }
        if (!formData.status) {
            alert("⚠️ Vui lòng chọn trạng thái dự án!");
            return;
        }
        if (!formData.marketId) {
            alert("⚠️ Vui lòng chọn thị trường!");
            return;
        }
        if (!formData.industryId) {
            alert("⚠️ Vui lòng chọn ngành!");
            return;
        }

        const toUTCDateString = (dateStr?: string | null) => {
            if (!dateStr) return null;
            const d = new Date(dateStr + "T00:00:00"); // giả định giờ 00:00
            return d.toISOString(); // => chuỗi UTC
        };

        const payload: ProjectPayload = {
            name: formData.name,
            description: formData.description ?? "",
            startDate: toUTCDateString(formData.startDate) ?? "",
            endDate: toUTCDateString(formData.endDate),
            status: formData.status,
            clientCompanyId: formData.clientCompanyId!,
            marketId: Number(formData.marketId),
            industryId: Number(formData.industryId),
        };

        try {
            await projectService.update(Number(id), payload);
            alert("✅ Cập nhật dự án thành công!");
            navigate(`/sales/projects/${id}`);
        } catch (err) {
            console.error("❌ Lỗi cập nhật dự án:", err);
            alert("Không thể cập nhật dự án!");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-500">
                Đang tải dữ liệu dự án...
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                Không tìm thấy dự án
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Sales Staff" />

            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Chỉnh sửa dự án</h1>
                <p className="text-neutral-600 mb-6">Cập nhật thông tin dự án khách hàng.</p>

                {company && (
                    <div className="mb-4">
                        <span className="font-medium text-gray-700">Công ty Khách hàng: </span>
                        <span className="text-gray-800">{company.name}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Tên dự án */}
                        <div className="col-span-2">
                            <label className="block text-gray-700 font-medium mb-1">Tên dự án</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nhập tên dự án"
                                required
                                className="w-full"
                            />
                        </div>

                        {/* Mô tả */}
                        <div className="col-span-2">
                            <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Nhập mô tả dự án"
                            />
                        </div>

                        {/* Thị trường */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Thị trường</label>
                            <select
                                name="marketId"
                                value={formData.marketId}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                                required
                            >
                                <option value="">-- Chọn thị trường --</option>
                                {markets.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Ngành */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Ngành</label>
                            <select
                                name="industryId"
                                value={formData.industryId}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                                required
                            >
                                <option value="">-- Chọn ngành --</option>
                                {industries.map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Ngày bắt đầu */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Ngày bắt đầu</label>
                            <Input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Ngày kết thúc */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Ngày kết thúc</label>
                            <Input
                                type="date"
                                name="endDate"
                                value={formData.endDate ?? ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                                required
                            >
                                <option value="">-- Chọn trạng thái --</option>
                                <option value="Planned">Đã lên kế hoạch</option>
                                <option value="Ongoing">Đang thực hiện</option>
                                <option value="Completed">Đã hoàn thành</option>
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Link
                            to={`/sales/projects/${id}`}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                        >
                            Hủy
                        </Link>
                        <Button
                            type="submit"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
