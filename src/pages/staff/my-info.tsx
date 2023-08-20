import {
  Button,
  Cascader,
  Form,
  Input,
  Select,
  Skeleton,
  Typography,
} from 'antd';
import { first, last } from 'lodash-es';
import { useState } from 'react';

import { useGetMyStaffInfo, useUpdateMyStaffInfo } from '@/api';
import { SingleUploadDragger } from '@/components';
import { LOCATION_CASCADER_OPTIONS } from '@/constants';
import { useAuthStore } from '@/context';
import { ManageGarageLayout } from '@/layouts';
import { requiredRule } from '@/services';
import { showSuccess } from '@/utils';

export default function StaffMyInfoPage() {
  const [form] = Form.useForm();

  const [, dispatch] = useAuthStore();
  
  const [isInEditMode, setIsInEditMode] = useState(false);

  const { isLoading, refetch, data } = useGetMyStaffInfo({
    onSuccess: (data) => {
      form.setFieldsValue({
        ...data,
        address: [data.provinceId, data.districtId],
      });
    },
  });

  const { mutateAsync: updateInfo } = useUpdateMyStaffInfo({
    onSuccess: () => showSuccess('Cập nhật thông tin thành công!'),
  });

  return (
    <div>
      <Skeleton active loading={isLoading}>
        <div className="flex gap-2">
          <Typography.Title level={2} className="mt-0 pt-0 font-bold">
            Thông tin của tôi
          </Typography.Title>
        </div>
        <p>Quản lý thông tin thông tin để bảo mật tài khoản</p>

        <Form
          form={form}
          className="flex gap-10 mt-4"
          labelCol={{ span: 6 }}
          labelAlign="left"
          disabled={!isInEditMode}
          onFinish={async (values) => {
            await updateInfo({
              body: {
                ...data,
                ...values,
                districtId: last(values?.address),
                provinceId: first(values?.address),
              },
            });

            await refetch();

            dispatch({
              type: 'UPDATE_AVATAR',
              payload: { linkImage: values?.linkImage },
            });
            
            setIsInEditMode(false);
          }}
        >
          <div className="shrink-0 min-w-[620px]">
            <Form.Item label="Tên" name="name" rules={[requiredRule()]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="emailAddress"
              rules={[requiredRule()]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[requiredRule()]}
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

            <Form.Item name="address" rules={[requiredRule()]} label="Địa chỉ">
              <Cascader
                size="large"
                options={LOCATION_CASCADER_OPTIONS}
                placeholder="Địa chỉ"
                showSearch={{
                  filter: (inputValue, path) =>
                    path.some(
                      (option) =>
                        (option.label || '')
                          .toString()
                          .toLowerCase()
                          .indexOf(inputValue.toLowerCase()) > -1
                    ),
                }}
              />
            </Form.Item>

            <Form.Item
              label="Chi tiết địa chỉ"
              name="addressDetail"
              rules={[requiredRule()]}
            >
              <Input />
            </Form.Item>

            <div className="text-center">
              {isInEditMode ? (
                <Button
                  type="primary"
                  htmlType="submit"
                  className="min-w-[150px]"
                >
                  Lưu
                </Button>
              ) : (
                <Button
                  type="primary"
                  disabled={false}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsInEditMode(true);
                  }}
                >
                  Sửa thông tin
                </Button>
              )}
            </div>
          </div>

          <div>
            <Form.Item name="linkImage">
              <SingleUploadDragger
                disabled={!isInEditMode}
                // folder={`users/${user?.userID}/images`}
              />
            </Form.Item>
          </div>
        </Form>
      </Skeleton>
    </div>
  );
}

StaffMyInfoPage.Layout = ManageGarageLayout;
