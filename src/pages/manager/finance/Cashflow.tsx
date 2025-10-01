import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
} from "recharts";
import { DollarSign } from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/manager/SidebarItems";

interface CashFlowData {
    summary: {
        currentBalance: number;
        cashInflow: number;
        cashOutflow: number;
        netCashFlow: number;
        operatingCashFlow: number;
        investingCashFlow: number;
        financingCashFlow: number;
        burnRate: number;
        runwayMonths: number;
    };
    dailyCashFlow: {
        date: string;
        inflow: number;
        outflow: number;
        balance: number;
    }[];
    monthlyCashFlow: {
        month: string;
        opening: number;
        inflow: number;
        outflow: number;
        closing: number;
        forecast: number;
    }[];
    cashFlowByCategory: {
        category: string;
        type: "inflow" | "outflow";
        amount: number;
        percentage: number;
        transactions: number;
    }[];
    bankAccounts: {
        id: number;
        name: string;
        bank: string;
        balance: number;
        type: "checking" | "savings" | "investment";
        lastActivity: string;
        status: "active" | "low" | "overdrawn";
    }[];
    upcomingTransactions: {
        id: number;
        description: string;
        type: "income" | "expense";
        amount: number;
        dueDate: string;
        status: "pending" | "scheduled" | "overdue";
        recurring: boolean;
    }[];
    cashFlowProjection: {
        month: string;
        optimistic: number;
        realistic: number;
        pessimistic: number;
    }[];
}

