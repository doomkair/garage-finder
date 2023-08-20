import { Button, Form, Input, InputNumber, Modal, Table } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  useAddService,
  useDeleteService,
  useGetServices,
  useUpdateService,
} from '@/api';
import { ManageGarageLayout } from '@/layouts';

function AddModalContent(props: { onCancel: () => void }) {
  const { onCancel } = props;
  const [form] = Form.useForm();

  const { query } = useRouter();
  const { mutateAsync: addService, isLoading } = useAddService();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        await addService({
          body: {
            categoryGarageID: Number(query.categoryId),
            cost: `${values?.cost}`,
            nameService: values?.name,
            note: values?.note,
          },
        });

        form.resetFields();
        onCancel();
      }}
    >
      <Form.Item label="Tên dịch vụ" required name="name">
        <Input />
      </Form.Item>

      <Form.Item label="Giá" required name="cost">
        <Input className="w-full" />
      </Form.Item>

      <Form.Item label="Lưu ý" name="note">
        <Input.TextArea />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="w-full"
          disabled={isLoading}
          loading={isLoading}
        >
          Thêm
        </Button>
      </Form.Item>
    </Form>
  );
}

function UpdateModalContent(props: {
  onCancel: () => void;
  serviceID: number;
  nameService: string;
  cost: string;
  note: string;
}) {
  const { onCancel, serviceID, cost, nameService, note } = props;

  const { query } = useRouter();
  const { mutateAsync: addService, isLoading } = useUpdateService();

  return (
    <Form
      layout="vertical"
      initialValues={{
        name: nameService,
        cost,
        note,
      }}
      onFinish={async (values) => {
        await addService({
          body: {
            serviceID,
            categoryGarageID: Number(query.categoryId),
            cost: `${values?.cost}`,
            nameService: values?.name,
            note: values?.note,
          },
        });

        onCancel();
      }}
    >
      <Form.Item label="Tên dịch vụ" required name="name">
        <Input />
      </Form.Item>

      <Form.Item label="Giá" required name="cost">
        <InputNumber className="w-full" />
      </Form.Item>

      <Form.Item label="Lưu ý" name="note">
        <Input.TextArea />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="w-full"
          disabled={isLoading}
          loading={isLoading}
        >
          Cập nhật
        </Button>
      </Form.Item>
    </Form>
  );
}

export default function ServicesManagementPage() {
  const { query } = useRouter();

  const { data, refetch } = useGetServices({
    id: Number(query.categoryId),
    enabled: !!query.categoryId,
  });

  const [currentDeletingId, setCurrentDeletingId] = useState<number>();
  const { mutateAsync: deleteService, isLoading: deletingService } =
    useDeleteService();

  const [open, setOpen] = useState(false);

  const [updateModalVisile, setUpdateModalVisile] = useState(false);

  const [updatingItem, setUpdatingItem] = useState<{
    serviceID: number;
    nameService: string;
    categoryGarageID: number;
    cost: string;
    note: string;
  }>({} as any);

  return (
    <>
      <div>
        <div className="flex justify-end mb-10">
          <Button type="primary" onClick={() => setOpen(true)}>
            Thêm
          </Button>
        </div>

        <Table
          columns={[
            {
              title: 'STT',
              render: (_, item) => item.serviceID,
            },
            {
              title: 'Tên dịch vụ',
              render: (_, item) => item.nameService,
            },
            {
              title: 'Giá',
              render: (_, item) => item.cost,
            },
            {
              title: 'Ghi chú',
              render: (_, item) => item.note,
            },
            {
              title: 'Hành động',
              render: (_, item) => (
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setUpdatingItem(item);
                      setUpdateModalVisile(true);
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    type="primary"
                    className="bg-red-500 hover:bg-red-500/70"
                    onClick={async () => {
                      setCurrentDeletingId(item.serviceID);
                      await deleteService({ id: item.serviceID });
                      setCurrentDeletingId(undefined);
                      refetch();
                    }}
                    loading={
                      currentDeletingId === item.serviceID && deletingService
                    }
                    disabled={
                      currentDeletingId === item.serviceID && deletingService
                    }
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          dataSource={data}
        />
      </div>

      <Modal
        open={open}
        title="Thêm dịch vụ"
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <AddModalContent
          onCancel={() => {
            setOpen(false);
            refetch();
          }}
        />
      </Modal>

      <Modal
        open={updateModalVisile}
        title="Chỉnh sửa dịch vụ"
        onCancel={() => setUpdateModalVisile(false)}
        footer={null}
      >
        <UpdateModalContent
          {...updatingItem}
          onCancel={() => {
            setUpdateModalVisile(false);
            refetch();
          }}
        />
      </Modal>
    </>
  );
}

ServicesManagementPage.Layout = ManageGarageLayout;
