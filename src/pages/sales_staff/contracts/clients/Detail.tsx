// import { useEffect, useState, type ReactNode } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Calendar,
//   Building2,
//   Briefcase,
//   User,
//   FileText,
//   DollarSign,
//   FileCheck,
//   StickyNote,
//   XCircle,
//   X,
//   Send,
//   Loader2,
//   Eye,
//   Download,
// } from "lucide-react";
// import Sidebar from "../../../../components/common/Sidebar";
// import { sidebarItems } from "../../../../components/sales_staff/SidebarItems";
// import {
//   clientContractPaymentService,
//   type ClientContractPaymentModel,
//   type SubmitContractModel,
// } from "../../../../services/ClientContractPayment";
// import { projectPeriodService, type ProjectPeriodModel } from "../../../../services/ProjectPeriod";
// import { talentAssignmentService, type TalentAssignmentModel } from "../../../../services/TalentAssignment";
// import { projectService } from "../../../../services/Project";
// import { clientCompanyService } from "../../../../services/ClientCompany";
// import { partnerService } from "../../../../services/Partner";
// import { talentService } from "../../../../services/Talent";
// import { clientDocumentService, type ClientDocument, type ClientDocumentCreate } from "../../../../services/ClientDocument";
// import { documentTypeService, type DocumentType } from "../../../../services/DocumentType";
// import { uploadFile } from "../../../../utils/firebaseStorage";
// import { useAuth } from "../../../../contexts/AuthContext";
// import { decodeJWT } from "../../../../services/Auth";
// import { getAccessToken } from "../../../../utils/storage";

// const formatDate = (value?: string | null): string => {
//   if (!value) return "—";
//   try {
//     return new Date(value).toLocaleDateString("vi-VN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   } catch {
//     return value;
//   }
// };

// const formatCurrency = (value?: number | null): string => {
//   if (value === null || value === undefined) return "—";
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(value);
// };

// const contractStatusConfigMap: Record<
//   string,
//   {
//     label: string;
//     color: string;
//     bgColor: string;
//     icon: ReactNode;
//   }
// > = {
//   Draft: {
//     label: "Nháp",
//     color: "text-gray-800",
//     bgColor: "bg-gray-50 border border-gray-200",
//     icon: <FileText className="w-4 h-4" />,
//   },
//   NeedMoreInformation: {
//     label: "Cần thêm thông tin",
//     color: "text-yellow-800",
//     bgColor: "bg-yellow-50 border border-yellow-200",
//     icon: <Clock className="w-4 h-4" />,
//   },
//   Submitted: {
//     label: "Đã gửi",
//     color: "text-blue-800",
//     bgColor: "bg-blue-50 border border-blue-200",
//     icon: <FileCheck className="w-4 h-4" />,
//   },
//   Verified: {
//     label: "Đã xác minh",
//     color: "text-purple-800",
//     bgColor: "bg-purple-50 border border-purple-200",
//     icon: <CheckCircle className="w-4 h-4" />,
//   },
//   Approved: {
//     label: "Đã duyệt",
//     color: "text-green-800",
//     bgColor: "bg-green-50 border border-green-200",
//     icon: <CheckCircle className="w-4 h-4" />,
//   },
//   Rejected: {
//     label: "Từ chối",
//     color: "text-red-800",
//     bgColor: "bg-red-50 border border-red-200",
//     icon: <XCircle className="w-4 h-4" />,
//   },
// };

// const paymentStatusConfigMap: Record<
//   string,
//   {
//     label: string;
//     color: string;
//     bgColor: string;
//   }
// > = {
//   Pending: {
//     label: "Chờ thanh toán",
//     color: "text-gray-800",
//     bgColor: "bg-gray-50 border border-gray-200",
//   },
//   Processing: {
//     label: "Đang xử lý",
//     color: "text-yellow-800",
//     bgColor: "bg-yellow-50 border border-yellow-200",
//   },
//   Invoiced: {
//     label: "Đã xuất hóa đơn",
//     color: "text-blue-800",
//     bgColor: "bg-blue-50 border border-blue-200",
//   },
//   PartiallyPaid: {
//     label: "Đã thanh toán một phần",
//     color: "text-orange-800",
//     bgColor: "bg-orange-50 border border-orange-200",
//   },
//   Paid: {
//     label: "Đã thanh toán",
//     color: "text-green-800",
//     bgColor: "bg-green-50 border border-green-200",
//   },
// };

// const getContractStatusConfig = (status: string) => {
//   return (
//     contractStatusConfigMap[status] ?? {
//       label: status,
//       color: "text-neutral-700",
//       bgColor: "bg-neutral-100 border border-neutral-200",
//       icon: <AlertCircle className="w-4 h-4" />,
//     }
//   );
// };

// const getPaymentStatusConfig = (status: string) => {
//   return (
//     paymentStatusConfigMap[status] ?? {
//       label: status,
//       color: "text-neutral-700",
//       bgColor: "bg-neutral-100 border border-neutral-200",
//     }
//   );
// };

