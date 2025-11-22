import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/admin/SidebarItems";
import { 
  ArrowLeft,
  History,
  Calendar,
  User,
  FileText,
  XCircle,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { auditLogService, type AuditLogModel } from "../../../services/AuditLog";
import { ROUTES } from "../../../router/routes";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatAction(action: string) {
  const actionMap: Record<string, string> = {
    'Create': 'Tạo mới',
    'Update': 'Cập nhật',
    'Delete': 'Xóa',
    'StatusChange': 'Thay đổi trạng thái',
    'TransferOwnership': 'Chuyển quyền sở hữu'
  };
  return actionMap[action] || action;
}

function getActionColor(action: string) {
  const colorMap: Record<string, string> = {
    'Create': 'bg-green-100 text-green-700 border-green-200',
    'Update': 'bg-blue-100 text-blue-700 border-blue-200',
    'Delete': 'bg-red-100 text-red-700 border-red-200',
    'StatusChange': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'TransferOwnership': 'bg-purple-100 text-purple-700 border-purple-200'
  };
  return colorMap[action] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function getActionIcon(action: string) {
  if (action === 'Create') return <CheckCircle className="w-5 h-5" />;
  if (action === 'Delete') return <XCircle className="w-5 h-5" />;
  if (action === 'StatusChange') return <AlertCircle className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
}

export default function AuditLogDetailPage() {
  const { entityName, entityId } = useParams<{ entityName: string; entityId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!entityName || !entityId) {
        setError("Thiếu thông tin entity");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await auditLogService.getEntityHistory(entityName, parseInt(entityId));
        setLogs(result.data || []);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải lịch sử audit log:", err);
        setError(err.message || "Không thể tải lịch sử audit log");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [entityName, entityId]);

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Admin" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải lịch sử...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Link
            to={ROUTES.ADMIN.AUDIT}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách Audit Log
          </Link>
          
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Lịch sử thay đổi: {entityName}
                </h1>
                <p className="text-neutral-600">
                  Entity ID: <span className="font-medium text-gray-900">{entityId}</span>
                </p>
              </div>
              <div className="p-4 bg-primary-100 rounded-full">
                <History className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Stats */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Tổng số thay đổi</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Thay đổi đầu tiên</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {logs.length > 0 ? formatDate(logs[logs.length - 1].changedAt) : '—'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Thay đổi gần nhất</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {logs.length > 0 ? formatDate(logs[0].changedAt) : '—'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <History className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không có lịch sử thay đổi nào cho entity này.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline items */}
                <div className="space-y-6">
                  {logs.map((log, index) => (
                    <div key={log.id} className="relative pl-20">
                      {/* Timeline dot */}
                      <div className={`absolute left-6 w-4 h-4 rounded-full border-2 border-white ${getActionColor(log.action).split(' ')[0]}`}></div>
                      
                      {/* Content card */}
                      <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-md ${getActionColor(log.action)}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getActionColor(log.action).split(' ')[0]}`}>
                              {getActionIcon(log.action)}
                            </div>
                            <div>
                              <div className="font-bold text-lg">{formatAction(log.action)}</div>
                              <div className="text-sm opacity-80 flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(log.changedAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User info */}
                        {log.changedBy && (
                          <div className="mb-4 flex items-center gap-2 text-sm">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{log.changedByName || log.changedBy}</span>
                            {log.changedByName && log.changedBy !== log.changedByName && (
                              <span className="text-gray-500">({log.changedBy})</span>
                            )}
                          </div>
                        )}

                        {/* Field changes */}
                        {log.fieldName && (
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-2 opacity-90">Trường: {log.fieldName}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/50 rounded-lg p-3">
                                <div className="text-xs font-medium text-red-700 mb-1">Giá trị cũ:</div>
                                <div className="text-sm break-words">{log.oldValue || '(trống)'}</div>
                              </div>
                              <div className="bg-white/50 rounded-lg p-3">
                                <div className="text-xs font-medium text-green-700 mb-1">Giá trị mới:</div>
                                <div className="text-sm break-words">{log.newValue || '(trống)'}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reason */}
                        {log.reason && (
                          <div className="mb-2">
                            <div className="text-sm font-medium opacity-90 mb-1">Lý do:</div>
                            <div className="text-sm bg-white/50 rounded-lg p-3">{log.reason}</div>
                          </div>
                        )}

                        {/* Metadata */}
                        {log.metaData && (
                          <details className="mt-4">
                            <summary className="text-sm font-medium opacity-90 cursor-pointer hover:opacity-100">
                              Metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-white/50 rounded-lg p-3 overflow-x-auto">
                              {JSON.stringify(JSON.parse(log.metaData), null, 2)}
                            </pre>
                          </details>
                        )}

                        {/* Log ID */}
                        <div className="mt-4 pt-4 border-t border-current/20">
                          <div className="text-xs opacity-70">Log ID: {log.id}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

