import { Table, Tag } from 'antd';

import { useGetInvoices } from '@/api';
import { AdminLayout } from '@/layouts';
import { getGarageDetailAddress } from '@/services';

const PAID_STATUS = {
  waiting: 'Đợi thanh toán',
  paid: 'Đã thanh toán',
  fail: 'Thanh toán không thành công',
};

export default function AdminManageSubscriptionsPage() {
  const { data: invoices, isLoading } = useGetInvoices();

  return (
    <div>
      <Table
        dataSource={invoices}
        columns={[
          {
            title: 'ID',
            render: (_, item) => item.invoicesID,
          },
          {
            title: 'Tên garage',
            render: (_, item) => item.garageName,
          },
          {
            title: 'Số điện thoại',
            render: (_, item) => item.garagePhone,
          },
          {
            title: 'Email garage',
            render: (_, item) => item.garageEmail,
          },
          {
            title: 'Địa chỉ',
            render: (_, item) => getGarageDetailAddress(item.garageAddress),
          },
          {
            title: 'Gói dịch vụ',
            render: (_, item) => item.name,
          },
          {
            title: 'Trạng thái',
            render: (_, item) => (
              <Tag className="rounded-full">
                {PAID_STATUS[item.status as keyof typeof PAID_STATUS]}
              </Tag>
            ),
          },
        ]}
      />
    </div>
  );
}

AdminManageSubscriptionsPage.Layout = AdminLayout;