// export default function ClientContractDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [contractPayment, setContractPayment] = useState<ClientContractPaymentModel | null>(null);
//   const [projectPeriod, setProjectPeriod] = useState<ProjectPeriodModel | null>(null);
//   const [talentAssignment, setTalentAssignment] = useState<TalentAssignmentModel | null>(null);
//   const [projectName, setProjectName] = useState<string>("—");
//   const [clientCompanyName, setClientCompanyName] = useState<string>("—");
//   const [partnerName, setPartnerName] = useState<string>("—");
//   const [talentName, setTalentName] = useState<string>("—");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [clientDocuments, setClientDocuments] = useState<ClientDocument[]>([]);
//   const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());
//   const [activeDocumentTab, setActiveDocumentTab] = useState<number | "all">("all");
//   const [activeMainTab, setActiveMainTab] = useState<string>("contract");

//   // Modal states
//   const [showSubmitContractModal, setShowSubmitContractModal] = useState(false);

//   // Form states
//   const [submitForm, setSubmitForm] = useState<Omit<SubmitContractModel, 'sowExcelFileUrl'>>({
//     unitPriceForeignCurrency: 0,
//     currencyCode: "USD",
//     exchangeRate: 1,
//     calculationMethod: "Percentage",
//     percentageValue: null,
//     fixedAmount: null,
//     plannedAmount: null,
//     sowDescription: null,
//     monthlyRate: 0,
//     standardHours: 160,
//     notes: null,
//   });

//   // File states
//   const [sowExcelFile, setSowExcelFile] = useState<File | null>(null);

//   // Loading states
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Get current user
//   const authContext = useAuth();
//   const user = authContext?.user || null;

//   // Helper to get current user ID from JWT
//   const getCurrentUserId = (): string | null => {
//     const token = getAccessToken();
//     if (!token) {
//       // Fallback to user.id from context if token not available
//       return user?.id || null;
//     }
//     const payload = decodeJWT(token);
//     // Try multiple possible fields in JWT payload
//     const userId = payload?.nameid || payload?.sub || payload?.userId || payload?.uid;
//     // Fallback to user.id from context if JWT doesn't have userId
//     return userId || user?.id || null;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!id) {
//           setError("ID hợp đồng không hợp lệ");
//           setLoading(false);
//           return;
//         }

//         // Fetch contract payment
//         const paymentData = await clientContractPaymentService.getById(Number(id));
//         setContractPayment(paymentData);

//         // Fetch related data in parallel
//         const [periodData, assignmentData] = await Promise.all([
//           projectPeriodService.getById(paymentData.projectPeriodId).catch(() => null),
//           talentAssignmentService.getById(paymentData.talentAssignmentId).catch(() => null),
//         ]);

//         setProjectPeriod(periodData);
//         setTalentAssignment(assignmentData);

//         // Fetch project info
//         if (assignmentData) {
//           try {
//             const project = await projectService.getById(assignmentData.projectId);
//             setProjectName(project?.name || paymentData.projectName || "—");
//           } catch {
//             setProjectName(paymentData.projectName || "—");
//           }

//           // Fetch client company info
//           try {
//             const project = await projectService.getById(assignmentData.projectId);
//             if (project?.clientCompanyId) {
//               const company = await clientCompanyService.getById(project.clientCompanyId);
//               setClientCompanyName(company?.name || paymentData.clientCompanyName || "—");
//             } else {
//               setClientCompanyName(paymentData.clientCompanyName || "—");
//             }
//           } catch {
//             setClientCompanyName(paymentData.clientCompanyName || "—");
//           }

//           // Fetch partner info
//           try {
//             const partner = await partnerService.getDetailedById(assignmentData.partnerId);
//             setPartnerName(partner?.companyName || paymentData.partnerName || "—");
//           } catch {
//             setPartnerName(paymentData.partnerName || "—");
//           }

//           // Fetch talent info
//           try {
//             const talent = await talentService.getById(assignmentData.talentId);
//             setTalentName(talent?.fullName || paymentData.talentName || "—");
//           } catch {
//             setTalentName(paymentData.talentName || "—");
//           }
//         } else {
//           // Fallback to navigation properties if assignment not found
//           setProjectName(paymentData.projectName || "—");
//           setClientCompanyName(paymentData.clientCompanyName || "—");
//           setPartnerName(paymentData.partnerName || "—");
//           setTalentName(paymentData.talentName || "—");
//         }
//       } catch (err: unknown) {
//         console.error("❌ Lỗi tải thông tin hợp đồng thanh toán khách hàng:", err);
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Không thể tải thông tin hợp đồng thanh toán khách hàng"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   // Load document types
//   useEffect(() => {
//     const loadDocumentTypes = async () => {
//       try {
//         const data = await documentTypeService.getAll({ excludeDeleted: true });
//         const types = Array.isArray(data) ? data : (data?.items || []);
//         const typesMap = new Map<number, DocumentType>();
//         types.forEach((type: DocumentType) => {
//           typesMap.set(type.id, type);
//         });
//         setDocumentTypes(typesMap);
//       } catch (err: any) {
//         console.error("❌ Lỗi tải loại tài liệu:", err);
//       }
//     };
//     loadDocumentTypes();
//   }, []);

