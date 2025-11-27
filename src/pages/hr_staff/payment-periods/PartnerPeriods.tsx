import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { partnerPaymentPeriodService } from "../../../services/PartnerPaymentPeriod";
import type { PartnerPaymentPeriod } from "../../../services/PartnerPaymentPeriod";
import { partnerContractPaymentService } from "../../../services/PartnerContractPayment";
import type { PartnerContractPayment } from "../../../services/PartnerContractPayment";
import { partnerService, type Partner } from "../../../services/Partner";
import { partnerContractService, type PartnerContract } from "../../../services/PartnerContract";
import { documentTypeService, type DocumentType } from "../../../services/DocumentType";
import { partnerDocumentService, type PartnerDocumentCreate } from "../../../services/PartnerDocument";
import { talentService, type Talent } from "../../../services/Talent";
import { uploadFile } from "../../../utils/firebaseStorage";
import { decodeJWT } from "../../../services/Auth";
import { useAuth } from "../../../contexts/AuthContext";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { Building2, Calendar, X, FileUp, Upload, Save, AlertCircle, CheckCircle } from "lucide-react";

const HRPartnerPeriods: React.FC = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  
  const [periods, setPeriods] = useState<PartnerPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [payments, setPayments] = useState<PartnerContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');

  // Modal tạo tài liệu
  const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PartnerContractPayment | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [submittingDocument, setSubmittingDocument] = useState(false);
  const [createDocumentError, setCreateDocumentError] = useState<string | null>(null);
  const [createDocumentSuccess, setCreateDocumentSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Maps để lưu contracts và talents
  const [contractsMap, setContractsMap] = useState<Map<number, PartnerContract>>(new Map());
  const [talentsMap, setTalentsMap] = useState<Map<number, Talent>>(new Map());
  
  const [documentFormData, setDocumentFormData] = useState({
    documentTypeId: 0,
    fileName: "",
    filePath: "",
    description: "",
    source: "TA",
    referencedClientDocumentId: 0
  });

  // Lấy danh sách đối tác có hợp đồng
  useEffect(() => {
    const loadPartners = async () => {
      setLoadingPartners(true);
      try {
        const contracts = await partnerContractService.getAll({ excludeDeleted: true });
        const contractsData = contracts?.items ?? contracts ?? [];
        
        const partnerIds = [...new Set(contractsData.map((c: PartnerContract) => c.partnerId))];
        
        const allPartners = await partnerService.getAll();
        const allPartnersData = allPartners?.items ?? allPartners ?? [];
        
        const partnersData = allPartnersData.filter((p: Partner) => partnerIds.includes(p.id));
        
        setPartners(partnersData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPartners(false);
      }
    };
    loadPartners();
  }, []);

  // Khi chọn đối tác, load các period của đối tác đó
  useEffect(() => {
    if (!selectedPartnerId) {
      setPeriods([]);
      return;
    }

    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await partnerPaymentPeriodService.getAll({ 
          partnerId: selectedPartnerId, 
          excludeDeleted: true 
        });
        setPeriods(data?.items ?? data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPeriods(false);
      }
    };
    loadPeriods();
  }, [selectedPartnerId]);

  const onSelectPeriod = async (periodId: number) => {
    setActivePeriodId(periodId);
    setLoadingPayments(true);
    try {
      const [paymentsData, contractsData, talentsData] = await Promise.all([
        partnerContractPaymentService.getAll({ 
          partnerPeriodId: periodId, 
          excludeDeleted: true 
        }),
        partnerContractService.getAll({ excludeDeleted: true }),
        talentService.getAll({ excludeDeleted: true })
      ]);
      
      setPayments(paymentsData?.items ?? paymentsData ?? []);
      
      // Tạo contracts map
      const contracts = contractsData?.items ?? contractsData ?? [];
      const contractMap = new Map<number, PartnerContract>();
      contracts.forEach((c: PartnerContract) => {
        contractMap.set(c.id, c);
      });
      setContractsMap(contractMap);
      
      // Tạo talents map
      const talents = talentsData?.items ?? talentsData ?? [];
      const talentMap = new Map<number, Talent>();
      talents.forEach((t: Talent) => {
        talentMap.set(t.id, t);
      });
      setTalentsMap(talentMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Load document types khi mở modal
  const handleOpenCreateDocumentModal = async (payment: PartnerContractPayment) => {
    setSelectedPayment(payment);
    setShowCreateDocumentModal(true);
    setCreateDocumentError(null);
    setCreateDocumentSuccess(false);
    setFile(null);
    setUploadProgress(0);
    setDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "TA",
      referencedClientDocumentId: 0
    });

    // Load document types, contracts và talents
    setLoadingDocumentTypes(true);
    try {
      const [typesData, contractsData, talentsData] = await Promise.all([
        documentTypeService.getAll({ excludeDeleted: true }),
        partnerContractService.getAll({ excludeDeleted: true }),
        talentService.getAll({ excludeDeleted: true })
      ]);
      
      setDocumentTypes(typesData?.items ?? typesData ?? []);
      
      // Tạo contracts map
      const contracts = contractsData?.items ?? contractsData ?? [];
      const contractMap = new Map<number, PartnerContract>();
      contracts.forEach((c: PartnerContract) => {
        contractMap.set(c.id, c);
      });
      setContractsMap(contractMap);
      
      // Tạo talents map
      const talents = talentsData?.items ?? talentsData ?? [];
      const talentMap = new Map<number, Talent>();
      talents.forEach((t: Talent) => {
        talentMap.set(t.id, t);
      });
      setTalentsMap(talentMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDocumentTypes(false);
    }
  };

  const handleCloseCreateDocumentModal = () => {
    setShowCreateDocumentModal(false);
    setSelectedPayment(null);
    // Giữ lại thông báo thành công/thất bại trong 5 giây để người dùng thấy
    if (createDocumentSuccess) {
      setTimeout(() => {
        setCreateDocumentSuccess(false);
      }, 5000);
    }
    if (createDocumentError) {
      setTimeout(() => {
        setCreateDocumentError(null);
      }, 5000);
    }
    setFile(null);
    setUploadProgress(0);
    setDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "TA",
      referencedClientDocumentId: 0
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setCreateDocumentError("File quá lớn (tối đa 10MB)");
      return;
    }
    setCreateDocumentError(null);
    setFile(f);
    if (f) {
      setDocumentFormData(prev => ({ ...prev, fileName: f.name }));
    }
  };

  const handleDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumentFormData(prev => ({
      ...prev,
      [name]: name === 'documentTypeId' || name === 'referencedClientDocumentId'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !file || !documentFormData.documentTypeId) return;

    setSubmittingDocument(true);
    setCreateDocumentError(null);
    setCreateDocumentSuccess(false);

    try {
      // Lấy userId từ token hoặc user context
      let uploadedByUserId: string | null = null;
      
      // Thử lấy từ user context trước
      if (user?.id) {
        uploadedByUserId = user.id;
      } else {
        // Nếu không có, lấy từ token
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const decoded = decodeJWT(token);
            if (decoded) {
              // JWT payload có nameid là userId
              uploadedByUserId = decoded.nameid || decoded.sub || decoded.userId || decoded.uid || null;
            }
          } catch (error) {
            console.error('Error decoding JWT:', error);
          }
        }
      }
      
      if (!uploadedByUserId) {
        throw new Error('Không xác định được người dùng (uploadedByUserId). Vui lòng đăng nhập lại.');
      }

      // Upload file lên Firebase
      const path = `partner-documents/${selectedPayment.id}/${Date.now()}_${file.name}`;
      const downloadURL = await uploadFile(file, path, setUploadProgress);

      // Tạo payload
      const payload: PartnerDocumentCreate = {
        partnerContractPaymentId: selectedPayment.id,
        documentTypeId: documentFormData.documentTypeId,
        referencedClientDocumentId: documentFormData.referencedClientDocumentId || null,
        fileName: file.name,
        filePath: downloadURL,
        uploadedByUserId,
        description: documentFormData.description || null,
        source: documentFormData.source || null
      };

      await partnerDocumentService.create(payload);
      setCreateDocumentSuccess(true);

      // Close modal after 3 seconds để người dùng có thời gian nhìn thấy thông báo thành công
      setTimeout(() => {
        handleCloseCreateDocumentModal();
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setCreateDocumentError(error.response?.data?.message || error.message || 'Không thể tạo tài liệu');
    } finally {
      setSubmittingDocument(false);
    }
  };

  // Mapping tiến trình theo status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PendingCalculation':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PendingApproval':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Paid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PendingCalculation':
        return 'Chờ tính toán';
      case 'PendingApproval':
        return 'Chờ duyệt';
      case 'Rejected':
        return 'Từ chối';
      case 'Approved':
        return 'Đã duyệt';
      case 'Paid':
        return 'Đã chi trả';
      default:
        return status;
    }
  };

  const filteredPayments = (statusFilter === 'ALL')
    ? payments
    : payments.filter(p => (p.status || '').toLowerCase() === statusFilter.toString().toLowerCase());

  const statusCounts = payments.reduce<Record<string, number>>((acc, p) => {
    const s = p.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff TA" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kỳ Thanh Toán Nhân Sự</h1>
          <p className="text-neutral-600 mt-1">Chọn nhân sự để xem các kỳ thanh toán</p>
        </div>

        {/* Danh sách đối tác */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách nhân sự có hợp đồng</h2>
          {loadingPartners ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải danh sách nhân sự...
            </div>
          ) : partners.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">Chưa có nhân sự nào có hợp đồng</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {partners.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => {
                    setSelectedPartnerId(partner.id);
                    setActivePeriodId(null);
                    setPayments([]);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPartnerId === partner.id
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className={`w-5 h-5 mt-0.5 ${
                      selectedPartnerId === partner.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        selectedPartnerId === partner.id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {partner.companyName}
                      </div>
                      {partner.taxCode && (
                        <div className="text-xs text-gray-500 mt-1">Mã số thuế: {partner.taxCode}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Danh sách kỳ thanh toán */}
        {selectedPartnerId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Kỳ thanh toán - {selectedPartner?.companyName}
              </h2>
            </div>
            {loadingPeriods ? (
              <div className="flex items-center justify-center py-10 text-gray-600">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
                Đang tải kỳ thanh toán...
              </div>
            ) : periods.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500 text-sm">Chưa có kỳ thanh toán nào</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {periods
                  .sort((a, b) => {
                    if (a.periodYear !== b.periodYear) return a.periodYear - b.periodYear;
                    return a.periodMonth - b.periodMonth;
                  })
                  .map(period => (
                    <button
                      key={period.id}
                      onClick={() => onSelectPeriod(period.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        activePeriodId === period.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-5 h-5 ${
                          activePeriodId === period.id ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${
                            activePeriodId === period.id ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            {monthNames[period.periodMonth - 1]} / {period.periodYear}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Trạng thái: {period.status}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Chi tiết thanh toán */}
        {selectedPartnerId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết thanh toán</h2>
              {payments.length > 0 && (
                <select
                  className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                  value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as string | 'ALL')}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  {Object.keys(statusCounts).map(s => (
                    <option key={s} value={s}>{getStatusLabel(s)} ({statusCounts[s]})</option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Thông báo thành công/thất bại ngoài modal */}
            {createDocumentSuccess && !showCreateDocumentModal && (
              <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 font-medium">✅ Tạo tài liệu thành công!</p>
              </div>
            )}
            {createDocumentError && !showCreateDocumentModal && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 font-medium">{createDocumentError}</p>
              </div>
            )}
            
            {!activePeriodId ? (
              <div className="text-gray-500 text-sm">Chọn một kỳ thanh toán để xem chi tiết</div>
            ) : loadingPayments ? (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3" />
                Đang tải khoản thanh toán...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-gray-500 text-sm">Chưa có dữ liệu thanh toán cho kỳ này</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-3 border-b text-left">ID</th>
                      <th className="p-3 border-b text-left">Hợp đồng</th>
                      <th className="p-3 border-b text-left">Nhân sự</th>
                      <th className="p-3 border-b text-left">Giờ thực tế</th>
                      <th className="p-3 border-b text-left">OT</th>
                      <th className="p-3 border-b text-left">Tính toán</th>
                      <th className="p-3 border-b text-left">Đã chi</th>
                      <th className="p-3 border-b text-left">Trạng thái</th>
                      <th className="p-3 border-b text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(p => {
                      const contract = contractsMap.get(p.partnerContractId);
                      const talent = talentsMap.get(p.talentId);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">{p.id}</td>
                          <td className="p-3">
                            {contract ? (
                              <Link
                                to={`/ta/contracts/${p.partnerContractId}`}
                                className="text-primary-600 hover:text-primary-800 hover:underline font-medium transition-colors"
                              >
                                {contract.contractNumber || p.partnerContractId}
                              </Link>
                            ) : (
                              p.partnerContractId
                            )}
                          </td>
                          <td className="p-3">{talent?.fullName || p.talentId}</td>
                          <td className="p-3">{p.actualWorkHours}</td>
                          <td className="p-3">{p.otHours ?? "-"}</td>
                          <td className="p-3">{p.calculatedAmount ?? "-"}</td>
                          <td className="p-3">{p.paidAmount ?? "-"}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                              {getStatusLabel(p.status)}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleOpenCreateDocumentModal(p)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-2 transition-all"
                            >
                              <FileUp className="w-4 h-4" />
                              Tạo tài liệu
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal tạo tài liệu */}
        {showCreateDocumentModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tạo tài liệu mới</h2>
                <button
                  onClick={handleCloseCreateDocumentModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {createDocumentSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Tạo tài liệu thành công! Modal sẽ tự động đóng sau 3 giây.</p>
                </div>
              )}

              {createDocumentError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{createDocumentError}</p>
                </div>
              )}

              <form onSubmit={handleCreateDocument} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hợp đồng
                    </label>
                    <input
                      type="text"
                      value={contractsMap.get(selectedPayment.partnerContractId)?.contractNumber || selectedPayment.partnerContractId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhân sự
                    </label>
                    <input
                      type="text"
                      value={talentsMap.get(selectedPayment.talentId)?.fullName || selectedPayment.talentId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partner Contract Payment ID
                    </label>
                    <input
                      type="text"
                      value={selectedPayment.id}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại tài liệu <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="documentTypeId"
                      value={documentFormData.documentTypeId}
                      onChange={handleDocumentFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      disabled={loadingDocumentTypes}
                    >
                      <option value="0">-- Chọn loại tài liệu --</option>
                      {documentTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.typeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referenced Client Document ID
                    </label>
                    <input
                      type="number"
                      name="referencedClientDocumentId"
                      value={documentFormData.referencedClientDocumentId || ""}
                      onChange={handleDocumentFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      name="source"
                      value={documentFormData.source}
                      onChange={handleDocumentFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      placeholder="TA / Email / Portal ..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50 hover:bg-primary-50">
                    {file ? (
                      <div className="flex flex-col items-center text-primary-700">
                        <FileUp className="w-8 h-8 mb-2" />
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <p className="text-sm text-gray-600 mt-1">Đang upload: {uploadProgress}%</p>
                        )}
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Xóa file
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                        <Upload className="w-12 h-12 mb-4" />
                        <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file vào đây</span>
                        <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={onFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={documentFormData.description}
                    onChange={handleDocumentFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Mô tả tài liệu"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseCreateDocumentModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDocument || !file || !documentFormData.documentTypeId}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingDocument ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Tạo tài liệu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRPartnerPeriods;

