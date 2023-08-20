import { Button, Result, Skeleton, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { get, isNil } from 'lodash-es';
import { useRouter } from 'next/router';

import { useAdminGetRegisteredSubscriptions } from '@/api/useAdminGetRegisteredSubscriptions';
import { ManageGarageLayout } from '@/layouts';

const PAID_STATUS = {
  waiting: 'Đợi thanh toán',
  paid: 'Đã thanh toán',
  fail: 'Thanh toán không thành công',
};

const message = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
  '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
  '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
  '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
};

export default function ManageGarageTransactionPage() {
  const { query, push } = useRouter();
  const { garageId, vnp_ResponseCode } = query as {
    garageId: string;
    vnp_ResponseCode: string;
  };

  const { data, isLoading } = useAdminGetRegisteredSubscriptions({
    garageId: +garageId,
    enabled: !isNil(garageId),
  });

  return (
    <div>
      {!vnp_ResponseCode && (
        <Typography.Title level={3}>Giao dịch</Typography.Title>
      )}

      <Skeleton active loading={isLoading && !isNil(garageId)}>
        {vnp_ResponseCode ? (
          <Result
            status={vnp_ResponseCode === '00' ? 'success' : 'error'}
            title={get(message, vnp_ResponseCode)}
            extra={[
              <Button
                type="primary"
                key="console"
                onClick={() => {
                  push('/my-garages');
                }}
              >
                Về trang quản lý garage
              </Button>,
              // <Button key="buy">Buy Again</Button>,
            ]}
          />
        ) : (
          <Table
            columns={[
              { title: 'Tên gói', render: (_, item) => item.name },
              { title: 'Thời hạn', render: (_, item) => item.period },
              {
                title: 'Giá',
                render: (_, item) =>
                  Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(item.price),
              },
              {
                title: 'Ngày mua',
                render: (_, item) =>
                  dayjs(item.dateCreate).format('DD-MM-YYYY'),
              },
              {
                title: 'Ngày hết hạn',
                render: (_, item) =>
                  dayjs(item.expirationDate).format('DD-MM-YYYY'),
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
            dataSource={data}
          />
        )}
      </Skeleton>
    </div>
  );
}

ManageGarageTransactionPage.Layout = ManageGarageLayout;