//   // Load client documents
//   useEffect(() => {
//     const loadClientDocuments = async () => {
//       if (!id) return;
//       try {
//         const data = await clientDocumentService.getAll({
//           clientContractPaymentId: Number(id),
//           excludeDeleted: true,
//         });
//         const documents = Array.isArray(data) ? data : (data?.items || []);
//         setClientDocuments(documents);
//       } catch (err: any) {
//         console.error("❌ Lỗi tải tài liệu khách hàng:", err);
//       }
//     };
//     loadClientDocuments();
//   }, [id]);

//   // Refresh contract payment data
//   const refreshContractPayment = async () => {
//     if (!id) return;
//     try {
//       const paymentData = await clientContractPaymentService.getById(Number(id));
//       setContractPayment(paymentData);
//     } catch (err) {
//       console.error("❌ Lỗi refresh hợp đồng:", err);
//     }
//   };

//   // Calculate FinalAmountVND
//   const calculateFinalAmountVND = () => {
//     if (submitForm.calculationMethod === "Percentage") {
//       if (submitForm.percentageValue && submitForm.unitPriceForeignCurrency && submitForm.exchangeRate) {
//         return (submitForm.unitPriceForeignCurrency * submitForm.exchangeRate) * (submitForm.percentageValue / 100);
//       }
//       return null;
//     } else {
//       // FixedAmount - need to get from plannedAmount or calculate
//       return submitForm.plannedAmount || null;
//     }
//   };

//   // Handler: Submit Contract
//   const handleSubmitContract = async () => {
//     if (!id || !contractPayment || !sowExcelFile) {
//       alert("Vui lòng upload file Excel SOW");
//       return;
//     }
//     if (!submitForm.unitPriceForeignCurrency || !submitForm.exchangeRate) {
//       alert("Vui lòng điền đầy đủ thông tin đơn giá và tỷ giá");
//       return;
//     }
//     if (submitForm.calculationMethod === "Percentage" && !submitForm.percentageValue) {
//       alert("Vui lòng nhập giá trị phần trăm");
//       return;
//     }
//     try {
//       setIsProcessing(true);
//       const userId = getCurrentUserId();
//       if (!userId) {
//         alert("Không thể lấy thông tin người dùng");
//         return;
//       }

//       // Upload SOW Excel file first
//       const filePath = `client-sow/${contractPayment.id}/sow_${Date.now()}.${sowExcelFile.name.split('.').pop()}`;
//       const fileUrl = await uploadFile(sowExcelFile, filePath);

//       // Prepare submit payload with all required fields
//       // Backend expects all fields with default values (0 or empty string), not null
//       const submitPayload: SubmitContractModel = {
//         unitPriceForeignCurrency: submitForm.unitPriceForeignCurrency,
//         currencyCode: submitForm.currencyCode,
//         exchangeRate: submitForm.exchangeRate,
//         calculationMethod: submitForm.calculationMethod,
//         percentageValue: submitForm.calculationMethod === "Percentage" ? (submitForm.percentageValue ?? 0) : 0,
//         fixedAmount: submitForm.calculationMethod === "FixedAmount" ? (submitForm.plannedAmount ?? 0) : 0,
//         plannedAmount: submitForm.plannedAmount ?? 0,
//         sowDescription: submitForm.sowDescription ?? "",
//         sowExcelFileUrl: fileUrl, // URL của file đã upload
//         monthlyRate: submitForm.monthlyRate,
//         standardHours: submitForm.standardHours,
//         notes: submitForm.notes ?? "",
//       };

//       // Create ClientDocument for SOW
//       const documentPayload: ClientDocumentCreate = {
//         clientContractPaymentId: Number(id),
//         documentTypeId: 1, // Assuming 1 is for "SOW" type
//         fileName: sowExcelFile.name,
//         filePath: fileUrl,
//         uploadedByUserId: userId,
//         description: "Statement of Work (SOW)",
//         source: "Sales",
//       };
//       await clientDocumentService.create(documentPayload);

//       // Submit contract
//       await clientContractPaymentService.submitContract(Number(id), submitPayload);
//       alert("Gửi hợp đồng thành công!");
//       await refreshContractPayment();
//       setShowSubmitContractModal(false);
//       setSubmitForm({
//         unitPriceForeignCurrency: 0,
//         currencyCode: "USD",
//         exchangeRate: 1,
//         calculationMethod: "Percentage",
//         percentageValue: null,
//         fixedAmount: null,
//         plannedAmount: null,
//         sowDescription: null,
//         monthlyRate: contractPayment.monthlyRate || 0,
//         standardHours: contractPayment.standardHours || 160,
//         notes: null,
//       });
//       setSowExcelFile(null);
//     } catch (err: unknown) {
//       alert(err instanceof Error ? err.message : "Lỗi khi gửi hợp đồng");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex bg-gray-50 min-h-screen">
//         <Sidebar items={sidebarItems} title="Sales Staff" />
//         <div className="flex-1 flex justify-center items-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
//             <p className="text-gray-500">Đang tải thông tin hợp đồng...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !contractPayment) {
//     return (
//       <div className="flex bg-gray-50 min-h-screen">
//         <Sidebar items={sidebarItems} title="Sales Staff" />
//         <div className="flex-1 flex justify-center items-center">
//           <div className="text-center max-w-md">
//             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <AlertCircle className="w-8 h-8 text-red-500" />
//             </div>
//             <p className="text-red-500 text-lg font-medium mb-2">
//               {error || "Không tìm thấy hợp đồng"}
//             </p>
//             <button
//               onClick={() => navigate(-1)}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition"
//             >
//               ← Quay lại
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const contractStatusConfig = getContractStatusConfig(contractPayment.contractStatus);
//   const paymentStatusConfig = getPaymentStatusConfig(contractPayment.paymentStatus);