export default function CashFlow() {
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"daily" | "monthly" | "yearly">(
        "monthly"
    );
    const [cashFlowData, setCashFlowData] = useState<CashFlowData>({
        summary: {
            currentBalance: 0,
            cashInflow: 0,
            cashOutflow: 0,
            netCashFlow: 0,
            operatingCashFlow: 0,
            investingCashFlow: 0,
            financingCashFlow: 0,
            burnRate: 0,
            runwayMonths: 0,
        },
        dailyCashFlow: [],
        monthlyCashFlow: [],
        cashFlowByCategory: [],
        bankAccounts: [],
        upcomingTransactions: [],
        cashFlowProjection: [],
    });

    useEffect(() => {
        const mockData: CashFlowData = {
            summary: {
                currentBalance: 3500000000,
                cashInflow: 6800000000,
                cashOutflow: 5200000000,
                netCashFlow: 1600000000,
                operatingCashFlow: 1800000000,
                investingCashFlow: -150000000,
                financingCashFlow: -50000000,
                burnRate: 433000000,
                runwayMonths: 8,
            },
            dailyCashFlow: [
                {
                    date: "01/06",
                    inflow: 150000000,
                    outflow: 120000000,
                    balance: 3200000000,
                },
                {
                    date: "02/06",
                    inflow: 200000000,
                    outflow: 180000000,
                    balance: 3220000000,
                },
                {
                    date: "03/06",
                    inflow: 180000000,
                    outflow: 150000000,
                    balance: 3250000000,
                },
                {
                    date: "04/06",
                    inflow: 220000000,
                    outflow: 190000000,
                    balance: 3280000000,
                },
                {
                    date: "05/06",
                    inflow: 250000000,
                    outflow: 200000000,
                    balance: 3330000000,
                },
                {
                    date: "06/06",
                    inflow: 180000000,
                    outflow: 210000000,
                    balance: 3300000000,
                },
                {
                    date: "07/06",
                    inflow: 300000000,
                    outflow: 250000000,
                    balance: 3350000000,
                },
            ],
            monthlyCashFlow: [
                {
                    month: "T1",
                    opening: 2500000000,
                    inflow: 900000000,
                    outflow: 750000000,
                    closing: 2650000000,
                    forecast: 2600000000,
                },
                {
                    month: "T2",
                    opening: 2650000000,
                    inflow: 1050000000,
                    outflow: 850000000,
                    closing: 2850000000,
                    forecast: 2800000000,
                },
                {
                    month: "T3",
                    opening: 2850000000,
                    inflow: 1100000000,
                    outflow: 900000000,
                    closing: 3050000000,
                    forecast: 3000000000,
                },
                {
                    month: "T4",
                    opening: 3050000000,
                    inflow: 1200000000,
                    outflow: 950000000,
                    closing: 3300000000,
                    forecast: 3250000000,
                },
                {
                    month: "T5",
                    opening: 3300000000,
                    inflow: 1150000000,
                    outflow: 1000000000,
                    closing: 3450000000,
                    forecast: 3400000000,
                },
                {
                    month: "T6",
                    opening: 3450000000,
                    inflow: 1300000000,
                    outflow: 1050000000,
                    closing: 3700000000,
                    forecast: 3650000000,
                },
            ],
            cashFlowByCategory: [
                { category: 'Thanh toán từ khách hàng', type: 'inflow', amount: 4500000000, percentage: 66.2, transactions: 125 },
                { category: 'Đầu tư & vay vốn', type: 'inflow', amount: 1200000000, percentage: 17.6, transactions: 8 },
                { category: 'Thu nhập khác', type: 'inflow', amount: 1100000000, percentage: 16.2, transactions: 45 },
                { category: 'Lương & nhân sự', type: 'outflow', amount: 2800000000, percentage: 53.8, transactions: 180 },
                { category: 'Chi phí vận hành', type: 'outflow', amount: 1200000000, percentage: 23.1, transactions: 320 },
                { category: 'Thuế & phí', type: 'outflow', amount: 600000000, percentage: 11.5, transactions: 24 },
                { category: 'Đầu tư & mua sắm', type: 'outflow', amount: 400000000, percentage: 7.7, transactions: 15 },
            ],
            bankAccounts: [
                { id: 1, name: 'Tài khoản A', bank: 'Ngân hàng A', balance: 2000000000, type: 'checking', lastActivity: '02/06', status: 'active' },
                { id: 2, name: 'Tài khoản B', bank: 'Ngân hàng B', balance: 500000000, type: 'savings', lastActivity: '03/06', status: 'active' },
                { id: 3, name: 'Tài khoản C', bank: 'Ngân hàng C', balance: 1000000000, type: 'investment', lastActivity: '05/06', status: 'low' },
            ],
            upcomingTransactions: [
                { id: 1, description: 'Lương tháng 6', type: 'expense', amount: 500000000, dueDate: '10/06', status: 'scheduled', recurring: true },
                { id: 2, description: 'Tiền thu từ khách hàng A', type: 'income', amount: 1200000000, dueDate: '15/06', status: 'pending', recurring: false },
                { id: 3, description: 'Thuế thu nhập doanh nghiệp', type: 'expense', amount: 700000000, dueDate: '20/06', status: 'scheduled', recurring: false },
            ],
            cashFlowProjection: [
                { month: 'T1', optimistic: 3000000000, realistic: 2600000000, pessimistic: 2300000000 },
                { month: 'T2', optimistic: 3100000000, realistic: 2700000000, pessimistic: 2400000000 },
                { month: 'T3', optimistic: 3200000000, realistic: 2800000000, pessimistic: 2500000000 },
                { month: 'T4', optimistic: 3300000000, realistic: 2900000000, pessimistic: 2600000000 },
                { month: 'T5', optimistic: 3400000000, realistic: 3000000000, pessimistic: 2700000000 },
                { month: 'T6', optimistic: 3500000000, realistic: 3100000000, pessimistic: 2800000000 },
            ]
        };


        setTimeout(() => {
            setCashFlowData(mockData);
            setLoading(false);
        }, 1000);
    }, [viewMode]);

    const formatCurrency = (value: number) => {
        // Function to format the numbers
        return `${value.toLocaleString()}`;
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Manager" />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Tổng Quan Dòng Tiền
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Theo dõi và phân tích tình hình dòng tiền doanh nghiệp
                    </p>
                </div>

                {/* Period Selector */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setViewMode("daily")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "daily"
                            ? "bg-primary-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Hằng ngày
                    </button>
                    <button
                        onClick={() => setViewMode("monthly")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "monthly"
                            ? "bg-primary-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Hằng tháng
                    </button>
                    <button
                        onClick={() => setViewMode("yearly")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "yearly"
                            ? "bg-primary-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Hằng năm
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Cash Flow Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Dòng tiền vào</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(cashFlowData.summary.cashInflow)}
                                </p>
                            </div>

                            {/* Add other summary cards here */}
                        </div>

                        {/* Daily Cash Flow - Bar Chart */}
                        {viewMode === "daily" && (
                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Dòng Tiền Hằng Ngày
                                </h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={cashFlowData.dailyCashFlow}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                        <Legend />
                                        <Bar dataKey="inflow" name="Dòng tiền vào" fill="#22c55e" />
                                        <Bar dataKey="outflow" name="Dòng tiền ra" fill="#ef4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Monthly Cash Flow - Area Chart */}
                        {viewMode === "monthly" && (
                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Dòng Tiền Hằng Tháng
                                </h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={cashFlowData.monthlyCashFlow}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="inflow"
                                            name="Dòng tiền vào"
                                            stroke="#22c55e"
                                            fill="#22c55e"
                                            fillOpacity={0.3}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="outflow"
                                            name="Dòng tiền ra"
                                            stroke="#ef4444"
                                            fill="#ef4444"
                                            fillOpacity={0.3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Cash Flow Projection */}
                        <div className="bg-white rounded-2xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Dự báo dòng tiền
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={cashFlowData.cashFlowProjection}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area dataKey="optimistic" fill="#8b5cf6" />
                                    <Line type="monotone" dataKey="realistic" stroke="#6366f1" />
                                    <Line
                                        type="monotone"
                                        dataKey="pessimistic"
                                        stroke="#ef4444"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
