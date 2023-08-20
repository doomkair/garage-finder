import { Button, Descriptions, Image, Modal, Table } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { useGetListReport, useGetReportDetail } from '@/api';
import { AdminLayout } from '@/layouts';

function ReportModalContent(props: { id: string }) {
  const { id } = props;
  const { data } = useGetReportDetail({ variables: { params: { id } } });

  return (
    <>
      <Descriptions title="Chi tiết báo cáo">
        <Descriptions.Item label="Tên garage" span={3}>
          {data?.garageName}
        </Descriptions.Item>
        <Descriptions.Item label="Garage email" span={3}>
          {data?.garageMail}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian" span={3}>
          {dayjs(data?.date).format('DD/MM/YYYY hh:mm A')}
        </Descriptions.Item>
        <Descriptions.Item label="Nội dung" span={3}>
          {data?.reason}
        </Descriptions.Item>
      </Descriptions>
      <Image.PreviewGroup>
        <div className="grid gap-2 grid-cols-3">
          {data?.imageLink.map((item, idx) => (
            <Image src={item} key={idx} alt="" />
          ))}
        </div>
      </Image.PreviewGroup>
    </>
  );
}

export default function AdminReportPage() {
  const { data: reports, isLoading } = useGetListReport();
  const [open, setOpen] = useState(false);
  const [reportId, setReportId] = useState<null | string>(null);

  return (
    <div>
      <Table
        loading={isLoading}
        dataSource={reports}
        columns={[
          { title: 'STT', render: (_, __, ix) => ix + 1 },
          { title: 'Garage bị tố cáo', render: (_, item) => item.garageName },
          {
            title: 'Số điện thoại garage',
            render: (_, item) => item.garagePhone,
          },
          { title: 'Email garage', render: (_, item) => item.garageMail },
          {
            title: 'Email tài khoản tố cáo',
            render: (_, item) => item.userEmail,
          },
          {
            title: 'Thời gian',
            render: (_, item) => dayjs(item.date).format('DD/MM/YYYY hh:mm A'),
          },
          {
            title: '',
            render: (_, item) => (
              <Button
                type="primary"
                className="rounded-full"
                onClick={() => {
                  setOpen(true);
                  setReportId(item.reportID);
                }}
              >
                Chi tiết
              </Button>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        {reportId && <ReportModalContent id={reportId} />}
      </Modal>
    </div>
  );
}

AdminReportPage.Layout = AdminLayout;