//   return (
//     <div className="flex bg-gray-50 min-h-screen">
//       <Sidebar items={sidebarItems} title="Sales Staff" />

//       <div className="flex-1 p-8">
//         {/* Header */}
//         <div className="mb-8 animate-slide-up">
//           <div className="flex items-center gap-4 mb-6">
//             <button
//               onClick={() => navigate(-1)}
//               className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
//             >
//               <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
//               <span className="font-medium">Quay lại</span>
//             </button>
//           </div>

//           <div className="flex justify-between items-start gap-6 flex-wrap">
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 Hợp đồng #{contractPayment.contractNumber}
//               </h1>
//               <p className="text-neutral-600 mb-4">
//                 Thông tin chi tiết hợp đồng thanh toán khách hàng
//               </p>
//               <div className="flex items-center gap-3 flex-wrap">
//                 <div
//                   className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${contractStatusConfig.bgColor}`}
//                 >
//                   {contractStatusConfig.icon}
//                   <span className={`text-sm font-medium ${contractStatusConfig.color}`}>
//                     {contractStatusConfig.label}
//                   </span>
//                 </div>
//                 <div
//                   className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${paymentStatusConfig.bgColor}`}
//                 >
//                   <span className={`text-sm font-medium ${paymentStatusConfig.color}`}>
//                     {paymentStatusConfig.label}
//                   </span>
//                 </div>
//                 {contractPayment.isFinished && (
//                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200">
//                     <CheckCircle className="w-4 h-4 text-green-600" />
//                     <span className="text-sm font-medium text-green-800">Đã hoàn thành</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               {/* Action Buttons for Sales */}
//               {user?.role === "Staff Sales" && contractPayment.contractStatus === "NeedMoreInformation" && (
//                 <button
//                   onClick={() => {
//                     // Pre-fill form with contract payment data
//                     setSubmitForm({
//                       unitPriceForeignCurrency: contractPayment.unitPriceForeignCurrency || 0,
//                       currencyCode: contractPayment.currencyCode || "USD",
//                       exchangeRate: contractPayment.exchangeRate || 1,
//                       calculationMethod: contractPayment.calculationMethod || "Percentage",
//                       percentageValue: contractPayment.percentageValue ?? null,
//                       fixedAmount: null,
//                       plannedAmount: contractPayment.plannedAmount ?? null,
//                       sowDescription: contractPayment.sowDescription ?? null,
//                       monthlyRate: contractPayment.monthlyRate || 0,
//                       standardHours: contractPayment.standardHours || 160,
//                       notes: contractPayment.notes ?? null,
//                     });
//                     setShowSubmitContractModal(true);
//                   }}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//                 >
//                   <Send className="w-4 h-4" />
//                   Gửi hợp đồng
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Content with Tabs */}
//         <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
//           {/* Tab Headers */}
//           <div className="border-b border-neutral-200">
//             <div className="flex overflow-x-auto scrollbar-hide">
//               <button
//                 onClick={() => setActiveMainTab("contract")}
//                 className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
//                   activeMainTab === "contract"
//                     ? "border-primary-600 text-primary-600 bg-primary-50"
//                     : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
//                 }`}
//               >
//                 <FileText className="w-4 h-4" />
//                 Thông tin hợp đồng
//               </button>
//               <button
//                 onClick={() => setActiveMainTab("payment")}
//                 className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
//                   activeMainTab === "payment"
//                     ? "border-primary-600 text-primary-600 bg-primary-50"
//                     : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
//                 }`}
//               >
//                 <DollarSign className="w-4 h-4" />
//                 Thanh toán
//               </button>
//               <button
//                 onClick={() => setActiveMainTab("documents")}
//                 className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
//                   activeMainTab === "documents"
//                     ? "border-primary-600 text-primary-600 bg-primary-50"
//                     : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
//                 }`}
//               >
//                 <FileText className="w-4 h-4" />
//                 Tài liệu
//               </button>
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="p-6">
//             {/* Tab: Thông tin hợp đồng */}
//             {activeMainTab === "contract" && (
//               <div className="space-y-6">
//                 {/* Thông tin hợp đồng */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="p-2 bg-primary-100 rounded-lg">
//                       <FileText className="w-5 h-5 text-primary-600" />
//                     </div>
//                     <h2 className="text-xl font-semibold text-gray-900">
//                       Thông tin hợp đồng
//                     </h2>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InfoItem
//                   icon={<FileText className="w-4 h-4" />}
//                   label="Số hợp đồng"
//                   value={contractPayment.contractNumber}
//                 />
//                 <InfoItem
//                   icon={<FileText className="w-4 h-4" />}
//                   label="Trạng thái hợp đồng"
//                   value={
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${contractStatusConfig.bgColor} ${contractStatusConfig.color}`}>
//                       {contractStatusConfig.label}
//                     </span>
//                   }
//                 />
//                 <InfoItem
//                   icon={<FileText className="w-4 h-4" />}
//                   label="Trạng thái thanh toán"
//                   value={
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatusConfig.bgColor} ${paymentStatusConfig.color}`}>
//                       {paymentStatusConfig.label}
//                     </span>
//                   }
//                 />
//                 {contractPayment.isFinished && (
//                   <InfoItem
//                     icon={<CheckCircle className="w-4 h-4" />}
//                     label="Trạng thái hoàn thành"
//                     value={
//                       <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-800 border border-green-200">
//                         Đã hoàn thành
//                       </span>
//                     }
//                   />
//                 )}
//                 <InfoItem
//                   icon={<Calendar className="w-4 h-4" />}
//                   label="Ngày bắt đầu hợp đồng"
//                   value={formatDate(contractPayment.contractStartDate)}
//                 />
//                 <InfoItem
//                   icon={<Calendar className="w-4 h-4" />}
//                   label="Ngày kết thúc hợp đồng"
//                   value={formatDate(contractPayment.contractEndDate)}
//                 />
//                   </div>
//                 </div>

