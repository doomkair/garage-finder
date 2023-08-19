import { StopOutlined } from '@ant-design/icons';
import {
  Button,
  Cascader,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Table,
  Typography,
} from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Staff, useAddStaff, useBlockStaff, useGetStaffs } from '@/api';
import useDeleteStaff from '@/api/useDeleteStaff';
import { useUpdateStaff } from '@/api/useUpdateStaff';
import { SingleUploadDragger } from '@/components';
import { VIETNAM_PROVINCES } from '@/constants';
import { ManageGarageLayout } from '@/layouts';
import { confirmPasswordRule, emailRule, requiredRule } from '@/services';
import { showError } from '@/utils';

const locationCascaderOptions = VIETNAM_PROVINCES.map((province) => ({
  label: province.name,
  value: province.code,
  children: province.districts.map((district) => ({
    label: district.name,
    value: district.code,
  })),
}));

function UpsertStaffModalContent(props: {
  onCancel?: () => void;
  garageID: number;
  staff?: Staff;
}) {
  const { onCancel, garageID, staff } = props;

  const isUpdate = !!staff;

  const { mutateAsync: addStaff, isLoading: addingStaff } = useAddStaff({
    onError: showError,
  });

  const { mutateAsync: updateStaff, isLoading: updatingStaff } = useUpdateStaff(
    {
      onError: showError,
    }
  );

  return (
    <Form
      className="pt-6"
      layout="vertical"
      onFinish={async (values) => {
        if (isUpdate) {
          await updateStaff({
            body: {
              ...staff,
              ...values,
              provinceId: values?.address?.[0],
              districtId: values?.address?.[1],
              garageID,
            },
          });
        } else {
          await addStaff({
            body: {
              ...values,
              provinceId: values?.address?.[0],
              districtId: values?.address?.[1],
              garageID,
            },
          });
        }

        onCancel?.();
      }}
      initialValues={{
        ...staff,
        address: [staff?.provinceId, staff?.districtId],
      }}
    >
      <Typography.Title level={3} className="text-center mb-10">
        Thêm nhân viên
      </Typography.Title>

      <div className="flex gap-6">
        <div className="grow max-h-[60vh] overflow-scroll pr-4">
          <Form.Item
            label="ID Nhân viên"
            name="employeeId"
            rules={[requiredRule()]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Tên nhân viên" name="name" rules={[requiredRule()]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="emailAddress"
            rules={[requiredRule(), emailRule()]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Mật khẩu" name="password" rules={[requiredRule()]}>
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Nhập lại mật khẩu"
            name="retypePassword"
            rules={[requiredRule(), confirmPasswordRule()]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[requiredRule()]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Giới tính" name="gender" rules={[requiredRule()]}>
            <Select
              options={[
                { label: 'Nam', value: 'Nam' },
                { label: 'Nữ', value: 'Nữ' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address" rules={[requiredRule()]}>
            <Cascader options={locationCascaderOptions} />
          </Form.Item>

          <Form.Item
            label="Địa chỉ cụ thể"
            name="addressDetail"
            rules={[requiredRule()]}
          >
            <Input />
          </Form.Item>
        </div>

        <div>
          <Form.Item name="linkImage" label="Ảnh đại diện">
            <SingleUploadDragger />
          </Form.Item>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          className="min-w-[200px]"
          type="primary"
          htmlType="submit"
          disabled={addingStaff || updatingStaff}
          loading={addingStaff || updatingStaff}
        >
          {isUpdate ? 'Cập nhật' : 'Thêm'}
        </Button>
      </div>
    </Form>
  );
}

export default function GarageStaffManagementPage() {
  const { query } = useRouter();

  const {
    data: staffs,
    isLoading: fetchingStaffs,
    refetch,
  } = useGetStaffs({
    enabled: !isNaN(Number(query?.garageId)),
    id: Number(query?.garageId),
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: deleteStaff, isLoading: deletingStaff } =
    useDeleteStaff();

  const { mutateAsync: blockStaff, isLoading: blockingStaff } = useBlockStaff();

  const [staffInfo, setStaffInfo] = useState<Staff | null>(null);

  return (
    <>
      <div>
        <Typography.Title level={3}>Quản lý nhân viên</Typography.Title>

        <div className="flex justify-end mb-10">
          <Button type="primary" onClick={() => setOpen(true)}>
            Thêm nhân viên
          </Button>
        </div>

        <Skeleton active loading={fetchingStaffs || blockingStaff}>
          <Table
            loading={deletingStaff || fetchingStaffs}
            dataSource={staffs}
            columns={[
              { title: 'ID', dataIndex: 'employeeId' },
              { title: 'Tên', dataIndex: 'name' },
              { title: 'Email', dataIndex: 'emailAddress' },
              { title: 'Giới tính', dataIndex: 'gender' },
              { title: 'Số điện thoại', dataIndex: 'phoneNumber' },
              {
                title: 'Hành động',
                render: (_, item) => (
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-500 border-none text-white"
                      onClick={async () => {
                        setStaffInfo(item);
                        setOpen(true);
                      }}
                    >
                      Chi tiết
                    </Button>

                    <Button
                      className={
                        item.status === 'block'
                          ? 'bg-green-500 border-none text-white'
                          : 'bg-red-500 border-none text-white'
                      }
                      onClick={async () => {
                        await blockStaff({
                          body: {
                            staffID: item.staffId,
                            status: item.status === 'block' ? 'open' : 'block',
                          },
                        });
                        await refetch();
                      }}
                    >
                      {item.status === 'block' ? 'Mở khóa' : 'Khóa'}
                      <StopOutlined />
                    </Button>

                    <Button
                      className="bg-red-500 border-none text-white"
                      onClick={async () => {
                        await deleteStaff({ id: item.staffId });
                        await refetch();
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Skeleton>
      </div>

      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        width={900}
        destroyOnClose
      >
        <UpsertStaffModalContent
          onCancel={() => {
            setOpen(false);
            refetch();
          }}
          garageID={Number(query?.garageId)}
          staff={staffInfo ?? undefined}
        />
      </Modal>
    </>
  );
}

GarageStaffManagementPage.Layout = ManageGarageLayout;
