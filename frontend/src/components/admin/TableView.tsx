import DataTable from 'datatables.net-react';
import type { DataTableProps } from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import { ChevronBarLeft, ChevronBarRight, ChevronDoubleLeft, ChevronDoubleRight, Dot } from 'react-bootstrap-icons';
import { renderToStaticMarkup } from 'react-dom/server';

DataTable.use(DT);

export interface OrderTable {
    code: string;
    time: string;
    customer: string;
    shop: string;
    product: string;
    notes: string;
    lab: string;
    workshop: string;
    status: string;
}

interface TableViewProps {
    orders: OrderTable[];
    columns: DataTableProps['columns'];
}

export function TableView({ orders, columns }: TableViewProps) {
    return (
        <DataTable
            data={orders}
            columns={columns}
            className="table align-middle"
            options={{
                pageLength: 10,
                info: false,
                searching: false,
                lengthChange: false,
                paging: false,
                language: {
                    zeroRecords: 'Không tìm thấy dữ liệu',
                },
            }}

            slots={{
                0: (_: unknown, row: OrderTable) => (
                    <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">#{row.code}</span>
                            <Dot />
                            <span className="small text-body-secondary">{row.time}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">{row.customer}</span>
                            <span className="small text-body-secondary">({row.shop})</span>
                        </div>
                    </div>
                ),
                1: (_: unknown, row: OrderTable) => (
                    <div className="d-flex flex-column gap-1">
                        <div className="d-flex flex-wrap align-items-baseline gap-2">
                            <span className="fw-semibold">{row.product}</span>
                            <span className="small text-body-secondary">Nốt: {row.notes}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold opacity-75">{row.lab}</span>
                            <Dot />
                            <span className="small text-body-secondary">{row.workshop}</span>
                        </div>
                    </div>
                ),
                2: (_: unknown, row: OrderTable) => (
                    <div className='text-center'>
                        <span className="badge text-bg-warning">{row.status}</span>

                    </div>
                ),
            }}
        >
            <thead>
                <tr >
                    <th className="text-center">Đơn hàng</th>
                    <th className="text-center">Sản phẩm</th>
                    <th className="text-center">Trạng thái</th>
                </tr>
            </thead>
        </DataTable>
    );
}