//                 {/* Thông tin chung */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="p-2 bg-primary-100 rounded-lg">
//                       <FileText className="w-5 h-5 text-primary-600" />
//                     </div>
//                     <h2 className="text-xl font-semibold text-gray-900">
//                       Thông tin chung
//                     </h2>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InfoItem
//                   icon={<Building2 className="w-4 h-4" />}
//                   label="Công ty khách hàng"
//                   value={clientCompanyName}
//                 />
//                 <InfoItem
//                   icon={<Briefcase className="w-4 h-4" />}
//                   label="Dự án"
//                   value={projectName}
//                 />
//                 <InfoItem
//                   icon={<User className="w-4 h-4" />}
//                   label="Nhân sự"
//                   value={talentName}
//                 />
//                 <InfoItem
//                   icon={<Building2 className="w-4 h-4" />}
//                   label="Đối tác"
//                   value={partnerName}
//                 />
//                 {projectPeriod && (
//                   <InfoItem
//                     icon={<Calendar className="w-4 h-4" />}
//                     label="Chu kỳ thanh toán"
//                     value={`Tháng ${projectPeriod.periodMonth}/${projectPeriod.periodYear}`}
//                   />
//                 )}
//                 {talentAssignment && (
//                   <>
//                     <InfoItem
//                       icon={<Calendar className="w-4 h-4" />}
//                       label="Ngày bắt đầu assignment"
//                       value={formatDate(talentAssignment.startDate)}
//                     />
//                     <InfoItem
//                       icon={<Calendar className="w-4 h-4" />}
//                       label="Ngày kết thúc assignment"
//                       value={talentAssignment.endDate ? formatDate(talentAssignment.endDate) : "Đang hiệu lực"}
//                     />
//                   </>
//                 )}
//                 <InfoItem
//                   icon={<Calendar className="w-4 h-4" />}
//                   label="Ngày tạo"
//                   value={formatDate(contractPayment.createdAt)}
//                 />
//                 {contractPayment.updatedAt && (
//                   <InfoItem
//                     icon={<Calendar className="w-4 h-4" />}
//                     label="Ngày cập nhật"
//                     value={formatDate(contractPayment.updatedAt)}
//                   />
//                 )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Tab: Thanh toán */}
//             {activeMainTab === "payment" && (
//               <div className="space-y-6">
//                 {/* Thông tin tiền tệ và tỷ giá */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="p-2 bg-primary-100 rounded-lg">
//                       <DollarSign className="w-5 h-5 text-primary-600" />
//                     </div>
//                     <h2 className="text-xl font-semibold text-gray-900">
//                       Thông tin tiền tệ và tỷ giá
//                     </h2>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InfoItem
//                   icon={<DollarSign className="w-4 h-4" />}
//                   label="Đơn giá ngoại tệ"
//                   value={`${contractPayment.unitPriceForeignCurrency.toLocaleString("vi-VN")} ${contractPayment.currencyCode}`}
//                 />
//                 <InfoItem
//                   icon={<DollarSign className="w-4 h-4" />}
//                   label="Tỷ giá"
//                   value={contractPayment.exchangeRate.toLocaleString("vi-VN")}
//                 />
//                 <InfoItem
//                   icon={<FileText className="w-4 h-4" />}
//                   label="Phương pháp tính"
//                   value={contractPayment.calculationMethod === "Percentage" ? "Theo phần trăm" : "Số tiền cố định"}
//                 />
//                 {contractPayment.calculationMethod === "Percentage" && contractPayment.percentageValue !== null && contractPayment.percentageValue !== undefined && (
//                   <InfoItem
//                     icon={<FileText className="w-4 h-4" />}
//                     label="Giá trị phần trăm"
//                     value={`${contractPayment.percentageValue}%`}
//                   />
//                 )}
//                   </div>
//                 </div>

//                 {/* Thông tin thanh toán */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="p-2 bg-primary-100 rounded-lg">
//                       <DollarSign className="w-5 h-5 text-primary-600" />
//                     </div>
//                     <h2 className="text-xl font-semibold text-gray-900">
//                       Thông tin thanh toán
//                     </h2>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InfoItem
//                   icon={<DollarSign className="w-4 h-4" />}
//                   label="Mức lương/tháng (Legacy)"
//                   value={formatCurrency(contractPayment.monthlyRate)}
//                 />
//                 <InfoItem
//                   icon={<Clock className="w-4 h-4" />}
//                   label="Số giờ tiêu chuẩn"
//                   value={`${contractPayment.standardHours} giờ`}
//                 />
//                 {contractPayment.reportedHours !== null && contractPayment.reportedHours !== undefined && (
//                   <InfoItem
//                     icon={<Clock className="w-4 h-4" />}
//                     label="Số giờ đã báo cáo"
//                     value={`${contractPayment.reportedHours} giờ`}
//                   />
//                 )}
//                 {contractPayment.billableHours !== null && contractPayment.billableHours !== undefined && (
//                   <InfoItem
//                     icon={<Clock className="w-4 h-4" />}
//                     label="Số giờ có thể thanh toán"
//                     value={`${contractPayment.billableHours} giờ`}
//                   />
//                 )}
//                 {contractPayment.manMonthCoefficient !== null && contractPayment.manMonthCoefficient !== undefined && (
//                   <InfoItem
//                     icon={<FileText className="w-4 h-4" />}
//                     label="Hệ số man-month"
//                     value={contractPayment.manMonthCoefficient.toFixed(4)}
//                   />
//                 )}
//                 {contractPayment.plannedAmount !== null && contractPayment.plannedAmount !== undefined && (
//                   <InfoItem
//                     icon={<DollarSign className="w-4 h-4" />}
//                     label="Số tiền dự kiến"
//                     value={formatCurrency(contractPayment.plannedAmount)}
//                   />
//                 )}
//                 {contractPayment.finalAmountVND !== null && contractPayment.finalAmountVND !== undefined && (
//                   <InfoItem
//                     icon={<DollarSign className="w-4 h-4" />}
//                     label="Số tiền cuối cùng (VND)"
//                     value={formatCurrency(contractPayment.finalAmountVND)}
//                   />
//                 )}
//                 {contractPayment.finalAmount !== null && contractPayment.finalAmount !== undefined && (
//                   <InfoItem
//                     icon={<DollarSign className="w-4 h-4" />}
//                     label="Số tiền cuối cùng"
//                     value={formatCurrency(contractPayment.finalAmount)}
//                   />
//                 )}
//                 <InfoItem
//                   icon={<DollarSign className="w-4 h-4" />}
//                   label="Tổng đã thanh toán"
//                   value={formatCurrency(contractPayment.totalPaidAmount)}
//                 />
//                 {contractPayment.invoiceNumber && (
//                   <InfoItem
//                     icon={<FileCheck className="w-4 h-4" />}
//                     label="Số hóa đơn"
//                     value={contractPayment.invoiceNumber}
//                   />
//                 )}
//                 {contractPayment.invoiceDate && (
//                   <InfoItem
//                     icon={<Calendar className="w-4 h-4" />}
//                     label="Ngày hóa đơn"
//                     value={formatDate(contractPayment.invoiceDate)}
//                   />
//                 )}
//                 {contractPayment.lastPaymentDate && (
//                   <InfoItem
//                     icon={<Calendar className="w-4 h-4" />}
//                     label="Ngày thanh toán gần nhất"
//                     value={formatDate(contractPayment.lastPaymentDate)}
//                   />
//                 )}
//               </div>

//               {contractPayment.sowDescription && (
//                 <div className="mt-6 pt-6 border-t border-neutral-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FileText className="w-4 h-4 text-neutral-400" />
//                     <p className="text-sm font-medium text-neutral-600">Mô tả SOW</p>
//                   </div>
//                   <p className="text-gray-900 whitespace-pre-wrap">{contractPayment.sowDescription}</p>
//                 </div>
//               )}

//               {contractPayment.rejectionReason && (
//                 <div className="mt-6 pt-6 border-t border-neutral-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <XCircle className="w-4 h-4 text-red-400" />
//                     <p className="text-sm font-medium text-red-600">Lý do từ chối</p>
//                   </div>
//                   <p className="text-gray-900 whitespace-pre-wrap">{contractPayment.rejectionReason}</p>
//                 </div>
//               )}

//                   {contractPayment.notes && (
//                     <div className="mt-6 pt-6 border-t border-neutral-200">
//                       <div className="flex items-center gap-2 mb-2">
//                         <StickyNote className="w-4 h-4 text-neutral-400" />
//                         <p className="text-sm font-medium text-neutral-600">Ghi chú</p>
//                       </div>
//                       <p className="text-gray-900 whitespace-pre-wrap">{contractPayment.notes}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Tab: Tài liệu */}
//             {activeMainTab === "documents" && (
//               <div>
//                 {clientDocuments.length > 0 ? (() => {
//                 // Get unique document types from documents
//                 const documentTypeIds = Array.from(new Set(clientDocuments.map(doc => doc.documentTypeId)));
//                 const availableTypes = documentTypeIds
//                   .map(id => documentTypes.get(id))
//                   .filter((type): type is DocumentType => type !== undefined);

//                 // Filter documents by active tab
//                 const filteredDocuments = activeDocumentTab === "all"
//                   ? clientDocuments
//                   : clientDocuments.filter(doc => doc.documentTypeId === activeDocumentTab);

//                   return (
//                     <div>
//                       <div className="flex items-center gap-2 mb-4">
//                         <FileText className="w-4 h-4 text-neutral-400" />
//                         <p className="text-sm font-medium text-neutral-600">Tài liệu khách hàng</p>
//                       </div>
                      
//                       {/* Tab Headers */}
//                       <div className="border-b border-neutral-200 mb-4">
//                         <div className="flex overflow-x-auto scrollbar-hide">
//                           <button
//                             onClick={() => setActiveDocumentTab("all")}
//                             className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
//                               activeDocumentTab === "all"
//                                 ? "border-primary-600 text-primary-600 bg-primary-50"
//                                 : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
//                             }`}
//                           >
//                             Tất cả
//                             <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
//                               {clientDocuments.length}
//                             </span>
//                           </button>
//                           {availableTypes.map((type) => {
//                             const count = clientDocuments.filter(doc => doc.documentTypeId === type.id).length;
//                             return (
//                               <button
//                                 key={type.id}
//                                 onClick={() => setActiveDocumentTab(type.id)}
//                                 className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
//                                   activeDocumentTab === type.id
//                                     ? "border-primary-600 text-primary-600 bg-primary-50"
//                                     : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
//                                 }`}
//                               >
//                                 {type.typeName}
//                                 <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
//                                   {count}
//                                 </span>
//                               </button>
//                             );
//                           })}
//                         </div>
//                       </div>

//                       {/* Documents List */}
//                       <div className="space-y-3">
//                         {filteredDocuments.length > 0 ? (
//                           filteredDocuments.map((doc) => {
//                             const docType = documentTypes.get(doc.documentTypeId);
//                             return (
//                               <div
//                                 key={doc.id}
//                                 className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
//                               >
//                                 <div className="flex-1">
//                                   <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
//                                   <div className="flex items-center gap-3 mt-1">
//                                     {docType && (
//                                       <span className="text-xs text-gray-500">
//                                         Loại: {docType.typeName}
//                                       </span>
//                                     )}
//                                     <span className="text-xs text-gray-500">
//                                       {formatDate(doc.uploadTimestamp)}
//                                     </span>
//                                   </div>
//                                   {doc.description && (
//                                     <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
//                                   )}
//                                 </div>
//                                 <div className="flex items-center gap-2 flex-shrink-0">
//                                   <a
//                                     href={doc.filePath}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
//                                   >
//                                     <Eye className="w-4 h-4" />
//                                     <span className="text-sm font-medium">Xem</span>
//                                   </a>
//                                   <a
//                                     href={doc.filePath}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     download
//                                     className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors whitespace-nowrap"
//                                   >
//                                     <Download className="w-4 h-4" />
//                                     <span className="text-sm font-medium">Tải xuống</span>
//                                   </a>
//                                 </div>
//                               </div>
//                             );
//                           })
//                         ) : (
//                           <p className="text-sm text-gray-500 text-center py-4">
//                             Không có tài liệu nào trong loại này
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })() : (
//                   <div className="text-center py-12">
//                     <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-500 text-lg">Chưa có tài liệu nào</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Submit Contract Modal */}
//       {showSubmitContractModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold">Gửi hợp đồng</h3>
//               <button onClick={() => setShowSubmitContractModal(false)} className="text-gray-400 hover:text-gray-600">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Đơn giá ngoại tệ <span className="text-red-500">*</span></label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={submitForm.unitPriceForeignCurrency}
//                     onChange={(e) => setSubmitForm({ ...submitForm, unitPriceForeignCurrency: parseFloat(e.target.value) || 0 })}
//                     className="w-full border rounded-lg p-2"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Mã tiền tệ</label>
//                   <select
//                     value={submitForm.currencyCode}
//                     onChange={(e) => setSubmitForm({ ...submitForm, currencyCode: e.target.value })}
//                     className="w-full border rounded-lg p-2"
//                   >
//                     <option value="USD">USD</option>
//                     <option value="EUR">EUR</option>
//                     <option value="VND">VND</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Tỷ giá <span className="text-red-500">*</span></label>
//                   <input
//                     type="number"
//                     step="0.0001"
//                     min="0"
//                     value={submitForm.exchangeRate}
//                     onChange={(e) => setSubmitForm({ ...submitForm, exchangeRate: parseFloat(e.target.value) || 0 })}
//                     className="w-full border rounded-lg p-2"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Phương pháp tính</label>
//                   <select
//                     value={submitForm.calculationMethod}
//                     onChange={(e) => setSubmitForm({ ...submitForm, calculationMethod: e.target.value, percentageValue: e.target.value === "Percentage" ? submitForm.percentageValue : null })}
//                     className="w-full border rounded-lg p-2"
//                   >
//                     <option value="Percentage">Theo phần trăm</option>
//                     <option value="FixedAmount">Số tiền cố định</option>
//                   </select>
//                 </div>
//                 {submitForm.calculationMethod === "Percentage" && (
//                   <div>
//                     <label className="block text-sm font-medium mb-2">Giá trị phần trăm (%)</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       max="100"
//                       value={submitForm.percentageValue || ""}
//                       onChange={(e) => setSubmitForm({ ...submitForm, percentageValue: parseFloat(e.target.value) || null })}
//                       className="w-full border rounded-lg p-2"
//                     />
//                   </div>
//                 )}
//                 {submitForm.calculationMethod === "FixedAmount" && (
//                   <div>
//                     <label className="block text-sm font-medium mb-2">Số tiền cố định (VND)</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       value={submitForm.plannedAmount || ""}
//                       onChange={(e) => setSubmitForm({ ...submitForm, plannedAmount: parseFloat(e.target.value) || null })}
//                       className="w-full border rounded-lg p-2"
//                     />
//                   </div>
//                 )}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Mức lương/tháng (Monthly Rate)</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={submitForm.monthlyRate}
//                     onChange={(e) => setSubmitForm({ ...submitForm, monthlyRate: parseFloat(e.target.value) || 0 })}
//                     className="w-full border rounded-lg p-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Số giờ tiêu chuẩn (Standard Hours)</label>
//                   <input
//                     type="number"
//                     step="1"
//                     min="0"
//                     value={submitForm.standardHours}
//                     onChange={(e) => setSubmitForm({ ...submitForm, standardHours: parseFloat(e.target.value) || 0 })}
//                     className="w-full border rounded-lg p-2"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">File Excel SOW <span className="text-red-500">*</span></label>
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls"
//                   onChange={(e) => setSowExcelFile(e.target.files?.[0] || null)}
//                   className="w-full border rounded-lg p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">Mô tả SOW</label>
//                 <textarea
//                   value={submitForm.sowDescription || ""}
//                   onChange={(e) => setSubmitForm({ ...submitForm, sowDescription: e.target.value || null })}
//                   className="w-full border rounded-lg p-2"
//                   rows={3}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">Ghi chú</label>
//                 <textarea
//                   value={submitForm.notes || ""}
//                   onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value || null })}
//                   className="w-full border rounded-lg p-2"
//                   rows={3}
//                 />
//               </div>
//               {submitForm.calculationMethod === "Percentage" && submitForm.unitPriceForeignCurrency && submitForm.exchangeRate && submitForm.percentageValue && (
//                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-sm font-medium text-blue-800">
//                     FinalAmountVND = ({submitForm.unitPriceForeignCurrency} × {submitForm.exchangeRate}) × ({submitForm.percentageValue} / 100) = {calculateFinalAmountVND()?.toLocaleString("vi-VN")} VND
//                   </p>
//                 </div>
//               )}
//             </div>
//             <div className="flex gap-3 justify-end mt-6">
//               <button
//                 onClick={() => {
//                   setShowSubmitContractModal(false);
//                   setSubmitForm({
//                     unitPriceForeignCurrency: 0,
//                     currencyCode: "USD",
//                     exchangeRate: 1,
//                     calculationMethod: "Percentage",
//                     percentageValue: null,
//                     fixedAmount: null,
//                     plannedAmount: null,
//                     sowDescription: null,
//                     monthlyRate: contractPayment.monthlyRate || 0,
//                     standardHours: contractPayment.standardHours || 160,
//                     notes: null,
//                   });
//                   setSowExcelFile(null);
//                 }}
//                 className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={handleSubmitContract}
//                 disabled={isProcessing || !sowExcelFile || !submitForm.unitPriceForeignCurrency || !submitForm.exchangeRate || (submitForm.calculationMethod === "Percentage" && !submitForm.percentageValue)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gửi hợp đồng"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function InfoItem({
//   icon,
//   label,
//   value,
// }: {
//   icon?: ReactNode;
//   label: string;
//   value: string | ReactNode;
// }) {
//   return (
//     <div className="group">
//       <div className="flex items-center gap-2 mb-2">
//         {icon && <div className="text-neutral-400">{icon}</div>}
//         <p className="text-neutral-500 text-sm font-medium">{label}</p>
//       </div>
//       {typeof value === "string" ? (
//         <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
//           {value || "—"}
//         </p>
//       ) : (
//         <div className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
//           {value}
//         </div>
//       )}
//     </div>
//   );
// }
